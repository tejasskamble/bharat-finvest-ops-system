# Bharat Finvest Internal Operations Management System

This project is a client-inspired prototype designed to digitize internal
operations such as employee management, task tracking, attendance, and reporting.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Bootstrap, Chart.js, jsPDF |
| Backend | Node.js, Express, MySQL2, JWT, bcrypt |
| Database | MySQL 8 |
| DevOps | Docker, Docker Compose, Nginx |

## Prerequisites

- Node.js 18+
- npm 9+
- MySQL 8+
- Docker Desktop (optional)

## Database Setup

1. `mysql -u root -p < database/schema.sql`
2. `mysql -u root -p bharat_finvest_ops < database/seed.sql`

## Run Locally

1. `cd backend && npm install && npm run dev`
2. `cd frontend && npm install && npm run dev`
3. Open `http://localhost:5173`

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@bharatfinvest.com | Admin@123 |
| Manager | manager@bharatfinvest.com | Manager@123 |
| Employee | employee@bharatfinvest.com | Emp@123 |

## Docker Setup

1. `docker-compose up --build`
2. Open `http://localhost`

## Features

- Secure JWT-based authentication with role-based access
- Employee lifecycle management with status toggling
- Task assignment, tracking, filtering, and analytics
- Attendance marking, filtering, and summary insights
- Dashboard KPIs with charts and live status indicators
- PDF report export for employee, task, and attendance data

## Screenshots

- Login Screen (placeholder)
- Dashboard Overview (placeholder)
- Employee Management (placeholder)
- Task Tracking (placeholder)
- Attendance Monitor (placeholder)
- Reports Export (placeholder)

## Developer Roadmap

- Add audit logs for user actions
- Add department-wise productivity analytics
- Add email alerts for overdue tasks
- Add export scheduling and recurring reports

## Viva Preparation Talking Points

- Why MySQL relational design suits ops workflows
- JWT + role middleware security design
- Separation of concerns across controllers/routes/context
- Containerized deployment path for consistent environments
- Real-time operational visibility through dashboard metrics
