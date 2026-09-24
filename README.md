# Full-Stack Kanban Task Management Web App

A production-ready Full-Stack Kanban task management platform built with **Node.js (Node 24 ESM)**, **Express.js**, **PostgreSQL (Prisma ORM)**, and **Angular 19+**.

---

## Architecture Overview

```text
kanban-task-mgt-interaction/
├── server/                         # Express ESM Backend API
│   ├── prisma/
│   │   ├── schema.prisma           # PostgreSQL Data Models
│   │   └── seed.ts                 # Database Seeder Script
│   ├── src/
│   │   ├── controllers/            # Route controllers
│   │   ├── middleware/             # Auth JWT, Zod Validation, RBAC
│   │   ├── routes/                 # API endpoint routers (/auth, /boards, /columns, /tasks)
│   │   ├── services/               # Business logic & DND transaction engine
│   │   └── utils/                  # Pino logger, JWT, Bcrypt, Response envelope
│   └── tests/
│       └── integration/            # Jest + Supertest integration test suite
└── src/                            # Angular 19+ Frontend Client
    ├── app/
    │   ├── components/             # Reusable UI components & dialogs
    │   ├── models/                 # TypeScript interfaces
    │   ├── pages/                  # Route views (Board details, etc.)
    │   ├── services/               # KanbanApiService & BoardService
    │   └── store/                  # NgRx Store, Actions, Reducers, Effects
```

---

## Key Features

* **User Authentication & RBAC Authorization:** JWT token auth, bcrypt password hashing, global roles (`ADMIN`, `USER`), and board-level roles (`OWNER`, `EDITOR`, `VIEWER`).
* **Transactional Drag-and-Drop Reordering:** Atomic column & task position shifts via `prisma.$transaction` ensuring zero gap 0-indexed positions.
* **Persistent Board & Column CRUD:** Real-time persistence for boards, columns, tasks, subtasks, and collaborators.
* **Activity Log Tracker:** Records board creation, task moves, and user actions (`GET /boards/:id/activities`).
* **Theme Preference Sync:** Real-time theme switching (`PATCH /auth/theme`) persisted per user in PostgreSQL.

---

## Live Deployment & Cloud Infrastructure

* **Frontend Angular Client (Vercel):** https://kanban-task-webapp.vercel.app
* **Backend Serverless API (Vercel):** https://kanban-backend-api-nine.vercel.app
* **Health Check Endpoint:** https://kanban-backend-api-nine.vercel.app/health
* **Cloud Database:** Neon PostgreSQL (`ep-misty-waterfall-b56zqq0f`)

### Live Demo Credentials
* **Admin User:** `admin@kanban.local` / `Password123!`
* **Developer User:** `developer@kanban.local` / `Password123!`

---

## Local Setup Guide

### Prerequisites
* Node.js v22+
* PostgreSQL running locally on `localhost:5432`

### 1. Database & Environment Configuration

Create PostgreSQL database `kanban_db`:
```bash
createdb kanban_db
```

Configure `server/.env`:
```env
DATABASE_URL="postgresql://axcel@localhost:5432/kanban_db?schema=public"
JWT_SECRET="super-secret-kanban-jwt-key-2026"
PORT=3000
NODE_ENV=development
```

### 2. Database Migration & Seeding

```bash
# Generate Prisma Client & Sync Database Schema
npm run --prefix server prisma:generate
npm run --prefix server prisma:migrate

# Seed Demo Data (Admin & Developer Users + Sample Boards)
npm run server:seed
```

Demo Credentials seeded:
* **Admin:** `admin@kanban.local` / `Password123!`
* **Developer:** `developer@kanban.local` / `Password123!`

---

## Development & Test Commands

```bash
# Start Backend Server in Dev Mode (Express on http://localhost:3000)
npm run server:dev

# Run Backend Integration Test Suite (Jest + Supertest)
npm run server:test

# Start Angular Frontend Client (ng serve)
npm run client:start

# Build Angular Frontend Production Bundle
npm run build
```

---

## API Endpoints Specification

All API responses return a standardized envelope:
```json
{ "status": "success", "data": { ... } }
```

### Authentication & User
* `POST /auth/register` — Create user account & receive JWT token
* `POST /auth/login` — Authenticate credentials & receive JWT token
* `GET /auth/me` — Fetch authenticated user profile
* `PATCH /auth/theme` — Update user theme preference (`light` | `dark`)

### Board & Column Operations
* `GET /boards` — Fetch user's owned and collaborated boards
* `POST /boards` — Create board with optional initial columns
* `GET /boards/:id` — Fetch complete nested board shape
* `PUT /boards/:id` — Update board title (OWNER / EDITOR)
* `DELETE /boards/:id` — Delete board (OWNER only)
* `GET /boards/:id/activities` — Fetch board activity history
* `POST /boards/:id/collaborators` — Invite collaborator (`OWNER` | `EDITOR` | `VIEWER`)
* `POST /boards/:id/columns` — Append new column to board
* `PUT /columns/:id` — Rename column
* `DELETE /columns/:id` — Delete column and compact positions

### Task & Drag-and-Drop Operations
* `POST /tasks` — Create task with subtasks & auto-positioning
* `GET /tasks/:id` — Fetch task details
* `PUT /tasks/:id` — Update task details and subtasks
* `DELETE /tasks/:id` — Delete task and compact position indices
* `PATCH /tasks/:id/move` — Transactional drag-and-drop reordering:
  ```json
  {
    "targetColumnId": "column-uuid",
    "newPosition": 2
  }
  ```
