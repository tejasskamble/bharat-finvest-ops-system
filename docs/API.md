# API Reference

## Base URL

`/api`

## Authentication Header

`Authorization: Bearer <token>`

## Endpoints

| Method | Route | Auth | Role | Body | Response |
|---|---|---|---|---|---|
| POST | /auth/login | No | Public | `{ email, password }` | `{ token, user }` |
| GET | /auth/me | Yes | Any | - | `{ user }` |
| GET | /employees?page=&limit= | Yes | Any | - | `{ data, pagination }` |
| GET | /employees/:id | Yes | Any | - | Employee detail + `taskCount` + `attendancePercent` |
| POST | /employees | Yes | admin, manager | Employee payload | Created employee |
| PUT | /employees/:id | Yes | admin, manager | Employee payload | Updated employee |
| DELETE | /employees/:id | Yes | admin | - | Soft-delete confirmation |
| GET | /tasks | Yes | Any | Query: `status`, `priority`, `assigned_to` | Task list |
| GET | /tasks/stats | Yes | Any | - | `{ total, pending, in_progress, completed }` |
| GET | /tasks/:id | Yes | Any | - | Task detail |
| POST | /tasks | Yes | admin, manager | Task payload | Created task |
| PUT | /tasks/:id | Yes | Any | Task payload | Updated task |
| DELETE | /tasks/:id | Yes | admin | - | Delete confirmation |
| GET | /attendance | Yes | Any | Query: `employee_id`, `from`, `to` | Attendance list |
| POST | /attendance | Yes | Any | Attendance payload | Created attendance |
| PUT | /attendance/:id | Yes | Any | Attendance payload | Updated attendance |
| GET | /attendance/summary | Yes | Any | Optional query: `month=YYYY-MM` | Monthly per-employee summary |
| GET | /dashboard/stats | Yes | Any | - | Dashboard aggregate stats |

## Standard Error Codes

| Code | Meaning | Typical Cause |
|---|---|---|
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Missing/invalid JWT |
| 403 | Forbidden | Role does not have access |
| 404 | Not Found | Missing route or record |
| 409 | Conflict | Duplicate unique value/attendance |
| 500 | Internal Server Error | Unhandled server exception |
