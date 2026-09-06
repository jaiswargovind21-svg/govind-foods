# Phase 3: Backend Core API

Phase 3 replaces the Phase 2 in-memory repository with PostgreSQL persistence through Prisma and adds authentication and role-based authorization.

## Setup

1. Install PostgreSQL and create a database named `food_delivery`.
2. Copy `.env.example` to `.env` inside `backend/`.
3. Set a long, private `JWT_SECRET`.
4. Run:

```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

The API listens on `http://127.0.0.1:3000`.

## Authentication

- `POST /api/auth/signup` creates a customer and returns a JWT.
- `POST /api/auth/login` verifies the password and returns a JWT.
- `GET /api/auth/me` returns the authenticated user.
- Passwords are hashed with bcrypt.
- Signup always creates a `CUSTOMER`; elevated roles are provisioned by an administrator/seed process.

Seeded development accounts:

```text
admin@morsel.test / ChangeMe123!
owner@saffron.test / ChangeMe123!
```

Change these credentials before using a shared or production environment.

## Authorization

- Customers can create orders and view their own orders.
- Restaurant admins can manage their owned restaurant/menu and update its orders.
- Platform admins can manage all restaurants, menus, and orders.
- The server enforces ownership checks; frontend role checks are not trusted.

## Core endpoints

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/signup` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/restaurants` | Public |
| GET | `/api/restaurants/:restaurantId` | Public |
| POST/PATCH/DELETE | `/api/restaurants` | Admin/restaurant admin |
| POST | `/api/restaurants/:restaurantId/menu` | Owner/admin |
| PATCH/DELETE | `/api/menu/:menuItemId` | Owner/admin |
| POST | `/api/orders` | Customer/admin |
| GET | `/api/orders/:orderId` | Owner/customer/admin |
| PATCH | `/api/orders/:orderId/status` | Restaurant admin/admin |

Order item names and prices are copied into `OrderItem` records so menu edits do not alter historical orders.
