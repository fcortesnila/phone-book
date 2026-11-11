# Phone Book

A small portfolio demo for keeping contact details organized. The app displays a searchable contact list with profile photos and supports adding, editing, and deleting contacts with confirmation.

## Features

- Search contacts by name or phone number.
- Add and edit names, phone numbers, optional email addresses, and optional profile photo URLs.
- Delete contacts after confirming the action.
- Keep front-end changes in browser `localStorage` and show an initials fallback when a photo fails to load.

## Screenshot

_Screenshot not included yet. Add an image of the app to this repository and link it here._

## Architecture

- **Frontend:** React, Vite, and Tailwind CSS. Contact data is stored in the browser with `localStorage`.
- **API:** A separate FastAPI service under `server/`, with validated contact models and SQLite persistence.

The frontend is **not connected** to the API. They currently store and serve separate contact data; running both does not sync contacts.

## Run locally

### Frontend

From the repository root:

```sh
pnpm install
pnpm dev
```

### API (optional)

Requires Python 3.10 or newer.

From the repository root:

```sh
cd server
python -m venv .venv
```

Activate the virtual environment using the command for your shell (PowerShell: `.\.venv\Scripts\Activate.ps1`; macOS/Linux: `source .venv/bin/activate`), then install dependencies:

```sh
python -m pip install -r requirements.txt
```

Start the local API:

```sh
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API docs are available at `http://127.0.0.1:8000/docs`. See [server/README.md](server/README.md) for endpoints and SQLite details.

## Checks

Run these from the repository root:

```sh
pnpm test
pnpm lint
pnpm build
```

For API tests, activate the API virtual environment, change to `server/`, and run:

```sh
python -m pytest
```

The API tests use a temporary SQLite database and synthetic contact data.

## CI

[View the passing GitHub Actions run for the current `main` commit](https://github.com/fcortesnila/phone-book/actions/runs/41223261322). It completed both the frontend and API jobs successfully.

## GitHub Pages

The CI workflow runs checks for pushes and pull requests, then deploys the frontend after successful checks on pushes to `main`. To enable deployment, set the repository's Pages source to **GitHub Actions** under **Settings → Pages**. You can also start a deployment manually from the Actions tab.

The site will be available at [https://fcortesnila.github.io/phone-book/](https://fcortesnila.github.io/phone-book/). GitHub Pages hosts only the frontend; the optional FastAPI service is not deployed.

## Codex workflow

Repository guidance in [`AGENTS.md`](AGENTS.md) asks contributors to inspect relevant code and instructions before editing, preserve the demo scope and synthetic data, add tests for behavior changes, and report commands and results.

_Add your Codex workflow details here._

## Limitations

- This is a portfolio demo; the GitHub Pages deployment hosts only its frontend.
- The API has no authentication; the frontend and API are not integrated.
- Use synthetic contact data only. Do not enter real personal or patient information.
