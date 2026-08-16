import json

import pytest

from solvers import SolverError, load_problem
from solvers import branch_price_cut, copt_scheduler
from solvers.scheduling import conflict_pairs


def write_problem(tmp_path, tasks, arcs):
    task_path = tmp_path / "tasks.json"
    arc_path = tmp_path / "arcs.json"
    task_path.write_text(
        json.dumps({"taskFormHeadList": tasks}, ensure_ascii=False),
        encoding="utf-8",
    )
    arc_path.write_text(json.dumps(arcs, ensure_ascii=False), encoding="utf-8")
    return load_problem(task_path, [arc_path])


def arc(task, plan, start, end, resource):
    return {
        "task_name": task,
        "tracking_plan_id": plan,
        "start_time": start,
        "end_time": end,
        "duration": end - start,
        "cekong_resource": [{"cekong_resource_id": resource}],
    }


def test_branch_price_cut_uses_conflict_cuts_and_priorities(tmp_path):
    problem = write_problem(
        tmp_path,
        [
            {"key": "a", "taskName": "任务 A", "priority": 3},
            {"key": "b", "taskName": "任务 B", "priority": 1},
            {"key": "c", "taskName": "任务 C", "priority": 2},
        ],
        [
            arc("任务 A", "A-1", 0, 10, "R-1"),
            arc("任务 B", "B-1", 2, 12, "R-1"),
            arc("任务 C", "C-1", 2, 12, "R-2"),
        ],
    )

    result = branch_price_cut.solve(problem, target="2")

    assigned = {row["task_key"] for row in result["rows"] if row["status"] == "是"}
    assert assigned == {"a", "c"}
    assert result["conflict_pairs"] == 1
    assert "飞控事件ID | 是否分配" in result["output_text"]
    assert "使用的弧段总数：2" in result["output_text"]


def test_branch_price_cut_returns_partial_result_when_a_task_has_no_arc(tmp_path):
    problem = write_problem(
        tmp_path,
        [
            {"key": "a", "taskName": "任务 A", "priority": 1},
            {"key": "b", "taskName": "任务 B", "priority": 1},
        ],
        [arc("任务 A", "A-1", 0, 10, "R-1")],
    )

    result = branch_price_cut.solve(problem)

    assert result["status"] == "feasible_partial"
    assert [row["status"] for row in result["rows"]] == ["是", "否"]


def test_copt_requires_a_candidate_for_every_task(tmp_path):
    problem = write_problem(
        tmp_path,
        [
            {"key": "a", "taskName": "任务 A", "priority": 1},
            {"key": "b", "taskName": "任务 B", "priority": 1},
        ],
        [arc("任务 A", "A-1", 0, 10, "R-1")],
    )

    with pytest.raises(SolverError, match="没有可用候选弧段"):
        copt_scheduler.solve(problem, time_limit=1)


def test_copt_solves_a_feasible_candidate_problem_when_installed(tmp_path):
    problem = write_problem(
        tmp_path,
        [
            {"key": "a", "taskName": "任务 A", "priority": 1},
            {"key": "b", "taskName": "任务 B", "priority": 1},
        ],
        [
            arc("任务 A", "A-1", 0, 10, "R-1"),
            arc("任务 B", "B-1", 10, 20, "R-1"),
        ],
    )
    try:
        result = copt_scheduler.solve(problem, time_limit=5)
    except SolverError as exc:
        if "接口不可用" in str(exc):
            pytest.skip(str(exc))
        raise

    assert result["status"] == "optimal"
    assert result["selected_count"] == 2


def test_candidate_conflicts_require_shared_resource_and_overlapping_time(tmp_path):
    problem = write_problem(
        tmp_path,
        [
            {"key": "a", "taskName": "任务 A"},
            {"key": "b", "taskName": "任务 B"},
            {"key": "c", "taskName": "任务 C"},
        ],
        [
            arc("任务 A", "A-1", 0, 10, "R-1"),
            arc("任务 B", "B-1", 10, 20, "R-1"),
            arc("任务 C", "C-1", 1, 9, "R-2"),
        ],
    )

    assert conflict_pairs(problem.arcs) == []


def test_load_problem_ignores_candidate_without_a_resource(tmp_path):
    task_path = tmp_path / "tasks.json"
    arc_path = tmp_path / "arcs.json"
    task_path.write_text(
        json.dumps({"taskFormHeadList": [{"key": "a", "taskName": "任务 A"}]}, ensure_ascii=False),
        encoding="utf-8",
    )
    arc_path.write_text(
        json.dumps([{
            "task_name": "任务 A",
            "tracking_plan_id": "A-no-resource",
            "start_time": 0,
            "end_time": 10,
            "duration": 10,
            "cekong_resource": [],
        }], ensure_ascii=False),
        encoding="utf-8",
    )

    with pytest.raises(SolverError, match="没有可用候选弧段"):
        load_problem(task_path, [arc_path])
