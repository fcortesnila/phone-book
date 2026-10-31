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
