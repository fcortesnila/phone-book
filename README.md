# Phone Book

This frontend project was created with Codex using React, Vite, and Tailwind CSS.

## Getting started

```sh
npm install
npm run dev
```

## Available scripts

- `npm run dev` starts the development server.
- `npm run build` creates a production build in `dist/`.
- `npm run preview` serves the production build locally.
- `npm run lint` runs Oxlint.

Tailwind CSS is integrated through `@tailwindcss/vite`; styles are loaded from `src/index.css`.

## Local API demo

A standalone FastAPI service with SQLite persistence is documented in [server/README.md](server/README.md). It uses synthetic contacts and is intended for local development only; the frontend is not connected to it yet.

## Provider-neutral hosting notes

The frontend and API are separate services; the frontend currently stores contacts in browser local storage and does not call the API. These notes describe build and runtime requirements only. No hosting provider is selected or configured.

### Frontend

- Build with `npm ci` followed by `npm run build`.
- Publish and serve the generated `dist/` directory as static files. A long-running Node process is not required for static hosting.
- No application environment variables are required. In particular, `VITE_API_URL` is not read by this frontend.
- For a local smoke preview, run `npm run preview -- --host 0.0.0.0 --port "${PORT:-4173}"`. Vite Preview is for previewing a build, not a production web server.

### API

- API installation, start command, health check, and SQLite storage requirements are documented in [server/README.md](server/README.md).
- The frontend is not connected to this API. Hosting both services does not make their contacts sync.
