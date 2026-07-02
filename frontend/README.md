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

Frontend dev server berjalan di port `4321`.

### Backend
```bash
cd backend
php -S 0.0.0.0:31145 index.php
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
- PHP native built-in server
- MySQL / MariaDB
- JSON API over HTTP

## Environment Variables

Create `.env` file:
```
VITE_API_BASE_URL=http://YOUR_SERVER_IP:31145/api
```

## Default Login
- Email: admin@gfsceria.com
- Role: Administrator
