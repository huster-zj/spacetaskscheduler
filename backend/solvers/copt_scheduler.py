"""COPT-backed binary candidate-arc scheduler."""

from __future__ import annotations

import os
from pathlib import Path
import sys
from typing import Any

from .scheduling import Problem, SolverError, conflict_pairs, render_result


_DLL_DIRECTORIES = []


def _load_copt():
    copt_home = Path(os.environ.get("COPT_HOME", r"C:\Program Files\copt80"))
    if os.name == "nt" and copt_home.exists():
        version_dir = f"{sys.version_info.major}{sys.version_info.minor}"
        python_api_dir = copt_home / "lib" / "python" / version_dir
        for directory in (copt_home / "bin", copt_home / "lib" / "python" / "deps"):
            if directory.exists() and hasattr(os, "add_dll_directory"):
                # Preserve the handles for the process lifetime.
                _DLL_DIRECTORIES.append(os.add_dll_directory(str(directory)))
        if python_api_dir.exists() and str(python_api_dir) not in sys.path:
            sys.path.insert(0, str(python_api_dir))
    try:
        import coptpy as cp
        from coptpy import COPT
        return cp, COPT
    except Exception as exc:  # coptpy has native DLLs and can fail during import
        raise SolverError("COPT Python 接口不可用，请检查 coptpy、COPT DLL 和许可证配置") from exc


def solve(problem: Problem, *, target: str = "2", time_limit: float = 120.0) -> dict[str, Any]:
    cp, COPT = _load_copt()
    try:
        env = cp.Envr()
        model = env.createModel("space_task_scheduler_copt")
        variables = {arc.index: model.addVar(vtype=COPT.BINARY, name=f"arc_{arc.index}") for arc in problem.arcs}
        by_task = problem.arcs_by_task
        for task in problem.tasks:
            task_vars = [variables[arc.index] for arc in by_task.get(task.key, ())]
            if not task_vars:
                raise SolverError(f"任务 {task.name} 没有可用候选弧段，COPT 无法构建完整调度")
            model.addConstr(cp.quicksum(task_vars) == 1, name=f"task_{task.key}")
        for left, right in conflict_pairs(problem.arcs):
            model.addConstr(variables[left] + variables[right] <= 1, name=f"conflict_{left}_{right}")
        # COPT is the complete-schedule algorithm: every task is required.
        # The number of selected arcs and completed tasks is consequently fixed;
        # minimizing occupied duration selects the leanest feasible schedule.
        objective = cp.quicksum(arc.weight * variables[arc.index] for arc in problem.arcs)
        model.setObjective(objective, sense=COPT.MINIMIZE)
        model.setParam(COPT.Param.TimeLimit, float(time_limit))
        model.solve()
    except SolverError:
        raise
    except Exception as exc:
        raise SolverError(f"COPT 求解失败：{exc}") from exc

    status_value = getattr(model, "status", None)
    optimal_value = getattr(COPT, "OPTIMAL", 1)
    infeasible_value = getattr(COPT, "INFEASIBLE", -1)
    if status_value == infeasible_value:
        raise SolverError("COPT 判定当前规划不可行，请检查候选弧段和资源约束")
    selected = [arc for arc in problem.arcs if getattr(variables[arc.index], "x", 0.0) > 0.5]
    if len(selected) != len(problem.tasks):
        raise SolverError("COPT 未返回可行调度方案")
    status = "optimal" if status_value == optimal_value else "time_limit_or_feasible"
    return render_result(
        problem, selected, algorithm="copt", status=status,
        objective=getattr(model, "objval", None),
        diagnostics={
            "solver_status": status_value,
            "time_limit": time_limit,
            "target": target,
            "objective_mode": "minimize_occupied_duration_for_complete_schedule",
        },
    )
