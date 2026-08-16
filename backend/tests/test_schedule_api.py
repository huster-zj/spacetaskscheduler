import pytest


pytest.importorskip("fastapi_offline")

from fastapi.testclient import TestClient

import main


@pytest.fixture
def client():
    return TestClient(main.app)


def test_schedule_algorithm_rejects_unknown_algorithm(client):
    response = client.post("/api/schedule_algorithm", json={"algorithm": "unknown"})

    assert response.status_code == 200
    assert response.json() == {
        "success": False,
        "message": "不支持的调度算法",
        "data": None,
    }


def test_schedule_algorithm_rejects_unknown_target(client):
    response = client.post("/api/schedule_algorithm", json={"algorithm": "2", "target": "unknown"})

    assert response.status_code == 200
    assert response.json() == {
        "success": False,
        "message": "不支持的调度目标",
        "data": None,
    }
