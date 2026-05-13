# Nexus — Project & Team Management

> A full-stack project management web application with role-based access control, task tracking, and team collaboration.

![Nexus Dashboard](https://via.placeholder.com/900x400?text=Nexus+Dashboard+Screenshot)

---

## 🔗 Live Demo

**Live URL:** `https://your-app.railway.app`  
**Demo Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | admin123 |
| Member | member@demo.com | member123 |

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Role-Based Access Control](#role-based-access-control)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Screenshots](#screenshots)

---

## ✨ Features

### Authentication
- JWT-based signup and login
- Secure password hashing with bcrypt
- Role assignment on registration (Admin / Member)
- Protected routes with token validation

### Project Management
- Create, edit, and delete projects (Admin only)
- Color-coded project cards with progress tracking
- Member assignment to projects
- Per-project task breakdown and completion percentage

### Task Management
- Create tasks with title, description, priority, due date
- Assign tasks to team members
- Status tracking: **To Do → In Progress → Done**
- Filter tasks by status, priority, and project
- Overdue detection and visual warnings

### Dashboard
- Overview stats: To Do, In Progress, Completed, Overdue
- Recent tasks feed
- Project progress bars
- Personalized greeting based on logged-in user

### Team Management (Admin only)
- View all team members with task stats
- Add new members directly from the UI
- Edit member roles
- Per-member completion metrics

### Role-Based Access Control
- **Admin** — full CRUD on all resources, can assign tasks to anyone
- **Member** — view/update own tasks, view assigned projects only

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, CSS Variables |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Deployment | Railway |
| ORM | Prisma (or pg directly) |

---

## 🏗 Architecture

```
nexus/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Dashboard, Projects, Tasks, Team
│   │   ├── context/         # Auth context
│   │   └── api/             # API utility functions
│   └── package.json
│
├── server/                  # Express backend
│   ├── routes/
│   │   ├── auth.js          # POST /api/auth/signup, /login
│   │   ├── projects.js      # CRUD /api/projects
│   │   ├── tasks.js         # CRUD /api/tasks
│   │   └── users.js         # GET/PUT /api/users
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   └── role.js          # Role-based guard
│   ├── models/              # DB models / Prisma schema
│   └── index.js             # Entry point
│
├── railway.json
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/nexus-pm.git
cd nexus-pm
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Set up the database

```bash
# Create a PostgreSQL database
createdb nexus_db

# Run migrations
cd server
npx prisma migrate dev --name init
```

### 4. Configure environment variables

```bash
cp .env.example .env
# Fill in your values (see Environment Variables section)
```

### 5. Seed demo data (optional)

```bash
cd server
npm run seed
```

### 6. Start the development servers

```bash
# In one terminal — start backend (port 5000)
cd server && npm run dev

# In another terminal — start frontend (port 3000)
cd client && npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nexus_db

# Auth
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

`.env.example` is included in the repo with all required keys (no values).

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Protected routes require a `Bearer <token>` in the `Authorization` header.

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Protected | Get current user info |

**POST `/api/auth/signup`**
```json
// Request
{
  "name": "Alex Morgan",
  "email": "alex@company.com",
  "password": "secret123",
  "role": "member"
}

// Response 201
{
  "token": "eyJhbGci...",
  "user": { "id": 1, "name": "Alex Morgan", "role": "member" }
}
```

**POST `/api/auth/login`**
```json
// Request
{ "email": "alex@company.com", "password": "secret123" }

// Response 200
{ "token": "eyJhbGci...", "user": { "id": 1, "name": "Alex Morgan", "role": "member" } }
```

---

### Projects

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects` | Protected | List projects (filtered by role) |
| POST | `/api/projects` | Admin | Create a new project |
| GET | `/api/projects/:id` | Protected | Get project details |
| PUT | `/api/projects/:id` | Admin | Update a project |
| DELETE | `/api/projects/:id` | Admin | Delete a project |
| POST | `/api/projects/:id/members` | Admin | Add member to project |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |

**POST `/api/projects`**
```json
// Request
{
  "name": "Website Redesign",
  "description": "Complete overhaul of company website",
  "color": "#185FA5",
  "memberIds": [2, 3]
}

// Response 201
{
  "id": 1,
  "name": "Website Redesign",
  "description": "...",
  "color": "#185FA5",
  "createdBy": 1,
  "createdAt": "2025-05-01",
  "members": [...]
}
```

---

### Tasks

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tasks` | Protected | List tasks (filtered by role) |
| POST | `/api/tasks` | Protected | Create a task |
| GET | `/api/tasks/:id` | Protected | Get task details |
| PUT | `/api/tasks/:id` | Protected | Update task (own or admin) |
| DELETE | `/api/tasks/:id` | Protected | Delete task (own or admin) |
| PATCH | `/api/tasks/:id/status` | Protected | Update status only |

**POST `/api/tasks`**
```json
// Request
{
  "title": "Design new homepage mockups",
  "description": "Create Figma mockups for the homepage",
  "projectId": 1,
  "assigneeId": 2,
  "status": "todo",
  "priority": "high",
  "dueDate": "2025-06-01"
}

// Response 201
{
  "id": 1,
  "title": "Design new homepage mockups",
  "status": "todo",
  "priority": "high",
  "dueDate": "2025-06-01",
  "assignee": { "id": 2, "name": "Sam Rivera" },
  "project": { "id": 1, "name": "Website Redesign" }
}
```

**PATCH `/api/tasks/:id/status`**
```json
// Request
{ "status": "in-progress" }

// Response 200
{ "id": 1, "status": "in-progress", "updatedAt": "2025-05-13T10:00:00Z" }
```

---

### Users

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | List all users |
| POST | `/api/users` | Admin | Create a user |
| GET | `/api/users/:id` | Admin | Get user details |
| PUT | `/api/users/:id` | Admin | Update user role/name |
| DELETE | `/api/users/:id` | Admin | Remove user |

---

## 🔒 Role-Based Access Control

| Action | Admin | Member |
|--------|-------|--------|
| Create/edit/delete projects | ✅ | ❌ |
| View all projects | ✅ | Own only |
| Create tasks | ✅ | ✅ |
| Assign tasks to others | ✅ | ❌ |
| Edit any task | ✅ | Own only |
| Delete any task | ✅ | Own only |
| View all tasks | ✅ | Assigned only |
| Manage team members | ✅ | ❌ |
| View team page | ✅ | ❌ |

---

## 🗄 Database Schema

```sql
-- Users
CREATE TABLE users (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(255) UNIQUE NOT NULL,
  password  VARCHAR(255) NOT NULL,
  role      VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  color       VARCHAR(20) DEFAULT '#185FA5',
  created_by  INT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Project Members (many-to-many)
CREATE TABLE project_members (
  project_id INT REFERENCES projects(id) ON DELETE CASCADE,
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, user_id)
);

-- Tasks
CREATE TABLE tasks (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  project_id  INT REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id INT REFERENCES users(id) ON DELETE SET NULL,
  created_by  INT REFERENCES users(id) ON DELETE SET NULL,
  status      VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
  priority    VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date    DATE,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

---

## 🚂 Deployment (Railway)

### One-click deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

### Manual deployment

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Add a **PostgreSQL** plugin from the Railway dashboard
4. Set environment variables in Railway's Variables tab:

```
DATABASE_URL    → (auto-filled by Railway PostgreSQL plugin)
JWT_SECRET      → your-secret-key
NODE_ENV        → production
CLIENT_URL      → https://your-app.railway.app
```

5. Railway auto-detects Node.js and runs `npm start`

### `railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 📸 Screenshots

| Dashboard | Projects | Tasks |
|-----------|----------|-------|
| ![Dashboard](https://via.placeholder.com/280x180?text=Dashboard) | ![Projects](https://via.placeholder.com/280x180?text=Projects) | ![Tasks](https://via.placeholder.com/280x180?text=Tasks) |

---

## 📁 Project Structure

```
nexus/
├── client/
│   ├── public/
│   └── src/
│       ├── api/
│       │   └── index.js         # Axios instance + API calls
│       ├── components/
│       │   ├── Avatar.jsx
│       │   ├── Badge.jsx
│       │   ├── Modal.jsx
│       │   └── Sidebar.jsx
│       ├── context/
│       │   └── AuthContext.jsx  # JWT storage + user state
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Projects.jsx
│       │   ├── Tasks.jsx
│       │   └── Team.jsx
│       └── App.jsx
│
├── server/
│   ├── middleware/
│   │   ├── auth.js              # verifyToken middleware
│   │   └── role.js              # requireAdmin middleware
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── seed.js
│   └── index.js
│
├── .env.example
├── railway.json
└── README.md
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with ❤️ using React, Node.js, Express, and PostgreSQL*
