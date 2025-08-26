Sprint Board Lite

Overview

This small Next.js app implements a Sprint Board Lite (single project, three columns: Todo / In Progress / Done) with a mocked API and a lightweight client UI.

Key features

- Mocked auth (login sets a fake token in localStorage /board is guarded, logout clears token)
- Mock API (Next app-route handlers) for GET /tasks, POST /tasks, PATCH /tasks/:id, DELETE /tasks/:id
  - Mutating requests randomly fail ~10% of the time to exercise optimistic updates and rollback
- Client board with drag & drop between columns
- Optimistic updates with rollback on API failure
- Undo Move toast: after moving a task, a 5s toast allows reverting move (server patched back)
- Create task modal (title, description, priority). New tasks start in Todo (optimistic create)
- Client-side search by title and filter by priority
- Mobile-first responsive layout, skeleton loading, empty/error states
- Dark mode toggle persisted in localStorage

Variant implemented

- Undo Move (chosen because the project uses the first character of the assistant name: 'G' → group a–g)
  - After a move, a 5s toast appears. Clicking Undo reverts the local state and sends a PATCH to the server to revert.

Quick setup

1. Install dependencies

	powershell
	cd c:\nailit-nextjs\my-app
	npm install

2. Start dev server

	powershell
	npm run dev

3. Open http://localhost:3000
	- Visit /login to sign in (enter any non-empty email and password)
	- After login you'll be redirected to /board

Deployed

The app is also deployed and available at:

https://nailit-nextjs.vercel.app/

Mock API
- Implemented as Next app routes in `src/app/api/tasks`.
- Seed data lives in `src/app/api/tasks/store.ts`.
- Mutations (POST/PATCH/DELETE) call `maybeFail()` which returns true ~10% of the time (500 responses) to trigger rollback paths.

Tests
- A minimal smoke test is present at `src/components/__tests__/smoke.test.tsx`. The test uses @testing-library/react to render `SprintBoard` and asserts the header is present.
- The repository doesn't include a full test runner config; to run tests locally add a test runner (Jest or Vitest) and type packages if desired.

Decisions & rationale
- Mock API: used Next app-route handlers with an in-memory `store` to keep the repo self-contained (no external json-server dependency).
- Optimistic UX: updates apply immediately on the client and rollback on server failure; Undo provides user control to revert accidental moves.
- Avoided Next-only client hooks inside `SprintBoard` to keep it testable and prevent hydration mismatches.
- Kept UI simple and unopinionated (Tailwind utility classes are present via project template).

What’s done
- Full Sprint Board UI with DnD, optimistic updates, Undo Move toast
- Create task modal (priority, description)
- Search and priority filter
- Dark mode toggle (persisted), loading skeletons, empty/error states
- Mock API with seeded data and 10% failure injection
- Login page (mocked) and guarded /board route
- Minor TypeScript and test fixes to run the smoke test without requiring Jest globals

Omitted / Deferred
- No persistent server-side storage (in-memory mock store only)
- No full test runner (I kept the smoke test minimal). If you want, I can add Vitest or Jest + types and CI config.
- Offline queue and keyboard moves variants were not implemented (Undo variant chosen).

Notes / troubleshooting
- If you see hydration mismatch warnings, run the dev server and check browser console; the codebase contains defensive fixes already.
- To make the smoke test use `expect`, install test types/dev deps (example below).

Optional: add test runner + types
- npm i -D vitest @testing-library/react @testing-library/jest-dom @types/jest

Time spent (approx)
- ~1.5 hours implementing features and iterating on fixes in this workspace.

Contact
- This repo was prepared programmatically. If you want follow-ups (tests, CI, prettier/lint), tell me which to add next.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

