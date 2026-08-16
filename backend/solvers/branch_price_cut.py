"""Restricted column-generation/branch-price-cut scheduler.

The original reference implementation uses CPLEX and a legacy TXT schema.
This adapter keeps its useful idea (candidate columns plus conflict cuts) while
operating directly on the web application's normalized JSON arcs.
"""

from __future__ import annotations

from dataclasses import dataclass
from time import monotonic
from typing import Any, Iterable

from .scheduling import Arc, Problem, conflict_pairs, overlaps, render_result


@dataclass(frozen=True)
class CandidateColumn:
    """One feasible resource plan used as a restricted-master column."""

    arcs: tuple[Arc, ...]

    @property
    def task_keys(self) -> frozenset[str]:
        return frozenset(arc.task_key for arc in self.arcs)


def _column_key(arcs: Iterable[Arc]) -> tuple[int, ...]:
    return tuple(sorted(arc.index for arc in arcs))


def _build_candidate_columns(problem: Problem, *, max_column_size: int = 4, max_columns: int = 2000) -> list[CandidateColumn]:
    """Generate resource-feasible plan columns for the restricted master.

    Singleton columns make every input arc eligible.  Pricing then grows each
    station/resource sequence with later non-overlapping arcs, yielding the
    multi-task plan columns used by the branch-and-price master problem.
    """
    columns: dict[tuple[int, ...], CandidateColumn] = {}

    def add_column(arcs: list[Arc]) -> bool:
        key = _column_key(arcs)
        if key not in columns:
            columns[key] = CandidateColumn(tuple(sorted(arcs, key=lambda arc: arc.start)))
        return len(columns) < max_columns

    for arc in problem.arcs:
        add_column([arc])

    resource_ids = sorted({resource for arc in problem.arcs for resource in arc.resources})
    for resource in resource_ids:
        resource_arcs = sorted(
            [arc for arc in problem.arcs if resource in arc.resources],
            key=lambda arc: (arc.start, arc.end, arc.index),
        )

        def price(prefix: list[Arc], candidates: list[Arc]) -> bool:
            if len(prefix) >= 2 and not add_column(prefix):
                return False
            if len(prefix) >= max_column_size:
                return True
            for index, arc in enumerate(candidates):
                if arc.task_key in {item.task_key for item in prefix}:
                    continue
                if any(overlaps(arc, item) for item in prefix):
                    continue
                if not price([*prefix, arc], candidates[index + 1:]):
                    return False
            return True

        if not price([], resource_arcs):
            break
    return list(columns.values())


def _columns_conflict(left: CandidateColumn, right: CandidateColumn) -> bool:
    if left.task_keys.intersection(right.task_keys):
        return True
    return any(overlaps(left_arc, right_arc) for left_arc in left.arcs for right_arc in right.arcs)


def _score(selected: list[CandidateColumn], priorities: dict[str, float], target: str) -> tuple[float, float, float]:
    arcs = [arc for column in selected for arc in column.arcs]
    priority = sum(priorities.get(arc.task_key, 1.0) for arc in arcs)
    completed = float(len(arcs))
    occupied = -sum(arc.duration for arc in arcs)
    return (completed, occupied, priority) if target == "1" else (priority, completed, occupied)


def solve(problem: Problem, *, target: str = "2", max_iterations: int = 100_000, time_limit: float = 30.0) -> dict[str, Any]:
    priorities = {task.key: task.priority for task in problem.tasks}
    # The restricted master selects resource-plan columns. Pairwise resource
    # conflicts are cuts; branching chooses a column covering the next task or
    # leaves that task unserved when the supply cannot satisfy every request.
    columns = _build_candidate_columns(problem)
    columns_by_task: dict[str, list[CandidateColumn]] = {task.key: [] for task in problem.tasks}
    for column in columns:
        for task_key in column.task_keys:
            columns_by_task.setdefault(task_key, []).append(column)
    task_order = sorted(problem.tasks, key=lambda item: (item.priority, len(columns_by_task.get(item.key, ())), item.key), reverse=True)
    all_conflicts = [(left, right) for offset, left in enumerate(columns) for right in columns[offset + 1:]
                     if _columns_conflict(left, right)]
    best: list[CandidateColumn] = []
    branch_nodes = 0
    deadline = monotonic() + time_limit
    exhausted = False

    def search(position: int, selected: list[CandidateColumn], covered: frozenset[str]) -> None:
        nonlocal best, branch_nodes, exhausted
        if branch_nodes >= max_iterations or monotonic() >= deadline:
            exhausted = True
            return
        branch_nodes += 1
        if position == len(task_order):
            if _score(selected, priorities, target) > _score(best, priorities, target):
                best = list(selected)
            return

        task = task_order[position]
        if task.key in covered:
            search(position + 1, selected, covered)
            return
        compatible = [
            column for column in columns_by_task.get(task.key, ())
            if not column.task_keys.intersection(covered)
            and not any(_columns_conflict(column, chosen) for chosen in selected)
        ]
        # Try productive, longer route columns first; the empty branch keeps
        # partial schedules feasible in supply-constrained cases.
        for column in sorted(compatible, key=lambda item: (-len(item.arcs), sum(arc.duration for arc in item.arcs))):
            search(position + 1, [*selected, column], covered.union(column.task_keys))
            if exhausted:
                return
        search(position + 1, selected, covered)

    search(0, [], frozenset())
    selected_arcs = sorted([arc for column in best for arc in column.arcs], key=lambda arc: (arc.start, arc.task_name))
    covered = {arc.task_key for arc in selected_arcs}
    status = "time_limit_feasible" if exhausted else ("optimal" if len(covered) == len(problem.tasks) else "feasible_partial")
    return render_result(
        problem, selected_arcs, algorithm="branch_price_cut", status=status,
        objective=sum(priorities.get(arc.task_key, 1.0) for arc in selected_arcs),
        diagnostics={"branch_nodes": branch_nodes, "generated_columns": len(columns),
                     "selected_columns": len(best), "conflict_cuts": len(all_conflicts),
                     "conflict_pairs": len(conflict_pairs(problem.arcs)),
                     "time_limit": time_limit, "target": target},
    )
