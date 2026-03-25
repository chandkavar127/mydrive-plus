# MyDrive+

Production-ready full-stack cloud drive application with React + Vite frontend and Express + MySQL backend.

## Quick Start (2 Minutes)

```bash
# 1) install dependencies
npm install

# 2) create env files
copy server\\.env.example server\\.env
copy client\\.env.example client\\.env

# 3) create database and import schema
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mydrive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p mydrive < database/schema.sql

# 4) run app
npm run dev
```

Open:

- Frontend: http://localhost:5173
- Backend health: http://localhost:5000/health

Demo login (local):

- Email: testuser1@mydrive.com
- Password: Pass@1234

## Overview

MyDrive+ provides Google Drive-style file management with authentication, folders, file metadata, sharing, starred/trash workflows, activity tracking, and dashboard analytics.

Core stack:

- Frontend: React 18, Vite, React Router, Axios, Framer Motion
- Backend: Node.js, Express, JWT, MySQL (mysql2)
- Storage: Firebase Storage (optional, can be disabled)

## Features

- Email/password authentication with JWT
- Folder and file browsing by parent hierarchy
- Upload, rename, move, star, trash, delete operations
- Recent, starred, trash, shared-with-me views
- Search and activity timeline
- Storage/statistics summary
- Responsive UI with modern dashboard layout
- Firebase storage can be toggled off for auth-only/local testing

## Monorepo Structure

```text
.
|- client/        # React + Vite app
|- server/        # Express API
|- database/      # SQL schema
|- package.json   # npm workspaces root
```

## Requirements

- Node.js 18+
- npm 9+
- MySQL 8+

Optional:

- Firebase service account (required only for file upload/storage)

## Environment Setup

### 1) Server env

Create server/.env from server/.env.example.

Example values:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=mydrive
JWT_SECRET=change-this-secret
TOKEN_TTL=7d
FIREBASE_ENABLED=false
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_STORAGE_BUCKET=
CORS_ORIGIN=http://localhost:5173
```

Notes:

- Keep FIREBASE_ENABLED=false if you only need login/API without uploads.
- Set FIREBASE_ENABLED=true and provide all Firebase fields to enable uploads.

### 2) Client env

Create client/.env from client/.env.example:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Database Setup (MySQL)

Create database:

```sql
CREATE DATABASE IF NOT EXISTS mydrive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Import schema:

```bash
mysql -u root -p mydrive < database/schema.sql
```

Schema includes:

- users
- folders
- files
- permissions
- activity_logs

## Install

From repo root:

```bash
npm install
```

This installs root, client, and server packages via npm workspaces.

## Run (Development)

### Run both apps together

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Run separately

```bash
npm run dev:client
npm run dev:server
```

## Build

```bash
npm run build
```

Also available:

```bash
npm run start --workspace server
npm run preview --workspace client
```

## API Summary

Auth routes:

- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

Drive routes (JWT protected):

- GET /api/drive/items
- GET /api/drive/folders/tree
- GET /api/drive/recent
- GET /api/drive/starred
- GET /api/drive/trash
- GET /api/drive/stats
- GET /api/drive/activity
- GET /api/drive/search
- GET /api/drive/shared
- POST /api/drive/folders
- PATCH /api/drive/folders/:id
- PATCH /api/drive/folders/:id/trash
- DELETE /api/drive/folders/:id
- POST /api/drive/files/upload
- PATCH /api/drive/files/:id
- PATCH /api/drive/files/:id/move
- PATCH /api/drive/files/:id/star
- PATCH /api/drive/files/:id/trash
- DELETE /api/drive/files/:id
- POST /api/drive/share

## Screenshots

Add product screenshots in this section before public release.

Suggested captures:

- Login page
- Dashboard overview
- Files and folder navigation
- Share dialog
- Trash/restore flow

## Contributing

### Branch naming

- feature/<short-name>
- fix/<short-name>
- docs/<short-name>

### Local contribution flow

```bash
git checkout -b feature/your-change
npm install
npm run dev
git add .
git commit -m "feat: your change"
git push -u origin feature/your-change
```

### Commit style

- feat: new feature
- fix: bug fix
- docs: documentation change
- refactor: code cleanup without behavior change
- chore: maintenance changes

## GitHub Publish Notes

If push is rejected with non-fast-forward:

```bash
git pull --rebase origin main
git push origin main
```

If push fails with 403 permission denied, ensure the logged-in GitHub account has write access to the target repository.

## Common Issues

### 1) Invalid credentials (login)

- Check JWT_SECRET exists in server/.env
- Confirm email/password are exact and case-sensitive
- Ensure backend is running on port 5000

### 2) ERR_CONNECTION_REFUSED

- Start server with npm run dev:server
- Start client with npm run dev:client
- Verify ports 5000 and 5173 are listening

### 3) Firebase errors on startup

- Set FIREBASE_ENABLED=false to run auth/API without uploads
- Or provide full Firebase service account fields and set FIREBASE_ENABLED=true

### 4) File uploads not working

- Uploads require Firebase enabled and properly configured

## Security Notes

- Never commit real .env files or credentials
- Use a strong JWT_SECRET in production
- Restrict CORS_ORIGIN to trusted domains in production
- Use HTTPS and secure secret management for deployment

## Deployment Checklist

- Set NODE_ENV=production
- Configure production MySQL and run schema
- Set strong JWT_SECRET
- Configure CORS_ORIGIN to production frontend URL
- Enable Firebase only if storage uploads are required
- Build client and run server with process manager (PM2, systemd, container)

## License

For internal/project use. Add your preferred license before public distribution.