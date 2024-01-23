# Project Socrates

> An AI-powered learning platform — GPT teacher, flashcards with spaced repetition, mind maps, and smart PDF search.

**Origin:** Built ~2023, last commit Jan 2024. SvelteKit 1 + Svelte 3 + Firebase + OpenAI v3 SDK.

## Mission (2026 Refactor)

Salvage this project and make it run again. Respect the 2023-era spirit while fixing what's actually broken (deprecated APIs, dead packages). Close the loop into a functional product you can `npm run dev` and use.

## Architecture

| Layer       | Tech |
|-------------|------|
| Framework   | SvelteKit 1.5 (Svelte 3) |
| Styling     | Tailwind CSS 3 + DaisyUI 2 |
| Auth + DB   | Firebase (Firestore, Auth, Storage) |
| AI          | OpenAI API (chat + embeddings) — **v3 SDK (broken)** |
| Maps        | Leaflet.js |
| PDFs        | PDF.js |
| ML (client) | TensorFlow.js (vector similarity) |
| Rendering   | Marked + Rehype (KaTeX math, syntax highlight) |

## Key paths

- `src/routes/api/` — Server endpoints (chat streaming, embeddings)
- `src/lib/server/` — OpenAI config, Firebase Admin init
- `src/lib/client/` — Stores, Firestore collection abstraction, Firebase config
- `src/lib/components/` — 23 reusable Svelte components
- `src/lib/views/` — 7 page-level views (App, Login, MindMap, etc.)

## External services required

1. **OpenAI API key** → `OPENAI_API_KEY` in `.env`
2. **Firebase project** → Client config hardcoded in `src/lib/client/firebase.ts`
3. **Firebase Admin SDK** → JSON credential at `secret/project-socrates-firebase-admin-sdk.json`

## Tickets

See [.alf/TICKETS.md](.alf/TICKETS.md) for workflow. Tickets live in `.alf/tickets/`.
