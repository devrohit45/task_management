# Taskflow

Taskflow is a responsive React task-management demo with a sign-in screen, an overview dashboard, and task CRUD.

## Run locally

```sh
npm install
npm run dev
```

Choose one of the demo accounts on the sign-in screen, or enter its credentials:

| Account | Email | Password |
|---|---|---|
| Jordan Davis (Admin) | `admin@taskflow.io` | `admin123` |
| Olivia Rhye (Editor) | `olivia@taskflow.io` | `team123` |
| Phoenix Baker (Member) | `phoenix@taskflow.io` | `team123` |

## Features

- View task totals, progress, overdue work, and upcoming tasks on the dashboard.
- Create, edit, search, filter, and delete tasks.
- Assign each task, set its status and priority, and choose a due date.
- Sign in with any of the three demo accounts; the signed-in name and role appear in the workspace.
- Keep task changes in browser `localStorage` and the sign-in session in `sessionStorage`.
- Reuse shared button, form-field, modal, table, and dashboard components.

This is a frontend-only prototype. The demo sign-in is not authentication, and task data is stored only in the current browser.

## Checks

```sh
npm run lint
npm run build
```
