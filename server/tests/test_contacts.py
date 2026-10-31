from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture
def database_path(tmp_path: Path) -> Path:
    return tmp_path / "test-contacts.sqlite3"


@pytest.fixture
def client(database_path: Path):
    with TestClient(create_app(database_path)) as test_client:
        yield test_client


def sample_contact(**overrides):
    return {
        "firstName": "Taylor",
        "lastName": "Jordan",
        "phone": "+1 (555) 010-2040",
        "email": "taylor.jordan@example.test",
        "image": "https://example.test/taylor.jpg",
        **overrides,
    }


def test_list_contacts_starts_empty(client: TestClient):
    response = client.get("/contacts")

    assert response.status_code == 200
    assert response.json() == []


def test_create_list_get_update_and_delete_contact(client: TestClient):
    created = client.post("/contacts", json=sample_contact())
    assert created.status_code == 201
    contact = created.json()
    assert contact["firstName"] == "Taylor"
    assert contact["lastName"] == "Jordan"
    assert isinstance(contact["id"], int)

    contact_id = contact["id"]
    assert client.get("/contacts").json() == [contact]
    assert client.get(f"/contacts/{contact_id}").json() == contact

    updated = client.put(
        f"/contacts/{contact_id}",
        json=sample_contact(firstName="Casey", email=None, image=None),
    )
    assert updated.status_code == 200
    assert updated.json() == {
        **contact,
        "firstName": "Casey",
        "email": None,
        "image": None,
    }

    deleted = client.delete(f"/contacts/{contact_id}")
    assert deleted.status_code == 204
    assert deleted.content == b""
    assert client.get("/contacts").json() == []


def test_missing_contact_returns_404_for_read_update_and_delete(client: TestClient):
    assert client.get("/contacts/404").status_code == 404
    assert client.put("/contacts/404", json=sample_contact()).status_code == 404
    assert client.delete("/contacts/404").status_code == 404


@pytest.mark.parametrize(
    "payload",
    [
        sample_contact(firstName="   "),
        sample_contact(phone="12"),
        sample_contact(email="not-an-email"),
        sample_contact(image="file:///tmp/photo.jpg"),
    ],
)
def test_invalid_contact_input_returns_422(client: TestClient, payload):
    response = client.post("/contacts", json=payload)

    assert response.status_code == 422
    assert response.json()["detail"]
    assert client.get("/contacts").json() == []


def test_contacts_survive_a_server_restart(database_path: Path):
    with TestClient(create_app(database_path)) as first_server:
        created = first_server.post("/contacts", json=sample_contact())
        assert created.status_code == 201
        contact = created.json()

    with TestClient(create_app(database_path)) as restarted_server:
        assert restarted_server.get("/contacts").json() == [contact]
