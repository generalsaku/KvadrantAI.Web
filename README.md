# KvadrantAI.Web

Vue 3 + Vite + TypeScript + Pinia + vue-router + Tailwind + shadcn-vue (reka-ui primitives).

## Setup

```sh
npm install
```

Create a local `.env` (or copy `.env.example`) pointing at the API:

```
VITE_API_BASE_URL=https://localhost:7230
```

## Develop

```sh
npm run dev
```

The API (KvadrantAI.Api) must be running for sign-in to work. CORS in the API is already wide-open in development.

## Auth flow

1. Header "Sign in" button redirects to `GET {API}/auth/login?redirectUri={current-url}`.
2. The API runs the Google OAuth challenge, then redirects back to `{current-url}?access_token={jwt}`.
3. `src/stores/user.ts` `authorize()` runs on app mount, picks up `access_token` from the URL, stores it in `localStorage`, and parses the JWT (`name`, `image`, `exp`) to populate the user state.
4. `src/api/request.ts` attaches `Authorization: Bearer {token}` to subsequent API calls.
5. The avatar dropdown's "Sign out" clears the token and redirects to `GET {API}/auth/logout?redirectUri={origin}`.

## Project layout

```
src/
  api/             fetch helpers + login/logout URL builders
  assets/          global CSS (Tailwind + shadcn CSS vars)
  components/
    ui/            shadcn-vue components (button, avatar, dropdown-menu)
    AppHeader.vue  header with sign-in button / avatar dropdown
  lib/utils.ts     `cn()` helper
  router/          vue-router setup
  stores/user.ts   Pinia store for the signed-in user
  views/           page-level components
  App.vue          shell — header + <RouterView/>
  main.ts          entry
```

## Adding more shadcn-vue components

Components in `src/components/ui/` are owned by this repo (the shadcn model). Copy the source for additional components from <https://www.shadcn-vue.com/> into `src/components/ui/<name>/`.
