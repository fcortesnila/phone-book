# Phone Book API

A small local FastAPI service for the portfolio demo. It stores synthetic contacts in SQLite and starts with an empty database. Do not enter real personal or patient information.

## Requirements

- Python 3.10 or newer

## Install and run

From this directory, create and activate a virtual environment, then install the service and test dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Start the API bound to the local machine:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API is available at `http://127.0.0.1:8000`. Interactive API documentation is at `http://127.0.0.1:8000/docs`. The SQLite database is created at `server/data/contacts.sqlite3` when the service starts and is ignored by Git.

## Endpoints

| Method | Path | Result |
| --- | --- | --- |
| `GET` | `/contacts` | List contacts, ordered by last and first name |
| `POST` | `/contacts` | Create a contact (`201 Created`) |
| `GET` | `/contacts/{id}` | Read one contact |
| `PUT` | `/contacts/{id}` | Replace a contact's editable fields |
| `DELETE` | `/contacts/{id}` | Delete a contact (`204 No Content`) |

The JSON fields are `firstName`, `lastName`, `phone`, `email`, and `image`. Email and image are optional. A full set of contact fields is required for `PUT`. Missing contact IDs return `404`; invalid request bodies return `422`.

## Run API tests

Install the requirements above, then run from this directory:

```powershell
python -m pytest
```

Tests use a temporary SQLite database and synthetic contact details. They cover listing, CRUD status codes, validation errors, missing IDs, and persistence after a simulated server restart.
