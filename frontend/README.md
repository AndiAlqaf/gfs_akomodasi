# GFS Ceria - Accommodation System

Modern web application for managing accommodation services at GFS Ceria.

## Features

- Dashboard with real-time statistics
- Room reservation management
- Guest check-in/check-out
- Meals services tracking
- Laundry services monitoring
- Multi-role user access

## Installation

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- TailwindCSS
- Shadcn UI
- React Query
- Zustand
- Recharts

**Backend:**
- Node.js + Express
- MongoDB/PostgreSQL
- JWT Authentication

## Environment Variables

Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:3001/api
```

## Default Login
- Email: admin@gfsceria.com
- Role: Administrator
