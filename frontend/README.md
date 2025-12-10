# React Frontend — Tech Summary

This README gives a concise overview of the frontend in this workspace and how to run it locally.

## Languages & Technologies
- JavaScript (ESNext) and JSX — React components live under `src/`.
- HTML — `index.html` (Vite entry).
- CSS — Styles in `src/css/*.css` (e.g., `MovieDescription.css`, `Home.css`, `Login.css`).
- JSON — `package.json` (scripts and dependencies).
- Node.js / npm — runtime and package manager.
- Vite — development/build tool.
- Axios — HTTP client for backend API calls (`src/services/api.js`).

## React / Libraries/frameworks
- React (hooks-based)
- React Router (routing) — `react-router-dom`
- Axios (REST requests)

## Key Files / Folders
- `src/pages/` — main page components
	- `MovieDescription.jsx` — movie details, dynamic showtimes, Terms & Conditions modal
	- `Home.jsx` — movie listing, filters, upcoming movies
	- `Login.jsx` — login / signup / forgot password UI
- `src/components/` — smaller UI components (e.g. `MovieCard.jsx`, `NavBar.jsx`)
- `src/css/` — component/page styles
- `src/assets/` — static images used by the app
- `src/services/api.js` — API wrappers (uses Axios)

## Important Frontend Behavior Notes
- Authentication is handled client-side for now: login stores `user`, `token`, and `isAuthenticated` in `localStorage`.
- `Home.jsx` requires a signed-in user to open movie detail pages; unauthenticated clicks redirect to `/login` and pass `location.state.redirectTo` so users return to the intended page after logging in.
- `MovieDescription.jsx` shows a Terms & Conditions modal when the user clicks a showtime. Accept proceeds to booking; Cancel closes the modal.

## How to Run (development)
1. Open a terminal in the project frontend folder:

```powershell
cd e:\react-project\frontend
```

2. Install dependencies (if not already installed):

```powershell
npm install
```

3. Start the Vite dev server:

```powershell
npm run dev
```

4. The server should print a local URL (e.g., `http://localhost:5173`). Open it in your browser.

## Dev convenience: Guest mode
If your backend is not available and you want to navigate through frontend flows, you can simulate login in two ways:

- Option A (browser console):
```javascript
localStorage.setItem('user', JSON.stringify({ id: 'guest', name: 'Guest User', email: 'guest@local' }));
localStorage.setItem('token', 'guest-token');
localStorage.setItem('isAuthenticated', 'true');
```
After setting this, reload the Home page — movie cards will open normally.

- Option B: add a small guest button to `src/pages/Login.jsx` (I can re-add it if you want).

> Reminder: Guest mode is a developer convenience — do not use it in production.

## Scripts (from package.json)
- `npm run dev` — Start dev server (Vite)
- `npm run build` — Build production assets
- `npm run preview` — Preview the production build locally
- `npm run lint` — Run ESLint

## Next suggestions (optional)
- Add an `AuthContext` so auth state updates propagate without page reloads.
- Add environment toggles for dev-only features (guest login) using `import.meta.env.MODE` or `process.env.NODE_ENV`.
- Integrate with a real backend and replace mock `movieData` with API calls.

If you want, I can:
- Re-add the guest-login button to `src/pages/Login.jsx` now.
- Create a short `CONTRIBUTING.md` with local dev checks.
- Generate a full list of files touched by me in this session.

Which would you like next?

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
