import pytest

from interface.preprocess_support import filter_candidate_events_by_requirements


def event(resources):
    return {
        "task_key": "task-a",
        "task_name": "任务 A",
        "tracking_plan_id": "plan-1",
        "cekong_resource": resources,
    }


def test_resource_pool_all_requires_every_expanded_member():
    pools = [{
        "poolName": "双站池",
        "selectionMode": "all",
        "resourceList": ["资源 A", "资源 B"],
        "resourceGroupList": [],
    }]
    events = [
        event([{"resourceName": "资源 A"}, {"resourceName": "资源 B"}]),
        {**event([{"resourceName": "资源 A"}]), "tracking_plan_id": "plan-2"},
    ]

    filtered = filter_candidate_events_by_requirements(
        events,
        {"task-a": "双站池"},
        [],
        pools,
    )

    assert [item["tracking_plan_id"] for item in filtered] == ["plan-1"]


def test_resource_pool_count_supports_resource_groups_and_mixed_expression():
    pools = [{
        "poolName": "备选池",
        "selectionMode": "count",
        "requiredCount": 2,
        "resourceList": ["资源 A"],
        "resourceGroupList": ["资源组"],
    }]
    groups = [{
        "resourceGroupName": "资源组",
        "includeResourceList": ["资源 B", "资源 C"],
        "excludeResourceList": ["资源 C"],
    }]
    candidate = event([{"resourceName": "资源 A"}, {"resourceName": "资源 B"}])

    filtered = filter_candidate_events_by_requirements(
        [candidate],
        {"task-a": "备选池 and 资源 A"},
        groups,
        pools,
    )

    assert filtered == [candidate]


@pytest.mark.parametrize("pool, message", [
    ({
        "poolName": "空池",
        "selectionMode": "all",
        "resourceList": [],
        "resourceGroupList": [],
    }, "没有有效资源"),
    ({
        "poolName": "数量池",
        "selectionMode": "count",
        "requiredCount": -1,
        "resourceList": ["资源 A"],
        "resourceGroupList": [],
    }, "指定数量"),
])
def test_invalid_resource_pool_definitions_are_rejected(pool, message):
    with pytest.raises(ValueError, match=message):
        filter_candidate_events_by_requirements(
            [event([{"resourceName": "资源 A"}])],
            {"task-a": pool["poolName"]},
            [],
            [pool],
        )


def test_resource_pool_name_cannot_shadow_a_resource_case_insensitively():
    pool = {
        "poolName": "resource a",
        "selectionMode": "all",
        "resourceList": ["资源 B"],
        "resourceGroupList": [],
    }
    with pytest.raises(ValueError, match="重名"):
        filter_candidate_events_by_requirements(
            [event([{"resourceName": "Resource A"}, {"resourceName": "资源 B"}])],
            {"task-a": "resource a"},
            [],
            [pool],
        )
