# Bharat Finvest Ops System - Command Guide (Windows CMD)

This guide is written for beginners and uses **Windows CMD** commands.

## 1) Project Start Commands

```cmd
cd %USERPROFILE%\Downloads\bharat-finvest-ops-system
```

If your project is in another location, replace the path accordingly.

Open **2 CMD windows**:
- CMD 1 for backend
- CMD 2 for frontend

## 2) Backend Commands

```cmd
cd backend
npm install
npm run dev
```

Expected backend URL:
- `http://localhost:5000`

## 3) Frontend Commands

```cmd
cd frontend
npm install
npm run dev
```

Expected frontend URL:
- `http://localhost:5173`

## 4) MySQL Database Commands

Use this full path (since `mysql` is not in PATH):

```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
```

Open MySQL:

```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

Select database:

```sql
USE bharat_finvest_ops;
```

Import schema and seed:

```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < database\schema.sql
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p bharat_finvest_ops < database\seed.sql
```

## 5) Commands to View Database Data

```sql
USE bharat_finvest_ops;
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM employees;
SELECT * FROM tasks;
SELECT * FROM attendance LIMIT 20;
```

## 6) Commands to Check Users, Employees, Tasks, Attendance

### Users

```sql
SELECT id, name, email, role FROM users;
```

### Employees

```sql
SELECT * FROM employees;
SELECT department, COUNT(*) FROM employees GROUP BY department;
```

### Tasks

```sql
SELECT * FROM tasks;
SELECT status, COUNT(*) FROM tasks GROUP BY status;
```

### Attendance

```sql
SELECT * FROM attendance LIMIT 20;
```

## 7) Commands to Reset Database

```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "DROP DATABASE IF EXISTS bharat_finvest_ops;"
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < database\schema.sql
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p bharat_finvest_ops < database\seed.sql
```

## 8) Commands to Stop Running Servers

If servers are running in CMD windows, press:

```cmd
Ctrl + C
```

If Node processes are still running:

```cmd
tasklist | findstr node
taskkill /F /IM node.exe
```

## 9) Common Error Fixes

### Error: `'mysql' is not recognized`
Use full path command:

```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

### Error: `Access denied for user 'root'`
- Re-check MySQL root password
- Re-run schema + seed import with correct password

### Error: `EADDRINUSE: port already in use`
Find and kill process using port:

```cmd
netstat -ano | findstr :5000
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

### Frontend not loading API data
- Ensure backend is running on `5000`
- Ensure frontend is running on `5173`
- Restart both servers

### Login fails for demo users
- Reset database (drop + schema + seed)
- Check `users` table values using:

```sql
SELECT id, name, email, role FROM users;
```

## 10) Demo Login Credentials

- Admin: `admin@bharatfinvest.com` / `Admin@123`
- Manager: `manager@bharatfinvest.com` / `Manager@123`
- Employee: `employee@bharatfinvest.com` / `Emp@123`

## Demo Flow for College Viva

1. Start backend
2. Start frontend
3. Open `http://localhost:5173`
4. Login as admin
5. Show dashboard
6. Show employees
7. Show tasks
8. Show attendance
9. Show reports PDF

## 🚀 One-Click Project Run (Recommended)

You can run the entire project using a single file.

```cmd
Double-click:
start-project.bat
```

OR from CMD:

```cmd
cd %USERPROFILE%\Downloads\bharat-finvest-ops-system
start start-project.bat
```

- This will automatically start backend and frontend
- It will open the browser at `http://localhost:5173`
- No need to run multiple commands manually

Make sure database is already imported before using this.
