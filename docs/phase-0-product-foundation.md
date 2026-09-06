# Phase 0: Product Foundation

## Product Direction

Build a responsive web MVP that lets customers discover restaurants, order food, and follow order progress. Restaurants manage menus and process orders. Administrators manage the platform.

The first release focuses on one city or delivery area. Delivery-partner workflows and advanced logistics are intentionally deferred until the ordering loop is proven.

## MVP Roles

### Customer

- Browse and search restaurants
- Filter by cuisine, availability, and rating
- View menus and item details
- Manage a cart
- Add a delivery address
- Place an order and pay
- Track order status
- View order history

### Restaurant Staff

- Manage restaurant details and opening status
- Create and update menu categories and items
- Accept or reject incoming orders
- Update preparation status
- Review current and previous orders

### Administrator

- Approve and manage restaurants
- Manage users and roles
- View and update orders when support is required
- Review basic platform activity

## Core Customer Journey

1. Customer opens the restaurant listing.
2. Customer searches or filters restaurants.
3. Customer opens a restaurant and selects menu items.
4. Customer reviews the cart and chooses an address.
5. Customer completes checkout and payment.
6. The order is created with a confirmation number.
7. Restaurant accepts the order and updates its status.
8. Customer views the latest order status.
9. Customer sees the completed order in order history.

## Order Lifecycle

Valid transitions for the MVP:

```text
PLACED -> ACCEPTED -> PREPARING -> READY_FOR_PICKUP -> OUT_FOR_DELIVERY -> DELIVERED
   |          |            |              |                 |
   +----------+------------+--------------+-----------------+-> CANCELLED
```

The backend will enforce these transitions. Clients must not be allowed to move an order directly to an arbitrary status.

## Initial Screens

### Customer

- Restaurant listing
- Search and filter results
- Restaurant details and menu
- Cart
- Address selection
- Checkout
- Order confirmation
- Active order tracking
- Order history
- Profile

### Restaurant

- Dashboard
- Menu management
- Order queue
- Order details
- Restaurant settings

### Admin

- Overview dashboard
- Restaurant management
- User management
- Order management

## Scope Decisions

Included in the MVP:

- Responsive web experience
- Customer, restaurant, and admin roles
- Restaurant discovery and menu browsing
- Cart and checkout
- Payment integration boundary
- Restaurant order processing
- Order status updates

Deferred:

- Native mobile applications
- Delivery-partner application
- Live GPS tracking
- Multi-city operations
- Scheduled orders
- Coupons and loyalty programs
- Recommendations
- Advanced restaurant analytics

## Technical Decisions

- Start with a React and TypeScript frontend using Vite.
- Build the frontend with mocked data before connecting a backend.
- Keep API-facing types separate from UI components.
- Use PostgreSQL as the source of truth for users, restaurants, menus, and orders.
- Store order item names and prices as snapshots so historical orders do not change when menus change.
- Treat payment-provider webhooks as the trusted source for payment confirmation.
- Enforce role-based access on the backend, not only in the frontend.

## Phase 0 Acceptance Criteria

- MVP roles and responsibilities are documented.
- Core customer journey is documented.
- Order states and valid transitions are defined.
- Initial screens are listed for each role.
- Included and deferred scope is explicit.
- Frontend and backend stack decisions are recorded.
- Node.js is available locally before frontend scaffolding begins.

## Next Step

Install Node.js 20 or newer, reopen the terminal so `node`, `npm`, and `npx` are available, then run the bootstrap commands in the repository README. After the build passes, Phase 1 starts with the frontend shell, routing, design tokens, and mocked restaurant data.
