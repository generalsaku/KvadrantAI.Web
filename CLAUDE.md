# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

The frontend SPA for KvadrantAI: Vue 3 (`<script setup>` + Composition API) + Vite + TypeScript,
with Pinia for state, vue-router for routing, and Tailwind + shadcn-vue (built on reka-ui
primitives) for UI. It talks to the **KvadrantAI.Api** backend and authenticates the user via that
API's Google-OAuth-then-JWT flow.

## Commands

```bash
npm install          # install deps
npm run dev          # Vite dev server on http://localhost:5173
npm run build        # type-check (vue-tsc --noEmit) then vite build → dist/
npm run preview      # serve the production build locally
npm run type-check   # vue-tsc --noEmit only
```

There is no test runner or linter configured. `npm run build` is the correctness gate — it fails on
any type error.

## Configuration

The only runtime config is `VITE_API_BASE_URL` (the base URL of KvadrantAI.Api), read via
`import.meta.env` and typed in `env.d.ts`. Set it in a local `.env`; `.env` currently points at the
deployed Azure API. Code never reads `process.env` — only `import.meta.env`.

The backend (KvadrantAI.Api) must be running and reachable at that URL for sign-in to work.

## Architecture

**Path alias.** `@/` resolves to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).
Always import with `@/...`, not relative `../..` paths.

**API access** (`src/api/request.ts`) is the single gateway to the backend. `requestGet` /
`requestPost` prepend `VITE_API_BASE_URL`, set JSON headers, and auto-attach
`Authorization: Bearer <token>` when a token is in `localStorage`. `loginUrl()` / `logoutUrl()`
build the OAuth redirect URLs. Add new backend calls here rather than calling `fetch` from
components.

**Auth flow.** Sign-in redirects the browser to the API's `/auth/login`; the API completes Google
OAuth and redirects back with `?access_token=<jwt>` in the URL. The token is captured in **two**
places — keep both in mind when touching auth:
1. An inline script in `index.html` runs before the app boots, moves the token into `localStorage`,
   and strips it from the URL.
2. `src/stores/user.ts` `authorize()` (called once from `main.ts` on startup) also reads the token
   (from URL or `localStorage`), decodes the JWT client-side (`name`, `image`, `exp`), drops it if
   expired, and populates user state.

**State** lives in Pinia setup-style stores under `src/stores/`. `user.ts` is the only store today;
it owns `user`, `authorize()`, `signIn()`, and `signOut()`. Components read it via `useUserStore()`
+ `storeToRefs`.

**UI components** under `src/components/ui/` follow the **shadcn-vue model**: the component source is
owned by this repo (copied from <https://www.shadcn-vue.com/>), not imported from a package. They use
the `cn()` helper (`src/lib/utils.ts`, clsx + tailwind-merge) and `class-variance-authority` for
variants. To add a component, copy its source into `src/components/ui/<name>/` with an `index.ts`
barrel. Theme colors are CSS variables (`hsl(var(--...))`) defined in `src/assets/main.css` and
mapped in `tailwind.config.js`; dark mode is class-based.

**Layout.** `App.vue` is the shell (`AppHeader` + `<RouterView/>` + `AppFooter`). Page-level
components go in `src/views/` and are wired up in `src/router/index.ts`.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes `dist/` to
**GitHub Pages**. Because Pages serves the site under a sub-path, `vite.config.ts` sets
`base: "/KvadrantAI.Web/"` for production builds (`/` in dev), and the router uses
`import.meta.env.BASE_URL`. Keep links/asset paths relative so they survive the base path.
