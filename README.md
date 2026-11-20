# Expense Tracker on Kubernetes

An Express + EJS expense tracker with JWT authentication, containerized with Docker and deployed to **Kubernetes** (Deployment + NodePort Service).

> Expenses and users are stored **in memory** (`models/`), so data resets whenever the app restarts.

## Features

- Register, log in, log out, view profile (JWT stored in a cookie)
- Create, list, update and delete expenses (with input validation)
- Expense statistics and monthly trends (Chart.js on the dashboard)
- Server-rendered pages: `/`, `/login`, `/register`, `/expenses`, `/dashboard`

## API

| Method | Path | Auth |
|---|---|---|
| `POST` | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` | Public |
| `GET` | `/api/auth/profile` | JWT |
| `GET` | `/api/expenses`, `/api/expenses/stats`, `/api/expenses/trends`, `/api/expenses/:id` | JWT |
| `POST` | `/api/expenses` | JWT |
| `PUT` / `DELETE` | `/api/expenses/:id` | JWT |

## Tech Stack

Node.js · Express · EJS · jsonwebtoken · bcryptjs · express-validator · cookie-parser · Chart.js · Docker (`node:18-alpine`) · Kubernetes

## Environment Variables

| Variable | Purpose |
|---|---|
| `JWT_SECRET` | JWT signing secret |
| `PORT` | HTTP port (default `4000`) |

```env
JWT_SECRET=your_jwt_secret_here
PORT=4000
```

## Run locally

```bash
git clone https://github.com/KahafSameer/expense-tracker-kubernative-project.git
cd expense-tracker-kubernative-project
npm install
npm run dev        # nodemon app.js   (or: npm start)
```

Open http://localhost:4000.

## Docker

```bash
docker build -f dockerfile -t kahafsameer/expense-tracker-kubernative-project:latest .
docker run -p 4000:4000 -e JWT_SECRET=your_jwt_secret_here kahafsameer/expense-tracker-kubernative-project:latest
```

## Kubernetes

`deployment.yaml` runs 1 replica of `kahafsameer/expense-tracker-kubernative-project:latest` (container port 4000). `service.yaml` exposes it as a **NodePort** on `30400`.

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl get pods,svc
# open http://<node-ip>:30400   (minikube: minikube service <service-name> --url)
```

> `deployment.yaml` doesn't set `JWT_SECRET`. Add it as an env var, ideally from a Kubernetes Secret, before using the app.

## Project Structure

```
app.js            # Express app, routes, error handling
routes/           # auth.js, expenses.js
controllers/      # authController.js, expenseController.js
middleware/auth.js
models/           # In-memory User and Expense
views/            # EJS pages
public/           # Client JS and CSS
```
