"""Shared input normalization and result rendering for scheduling solvers.

The web application publishes candidate arcs as JSON.  Solver implementations
consume the normalized objects in this module and never need to know which
pre-processing branch produced an arc.
"""

from __future__ import annotations

from dataclasses import dataclass, field
import json
from pathlib import Path
from typing import Any, Iterable


class SolverError(RuntimeError):
    """A user-facing solver configuration or input error."""


@dataclass(frozen=True)
class TaskSpec:
    key: str
    name: str
    priority: float = 1.0


@dataclass(frozen=True)
class Arc:
    index: int
    task_key: str
    task_name: str
    tracking_plan_id: str
    start: float
    end: float
    duration: float
    resources: tuple[str, ...]
    raw: dict[str, Any] = field(compare=False, hash=False)

    @property
    def weight(self) -> float:
        return self.duration


@dataclass(frozen=True)
class Problem:
    tasks: tuple[TaskSpec, ...]
    arcs: tuple[Arc, ...]

    @property
    def arcs_by_task(self) -> dict[str, tuple[Arc, ...]]:
        result: dict[str, list[Arc]] = {task.key: [] for task in self.tasks}
        for arc in self.arcs:
            result.setdefault(arc.task_key, []).append(arc)
        return {key: tuple(value) for key, value in result.items()}


def _read_json(path: str | Path) -> Any:
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise SolverError(f"输入文件不存在：{path}") from exc
    except (OSError, json.JSONDecodeError) as exc:
        raise SolverError(f"无法读取 JSON 输入：{path}") from exc


def _text(value: Any) -> str:
    return str(value or "").strip()


def _number(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _resource_ids(value: Any) -> tuple[str, ...]:
    if isinstance(value, str):
        values: Iterable[Any] = value.replace("，", ",").split(",")
    elif isinstance(value, list):
        values = value
    elif value:
        values = [value]
    else:
        values = []

    result: list[str] = []
    for item in values:
        if isinstance(item, dict):
            resource = (
                item.get("cekong_resource_id")
                or item.get("resource_id")
                or item.get("resourceName")
                or item.get("resource_name")
                or item.get("name")
                or item.get("cekong_station")
            )
        else:
            resource = item
        resource = _text(resource)
        if resource and resource not in result:
            result.append(resource)
    return tuple(result)


def _task_specs(task_payload: Any) -> tuple[TaskSpec, ...]:
    if not isinstance(task_payload, dict):
        raise SolverError("任务 JSON 必须是对象")
    heads = task_payload.get("taskFormHeadList") or []
    specs: list[TaskSpec] = []
    for item in heads:
        if not isinstance(item, dict):
            continue
        key = _text(item.get("key") or item.get("taskKey") or item.get("taskName"))
        name = _text(item.get("taskName") or key)
        if not key or not name:
            continue
        specs.append(TaskSpec(key=key, name=name, priority=_number(item.get("priority"), 1.0)))
    if not specs:
        raise SolverError("任务 JSON 中没有可调度任务")
    return tuple(specs)


def load_problem(task_path: str | Path, arc_paths: Iterable[str | Path]) -> Problem:
    tasks = _task_specs(_read_json(task_path))
    by_key = {task.key: task for task in tasks}
    by_name = {task.name: task for task in tasks}
    arcs: list[Arc] = []
    for path in arc_paths:
        payload = _read_json(path)
        if not isinstance(payload, list):
            continue
        for raw in payload:
            if not isinstance(raw, dict):
                continue
            task_name = _text(raw.get("task_name") or raw.get("taskName"))
            task_key = _text(raw.get("task_key") or raw.get("taskKey"))
            task = by_key.get(task_key) or by_name.get(task_name)
            if task is None and task_name:
                task = TaskSpec(key=task_name, name=task_name, priority=1.0)
                by_key[task.key] = task
            if task is None:
                continue
            start = _number(raw.get("start_time") or raw.get("startTime"))
            end = _number(raw.get("end_time") or raw.get("endTime"))
            if end <= start:
                continue
            plan_id = _text(raw.get("tracking_plan_id") or raw.get("trackingPlanId") or raw.get("id"))
            if not plan_id:
                continue
            resources = _resource_ids(
                raw.get("cekong_resource") or raw.get("resources") or raw.get("resource")
            )
            if not resources:
                continue
            duration = _number(raw.get("duration"), end - start)
            # Preprocessing emits the feasible visibility interval and requested
            # task duration separately. A selected task only occupies the first
            # requested-duration slice, not the entire visibility interval.
            occupied_end = start + duration if duration > 0 and start + duration <= end else end
            arcs.append(Arc(
                index=len(arcs),
                task_key=task.key,
                task_name=task.name,
                tracking_plan_id=plan_id,
                start=start,
                end=occupied_end,
                duration=occupied_end - start,
                resources=resources,
                raw=raw,
            ))
    if not arcs:
        raise SolverError("预处理结果中没有可用候选弧段")
    return Problem(tasks=tuple(by_key.values()), arcs=tuple(arcs))


def overlaps(left: Arc, right: Arc) -> bool:
    if not set(left.resources).intersection(right.resources):
        return False
    return left.start < right.end and right.start < left.end


def conflict_pairs(arcs: Iterable[Arc]) -> list[tuple[int, int]]:
    values = list(arcs)
    return [(left.index, right.index) for offset, left in enumerate(values) for right in values[offset + 1:]
            if left.task_key != right.task_key and overlaps(left, right)]


def render_result(problem: Problem, selected: Iterable[Arc], *, algorithm: str, status: str = "optimal", objective: float | None = None, diagnostics: dict[str, Any] | None = None) -> dict[str, Any]:
    selected_by_task = {arc.task_key: arc for arc in selected}
    rows: list[dict[str, Any]] = []
    text_rows: list[str] = ["############################# 调度结果 #############################", "飞控事件ID | 是否分配 | 开始时间 | 结束时间 | 选择的弧段ID", "--------------------------------------------------------------------------------"]
    for task in problem.tasks:
        arc = selected_by_task.get(task.key)
        if arc is None:
            rows.append({"task_key": task.key, "task_name": task.name, "status": "否", "arc_id": ""})
            text_rows.append(f"{task.name} | 否 | - | - | -")
            continue
        rows.append({
            "task_key": task.key, "task_name": task.name, "status": "是",
            "start_time": arc.start, "end_time": arc.end, "arc_id": arc.tracking_plan_id,
            "resources": list(arc.resources), "tracking_plan_id": arc.tracking_plan_id,
        })
        text_rows.append(f"{task.name} | 是 | {arc.start:.2f} | {arc.end:.2f} | {arc.tracking_plan_id}")
    text_rows.append(f"使用的弧段总数：{len(selected_by_task)}")
    data = {
        "algorithm": algorithm, "status": status, "objective": objective,
        "selected_count": len(selected_by_task), "rows": rows,
        "output_text": "\n".join(text_rows),
    }
    if diagnostics:
        data.update(diagnostics)
    return data
