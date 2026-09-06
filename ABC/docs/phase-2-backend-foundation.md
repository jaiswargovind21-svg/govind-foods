# Phase 2: Backend Foundation

Phase 2 introduced the first API layer for the customer ordering journey. The in-memory implementation has now been replaced by the Phase 3 PostgreSQL/Prisma API.

## Current API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Confirm the API is running |
| GET | `/api/restaurants` | List restaurants; supports `search` and `cuisine` query parameters |
| GET | `/api/restaurants/:restaurantId` | Return a restaurant and its menu |
| POST | `/api/orders` | Create an order from available menu items |
| GET | `/api/orders/:orderId` | Return a single order |
| PATCH | `/api/orders/:orderId/status` | Advance an order through the allowed lifecycle |

Order status changes are sequential. The API rejects attempts to skip a status, while cancellation remains an explicit terminal action.

## Run locally

```powershell
cd backend
npm install
npm run dev
```

The API listens on `http://127.0.0.1:3000`.

## Next backend steps

See [phase-3-backend-core-api.md](phase-3-backend-core-api.md) for PostgreSQL setup, authentication, and authorization.
