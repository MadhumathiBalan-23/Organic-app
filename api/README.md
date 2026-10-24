# AgriFlow Organic Farming API

Backend microservice-structured REST API for the Organic Farming platform (supporting both Web Admin Dashboard and Mobile App).

## Tech Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **ORM / Database**: Prisma ORM with SQLite
- **Security**: CORS, JSON body parser

## Architecture
```
src/
├── app.ts                 # Express app initialization & middleware configuration
├── server.ts              # Server bootstrap and port listening
├── config/                # Environment and database client configuration
├── controllers/           # HTTP request/response handlers
├── services/              # Core business logic and database queries
├── routes/                # Modular REST route definitions
├── middlewares/           # Logger, auth, and error handling middlewares
└── types/                 # Shared TypeScript interfaces & types
```

## Available API Endpoints

### Health & Auth
- `GET /api/health` - API health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories & Brands
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/brands` - List brands
- `POST /api/brands` - Create brand
- `PUT /api/brands/:id` - Update brand
- `DELETE /api/brands/:id` - Delete brand

### Orders, Subscriptions & Deliveries
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Delete order
- `GET /api/subscriptions` - List active subscriptions
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription
- `GET /api/deliveries` - List delivery tasks
- `PUT /api/deliveries/:id` - Update delivery status

### Dashboard, Users & Logs
- `GET /api/dashboard/stats` - Live KPI metrics (revenue, orders, low-stock, customers)
- `GET /api/customers` - List customer directory
- `GET /api/vendor-requests` - List vendor registration requests
- `PUT /api/vendor-requests/:id` - Approve / reject vendor request
- `GET /api/user-logs` - Audit logs & user activity
- `GET /api/ai-alerts` - Predictive AI crop demand alerts

## Setup & Running

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client & migrate
npx prisma generate
npx prisma db push

# 3. Seed initial database (optional)
npm run seed

# 4. Start in development mode
npm run dev

# 5. Build for production
npm run build
npm start
```
