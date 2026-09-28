# Task Manager (MERN)

A simple task manager built with MongoDB, Express, React and Node.js. Users can register, log in, and manage their own tasks. Each task can get a short AI-generated summary of its description.

**Live demo:** _add your deployed link here_

## Tech stack

- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, express-rate-limit, helmet
- **Frontend:** React 18 (Vite), React Router v6, Axios, Context API, Tailwind CSS v4
- **AI:** Gemini API or OpenAI (switchable), with a mock provider for local use

## Features

- Register / login with JWT stored in an **httpOnly cookie** (not readable by JS, so safer against XSS)
- Passwords hashed with bcrypt
- Protected routes on both sides (auth middleware on the API, `ProtectedRoute` in React)
- Task CRUD, every task linked to the logged-in user
- Filter by status + pagination
- Rate limiting (general API, stricter on login/register, separate limit for AI)
- Central error handler, async/await everywhere
- Duplicate-submit protection when creating tasks (button lock + `requestId` unique index)
- **Generate Task Summary** button with loading state and error handling

## Project structure

```
task-manager/
├── backend/
│   ├── server.js                 # starts server after DB connects
│   └── src/
│       ├── app.js                # express app, middleware, routes
│       ├── config/db.js
│       ├── models/               # User, Task
│       ├── controllers/          # auth, task, ai
│       ├── routes/               # authRoutes, taskRoutes, aiRoutes
│       ├── middleware/           # auth, errorHandler, rateLimiter
│       ├── services/aiService.js # all AI provider logic
│       └── utils/
└── frontend/
    └── src/
        ├── api/                  # axios instance + auth/tasks/ai calls
        ├── context/AuthContext.jsx
        ├── components/           # Navbar, ProtectedRoute, TaskForm, TaskItem, SummaryButton
        └── pages/                # Login, Register, Dashboard
```

## Running locally

Requirements: Node.js 18+ and MongoDB (local or Atlas).

**1. Backend**

```bash
cd backend
npm install
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm run dev               # http://localhost:5000
```

**2. Frontend** (new terminal)

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

In development Vite proxies `/api` to the backend, so no extra config is needed.

### Environment variables (backend)

| Variable | Description |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d` |
| `CLIENT_URL` | Frontend URL for CORS |
| `AI_PROVIDER` | `gemini`, `openai` or `mock` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Needed when provider is `gemini` |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | Needed when provider is `openai` |

If the selected provider has no API key, the app falls back to the mock summary instead of failing.

## API

Base URL: `/api`. Protected routes need the auth cookie (set on login) or an `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Body | Notes |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | Sets cookie, returns user |
| POST | `/auth/login` | `{ email, password }` | Sets cookie, returns user |
| POST | `/auth/logout` | – | Clears cookie |
| GET | `/auth/me` | – | Protected, returns current user |

### Tasks (all protected)

| Method | Endpoint | Body / Query | Notes |
|---|---|---|---|
| GET | `/tasks` | `?page=1&limit=10&status=pending` | Paginated list of your tasks |
| GET | `/tasks/:id` | – | Single task |
| POST | `/tasks` | `{ title, description?, status?, requestId? }` | Same `requestId` twice returns the first task |
| PUT | `/tasks/:id` | `{ title?, description?, status? }` | Returns updated task |
| DELETE | `/tasks/:id` | – | |

`status` is one of `pending`, `in-progress`, `completed`.

### AI (protected)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/ai/summary` | `{ taskId }` or `{ text }` | `{ summary }` |

With `taskId`, the summary is also saved on the task. Descriptions under 30 characters are rejected with a 400.

### Error format

All errors return `{ "message": "..." }` with a proper status code (400, 401, 404, 409, 429, 500, 502).

## Deployment

- **Backend on Render:** root `backend`, build `npm install`, start `npm start`, add the env vars, set `NODE_ENV=production` and `CLIENT_URL` to your frontend URL.
- **Frontend on Vercel/Netlify:** root `frontend`, build `npm run build`, output `dist`, set `VITE_API_URL=https://<your-backend>/api`. Add a rewrite of all routes to `/index.html` so React Router works on refresh.

In production the cookie is sent with `sameSite: none; secure` because frontend and backend are on different domains.
