# Food Delivery App

Responsive web MVP for ordering food from local restaurants.

## Current Status

Phase 0, Phase 1, Phase 2, and the Phase 3 backend core API are complete. The product foundation is documented in [docs/phase-0-product-foundation.md](docs/phase-0-product-foundation.md), Phase 2 in [docs/phase-2-backend-foundation.md](docs/phase-2-backend-foundation.md), and Phase 3 in [docs/phase-3-backend-core-api.md](docs/phase-3-backend-core-api.md). The frontend prototype lives in [frontend/](frontend/).

## Planned Stack

- Frontend: React, TypeScript, Vite
- Client state: Zustand
- Server state: TanStack Query
- Validation: React Hook Form and Zod
- Backend: Node.js, TypeScript, NestJS or Fastify
- Database: PostgreSQL with Prisma

The backend uses Fastify, TypeScript, Zod, PostgreSQL, Prisma, bcrypt, and JWT.

## Local Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Git

Run the frontend from the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite, usually `http://localhost:5173/`.

The current frontend is a mocked-data prototype with no backend dependency. It includes restaurant discovery, search and filters, restaurant menus, client-side cart state, checkout UI, mock order tracking, and login/signup screens.

The restaurant admin prototype is available at `http://localhost:5173/admin/login`. It includes a mocked partner login, overview dashboard, menu CRUD controls, item availability toggles, and incoming-order status controls.

Run the backend API in a second terminal:

```powershell
cd backend
npm install
npm run dev
```

For the PostgreSQL-backed API, configure `backend/.env`, then run:

```powershell
cd backend
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

## Free deployment

The recommended free deployment is:

- GitHub for source code
- Neon for hosted PostgreSQL
- Render for the Fastify API
- Vercel for the React frontend

Create a GitHub repository and push this project. In Neon, create a PostgreSQL database and copy its connection string. In Render, create the backend service from `render.yaml`, then set `DATABASE_URL` to the Neon connection string. Render will generate `JWT_SECRET` automatically.

After the Render API is deployed, copy its public URL into Vercel as the frontend environment variable:

```text
VITE_API_URL=https://your-render-api.onrender.com
```

Set Vercel's project root directory to `frontend`, build command to `npm run build`, and output directory to `dist`.
