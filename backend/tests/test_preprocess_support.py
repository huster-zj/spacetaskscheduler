from datetime import datetime

import pytest

from interface.preprocess_support import (
    align_solar_data_to_tasks,
    filter_candidate_events_by_requirements,
    resource_catalog_aliases,
    select_task_json,
    validate_resource_requirement,
)


def make_task_json():
    return {
        "taskFormHeadList": [
            {"key": "ui-a", "taskName": "FK-1-1"},
            {"key": "ui-b", "taskName": "FK-1-2"},
        ],
        "taskBasicInfoList": [
            {"key": "ui-a", "resourceRequirement": "TIANLIAN_2-01-TIANHE"},
            {"key": "ui-b", "resourceRequirement": ""},
        ],
        "taskPropList": [{"key": "ui-a"}, {"key": "ui-b"}],
        "taskDurationList": [{"key": "ui-a"}, {"key": "ui-b"}],
    }


def test_select_task_json_matches_stable_key_without_mixing_aligned_lists():
    selected, task = select_task_json(make_task_json(), "ui-b")

    assert task == {"key": "ui-b", "taskName": "FK-1-2"}
    assert [item["key"] for item in selected["taskFormHeadList"]] == ["ui-b"]
    assert [item["key"] for item in selected["taskBasicInfoList"]] == ["ui-b"]
    assert [item["key"] for item in selected["taskPropList"]] == ["ui-b"]
    assert [item["key"] for item in selected["taskDurationList"]] == ["ui-b"]


def test_select_task_json_accepts_task_name_and_rejects_unknown_task():
    selected, task = select_task_json(make_task_json(), "FK-1-1")

    assert task["key"] == "ui-a"
    assert selected["taskFormHeadList"][0]["taskName"] == "FK-1-1"

    with pytest.raises(ValueError, match="任务不存在"):
        select_task_json(make_task_json(), "missing-task")


def test_filter_candidate_events_evaluates_resources_and_groups_without_eval():
    events = [
        {
            "task_key": "ui-a",
            "task_name": "FK-1-1",
            "tracking_plan_id": "PLAN-1",
            "task_to_craft": "TIANHE",
            "cekong_resource": [
                {
                    "cekong_station": "TIANLIAN_2-01",
                    "cekong_resource_id": "CK-1",
                    "resourceName": "资源 A",
                }
            ],
        },
        {
            "task_key": "ui-a",
            "task_name": "FK-1-1",
            "tracking_plan_id": "PLAN-2",
            "task_to_craft": "TIANHE",
            "cekong_resource": [
                {"cekong_station": "BEIJING", "cekong_resource_id": "CK-2"}
            ],
        },
    ]
    requirements = {"ui-a": "测控资源组 and 资源 A"}
    groups = [
        {
            "resourceGroupName": "测控资源组",
            "includeResourceList": ["资源 A", "BEIJING-TIANHE"],
            "excludeResourceList": ["BEIJING-TIANHE"],
        }
    ]

    filtered = filter_candidate_events_by_requirements(events, requirements, groups)

    assert [event["tracking_plan_id"] for event in filtered] == ["PLAN-1"]


def test_filter_candidate_events_keeps_empty_expression_compatible_and_reports_invalid():
    event = {
        "task_key": "ui-a",
        "task_name": "FK-1-1",
        "tracking_plan_id": "PLAN-1",
        "cekong_resource": [],
    }

    assert filter_candidate_events_by_requirements([event], {"ui-a": ""}, []) == [event]

    with pytest.raises(ValueError, match="表达式"):
        filter_candidate_events_by_requirements([event], {"ui-a": "A and"}, [])

    with pytest.raises(ValueError, match="未知"):
        validate_resource_requirement("未配置资源", [], [], ["资源 A"])


def test_resource_catalog_validation_rejects_unknown_requirement_without_candidates():
    known_resources = resource_catalog_aliases([
        {"id": "CK-1", "station": "TIANLIAN_2-01", "craft": "TIANHE"}
    ])

    assert "TIANLIAN_2-01-TIANHE" in known_resources
    with pytest.raises(ValueError, match="未知"):
        validate_resource_requirement("未配置资源", [], [], known_resources)


def test_select_task_json_prefers_exact_key_over_another_task_name():
    payload = make_task_json()
    payload["taskFormHeadList"][0]["taskName"] = "ui-b"

    selected, task = select_task_json(payload, "ui-b")

    assert task["key"] == "ui-b"
    assert [item["key"] for item in selected["taskFormHeadList"]] == ["ui-b"]


def test_align_solar_data_to_task_dates_uses_temporary_copies(tmp_path):
    source = tmp_path / "sun.csv"
    source.write_text(
        "start_timestamp,end_timestamp\n"
        "1699200000,1699203600\n",
        encoding="utf-8",
    )
    task_data = {
        "taskPropList": [
            {
                "singleDiscreteData": [
                    {"startTime": "2026-09-14 00:00:00", "endTime": "2026-09-14 02:00:00"}
                ]
            }
        ]
    }

    aligned_sun, aligned_umbra = align_solar_data_to_tasks(
        str(source), None, task_data, str(tmp_path / "aligned")
    )

    assert aligned_umbra is None
    assert aligned_sun != str(source)
    expected_start = int(datetime.fromisoformat("2026-09-14 00:00:00").timestamp())
    assert str(expected_start) in open(aligned_sun, encoding="utf-8").read()
    assert source.read_text(encoding="utf-8") == (
        "start_timestamp,end_timestamp\n1699200000,1699203600\n"
    )
