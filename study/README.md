# PROMOTION KART

PROMOTION KART is a responsive React task-management demo with a sign-in screen, an overview dashboard, and task CRUD.

## Run locally

```sh
npm install
npm run dev
```

The sign-in screen authenticates against `http://127.0.0.1:9000/api/login`. Start the API server and use an account configured in its database.

## Features

- View task totals, progress, overdue work, and upcoming tasks on the dashboard.
- Create, edit, search, filter, and delete tasks.
- Assign each task, set its status and priority, and choose a due date.
- Sign in through the API with Redux Toolkit managing authentication state; the signed-in name and role appear in the workspace.
- Update your account name and email from the Profile page; changes are saved through the authenticated `PUT /api/profile` endpoint.
- Create, assign, update, filter, and delete tasks through the authenticated API; admins and managers manage the team, while employee dashboards show their own tasks.
- Create and assign projects, track project status (Pending, In progress, Completed, or On hold), and optionally select an active project when creating tasks.
- Admins and managers can assign projects directly to managers or employees; project managers and admins can assign project tasks, while employees can create tasks for themselves in projects assigned to them.
- Employees can also create personal tasks assigned to themselves; personal tasks do not require a project.
- Admins can add and update managers and employees from the team page; new or existing team accounts cannot be assigned admin access.
- Keep the API token in browser `sessionStorage`; task data is loaded from the backend for the signed-in user.
- Reuse shared button, form-field, modal, table, and dashboard components.

Authentication and task data are handled by the API. Apply Laravel migrations and seed users before signing in. The default seed accounts all use password `12345678`:

| Role | Email |
|---|---|
| Admin | `admin@test.com` |
| Manager | `company@test.com` |
| Employee | `employee@test.com` |

## Checks

```sh
npm run lint
npm run build
```
