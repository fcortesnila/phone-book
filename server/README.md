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

## Provider-neutral hosting notes

This is deployment guidance only; no provider or deployment is configured.

### Environment and start command

The app does not read any required environment variables. If the hosting service assigns a port, pass its `PORT` value to Uvicorn in the start command. The app has no environment-variable setting for the database path.

From the repository root, install the API requirements and start the service with:

```sh
python -m pip install -r server/requirements.txt
cd server
python -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
```

`requirements.txt` includes the API and test dependencies.

### Health check

There is no dedicated `/health` endpoint. `GET /contacts` returns `200` with a JSON list when the API and database are available, so it can be used as a basic health probe.

### SQLite persistence

The database path is fixed in the code at `server/data/contacts.sqlite3`, relative to the service source. The directory must be writable, and the hosting setup must mount durable storage at that path. Without persistent storage, contacts can be lost when an instance is replaced or restarted.

The service uses one SQLite file and has no database-path configuration, migration process, or backup tooling. Run a single API instance with access to that persistent file; multiple instances will not share their local databases.

### Limitations

The API has no authentication or CORS configuration, and the frontend does not call it yet. A separately hosted frontend cannot use this API cross-origin until CORS and frontend API configuration are added. Keep this as a synthetic-data demo; do not enter real personal or patient information.
