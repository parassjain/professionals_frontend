# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

No test runner is configured.

## Environment Variables

```
VITE_API_BASE_URL=http://localhost:8000/api   # Django backend
VITE_GOOGLE_CLIENT_ID=                        # Google OAuth client ID
```

Copy `.env.example` to `.env` before running locally.

## Architecture

**Router:** Uses `HashRouter` (not `BrowserRouter`) — all routes are hash-based (`/#/path`). The Google OAuth callback route is `/#/auth/google/callback`.

**Auth:** `AuthContext` (`src/context/AuthContext.jsx`) is the single source of truth. It stores JWT tokens and the user object in `localStorage`. The axios client (`src/api/client.js`) automatically attaches the `Bearer` token on every request and silently refreshes the access token on 401 via the refresh token. On refresh failure it clears auth and redirects to `/login`.

**Route protection:**
- `ProtectedRoute` — redirects to `/login` if unauthenticated
- `AdminRoute` — additionally checks `user.is_staff`; redirects to `/` if not staff

**API layer:** All API calls go through `src/api/endpoints.js`, which exports named functions wrapping the axios client. Never call `api` directly from pages — always add a function to `endpoints.js`.

**User object shape:** Key fields used across the app: `first_name`, `last_name`, `avatar`, `avatar_url`, `is_staff`, `is_professional`. Avatar display always falls back: `user.avatar || user.avatar_url`, then initials.

**Styling:** Single global stylesheet `src/index.css` — no CSS modules or Tailwind. Reuse existing utility classes (`.avatar`, `.avatar-sm`, `.avatar-lg`, `.btn`, `.btn-primary`, `.btn-outline`, `.btn-sm`, `.container`, `.card`) rather than adding inline styles.

**No state management library** — all shared state flows through `AuthContext`. Page-level state is local `useState`.
