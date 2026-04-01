# Finance Dashboard API

A production-quality **REST API backend** for a Finance Dashboard system built with **Node.js**, **Express.js**, and **MongoDB**. Supports user management, financial records, dashboard analytics, JWT authentication, and role-based access control.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
  - [Authentication](#authentication)
  - [Users (Admin only)](#users-admin-only)
  - [Financial Records](#financial-records)
  - [Dashboard Analytics](#dashboard-analytics)
- [Role-Based Access Control](#role-based-access-control)
- [Rate Limiting](#rate-limiting)
- [Validation & Error Handling](#validation--error-handling)
- [API Documentation (Swagger)](#api-documentation-swagger)
- [Running Tests](#running-tests)
- [Assumptions & Design Decisions](#assumptions--design-decisions)

---

## Tech Stack

| Layer           | Technology                                  |
|-----------------|---------------------------------------------|
| Runtime         | Node.js v20+                                |
| Framework       | Express.js v5                               |
| Database        | MongoDB with Mongoose v9 ODM               |
| Authentication  | JSON Web Tokens (jsonwebtoken)             |
| Password hashing| bcryptjs                                    |
| Validation      | express-validator                           |
| Rate limiting   | express-rate-limit                          |
| API docs        | swagger-jsdoc + swagger-ui-express          |
| Security headers| helmet + cors                               |
| Logging         | morgan                                      |
| Testing         | Jest + Supertest                            |

---

## Project Structure

```
src/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── auth.controller.js     # Auth HTTP handlers
│   ├── dashboard.controller.js
│   ├── record.controller.js
│   └── user.controller.js
├── docs/
│   └── swagger.js             # OpenAPI 3.0 spec
├── middleware/
│   ├── auth.middleware.js     # JWT verification
│   ├── error.middleware.js    # Global error handler
│   ├── role.middleware.js     # Role-based access control
│   └── validate.middleware.js # express-validator runner
├── models/
│   ├── FinancialRecord.js     # Financial record schema
│   └── User.js                # User schema with bcrypt hooks
├── routes/
│   ├── auth.routes.js
│   ├── dashboard.routes.js
│   ├── index.js               # Route aggregator
│   ├── record.routes.js
│   └── user.routes.js
├── services/
│   ├── auth.service.js        # Register/login business logic
│   ├── dashboard.service.js   # Aggregation queries
│   ├── record.service.js      # CRUD + filtering
│   └── user.service.js        # User management
├── utils/
│   ├── jwt.js                 # Token generation/verification
│   └── response.js            # Standardized API responses
├── validators/
│   ├── auth.validator.js
│   ├── record.validator.js
│   └── user.validator.js
├── app.js                     # Express app (no server start)
└── server.js                  # HTTP server entry point

tests/
├── unit/
│   ├── auth.service.test.js
│   ├── dashboard.service.test.js
│   ├── record.service.test.js
│   └── user.service.test.js
└── integration/
    ├── auth.routes.test.js
    ├── dashboard.routes.test.js
    └── record.routes.test.js
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/GaganBansalCSE/FINANCE.git
cd FINANCE

# 2. Install dependencies
npm install

# 3. Copy environment file and configure
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET

# 4. Start the server
npm start
```

The server will start on `http://localhost:5000`.  
API documentation will be available at `http://localhost:5000/api-docs`.

### Development mode (with auto-restart)

```bash
npm run dev
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable               | Description                                    | Default                        |
|------------------------|------------------------------------------------|--------------------------------|
| `PORT`                 | HTTP server port                               | `5000`                         |
| `NODE_ENV`             | Environment (`development`/`production`/`test`)| `development`                  |
| `MONGO_URI`            | MongoDB connection string                      | `mongodb://localhost:27017/finance_db` |
| `JWT_SECRET`           | Secret key for JWT signing                     | *(required – change this!)*    |
| `JWT_EXPIRES_IN`       | JWT expiry duration                            | `7d`                           |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds              | `900000` (15 min)              |
| `RATE_LIMIT_MAX`       | Max requests per window per IP                 | `100`                          |

---

## API Overview

All API endpoints are prefixed with `/api`. Protected routes require:

```
Authorization: Bearer <JWT_TOKEN>
```

### Authentication

| Method | Endpoint              | Access  | Description                     |
|--------|-----------------------|---------|---------------------------------|
| POST   | `/api/auth/register`  | Public  | Register new user (default: viewer) |
| POST   | `/api/auth/login`     | Public  | Login and receive JWT token     |
| GET    | `/api/auth/me`        | Private | Get current user profile        |

#### Register example

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123","role":"admin"}'
```

#### Login example

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

---

### Users (Admin only)

| Method | Endpoint         | Description                          |
|--------|------------------|--------------------------------------|
| GET    | `/api/users`     | List users (filter: `?role=`, `?status=`) |
| POST   | `/api/users`     | Create a user                        |
| GET    | `/api/users/:id` | Get user by ID                       |
| PATCH  | `/api/users/:id` | Update name, role, or status         |
| DELETE | `/api/users/:id` | Permanently delete a user            |

---

### Financial Records

| Method | Endpoint            | Access              | Description                        |
|--------|---------------------|---------------------|------------------------------------|
| GET    | `/api/records`      | All roles           | List records with filtering/pagination |
| POST   | `/api/records`      | Analyst, Admin      | Create a record                    |
| GET    | `/api/records/:id`  | All roles           | Get a record by ID                 |
| PATCH  | `/api/records/:id`  | Admin only          | Update a record                    |
| DELETE | `/api/records/:id`  | Admin only          | Soft-delete a record               |

#### List records – supported query parameters

| Parameter   | Type     | Description                             |
|-------------|----------|-----------------------------------------|
| `type`      | string   | Filter: `income` or `expense`           |
| `category`  | string   | Filter by category (case-insensitive)   |
| `startDate` | ISO date | Filter records on or after this date    |
| `endDate`   | ISO date | Filter records on or before this date   |
| `search`    | string   | Search in category and notes fields     |
| `page`      | integer  | Page number (default: 1)                |
| `limit`     | integer  | Results per page (default: 20, max: 100)|
| `sortBy`    | string   | Sort field (default: `date`)            |
| `sortOrder` | string   | `asc` or `desc` (default: `desc`)       |

#### Create record example

```bash
curl -X POST http://localhost:5000/api/records \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"type":"income","category":"Salary","date":"2024-01-15","notes":"Monthly salary"}'
```

---

### Dashboard Analytics

| Method | Endpoint                          | Access         | Description                        |
|--------|-----------------------------------|----------------|------------------------------------|
| GET    | `/api/dashboard/summary`          | All roles      | Total income, expenses, net balance |
| GET    | `/api/dashboard/category-totals`  | Analyst, Admin | Totals grouped by category         |
| GET    | `/api/dashboard/recent`           | All roles      | Recent records (`?limit=10`)        |
| GET    | `/api/dashboard/monthly-trends`   | Analyst, Admin | Month-by-month trends (`?year=2024`)|
| GET    | `/api/dashboard/weekly-trends`    | Analyst, Admin | Week-by-week trends (`?weeks=8`)    |

#### Summary example response

```json
{
  "success": true,
  "message": "Dashboard summary retrieved",
  "data": {
    "totalIncome": 12000,
    "totalExpenses": 4500,
    "netBalance": 7500
  }
}
```

---

## Role-Based Access Control

Three roles with increasing levels of access:

| Action                              | Viewer | Analyst | Admin |
|-------------------------------------|:------:|:-------:|:-----:|
| View records list                   | ✅     | ✅      | ✅    |
| View individual record              | ✅     | ✅      | ✅    |
| View dashboard summary              | ✅     | ✅      | ✅    |
| View recent activity                | ✅     | ✅      | ✅    |
| Create records                      | ❌     | ✅      | ✅    |
| View category totals                | ❌     | ✅      | ✅    |
| View monthly/weekly trends          | ❌     | ✅      | ✅    |
| Update records                      | ❌     | ❌      | ✅    |
| Delete records (soft)               | ❌     | ❌      | ✅    |
| Manage users (CRUD)                 | ❌     | ❌      | ✅    |

RBAC is enforced via the `authorize(...roles)` middleware applied at the route level.

---

## Rate Limiting

Two tiers of rate limiting protect the API from abuse:

| Tier   | Endpoints                           | Limit                  |
|--------|-------------------------------------|------------------------|
| Auth   | `/api/auth/login`, `/api/auth/register` | 20 requests / 15 min |
| Global | All routes                          | 100 requests / 15 min  |

Limits are configurable via environment variables (`RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`).

---

## Validation & Error Handling

All inputs are validated using **express-validator** before reaching the business logic. Errors return consistent JSON responses:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Amount must be a positive number", "Type is required"]
}
```

HTTP status codes used:

| Code | Meaning                                    |
|------|--------------------------------------------|
| 200  | OK                                         |
| 201  | Created                                    |
| 400  | Bad request (invalid ID format)            |
| 401  | Unauthorized (no/invalid/expired token)    |
| 403  | Forbidden (insufficient role)              |
| 404  | Resource not found                         |
| 409  | Conflict (duplicate email)                 |
| 422  | Unprocessable entity (validation failure)  |
| 429  | Too many requests (rate limit exceeded)    |
| 500  | Internal server error                      |

---

## API Documentation (Swagger)

Interactive API documentation is available at:

```
http://localhost:5000/api-docs
```

The spec is defined in `src/docs/swagger.js` using **OpenAPI 3.0**. You can authorize using your JWT token via the "Authorize" button in the Swagger UI.

---

## Running Tests

Tests are written with **Jest** and **Supertest**. The service layer is mocked so **no database is required** to run the tests.

```bash
# Run all tests
npm test

# Run with verbose output
npm run test:verbose

# Run with coverage report
npm run test:coverage
```

### Test structure

| Test type       | Location                         | What is tested                              |
|-----------------|----------------------------------|---------------------------------------------|
| Unit tests      | `tests/unit/*.service.test.js`   | Business logic in service classes           |
| Integration tests | `tests/integration/*.routes.test.js` | HTTP routes, middleware, RBAC, validation |

---

## Assumptions & Design Decisions

1. **Default role is `viewer`**: Public registration produces a viewer-level account. Admins can elevate roles via the users API.

2. **Soft delete for records**: Financial records are never permanently deleted. Setting `isDeleted=true` hides them from normal queries while preserving the audit trail. If hard delete is required it can be added as a separate admin-only endpoint.

3. **Analyst can create but not modify records**: Analysts are trusted with data entry but not with corrections/deletions, which require an admin approval workflow.

4. **Self-registration included**: The `/api/auth/register` endpoint is public so that seeding the first admin is possible. In a real deployment you might restrict this or seed the admin via a migration script.

5. **JWT is stateless**: There is no token revocation store. If a user is deactivated, their existing tokens will be rejected at the middleware level (we check `user.status` on every authenticated request).

6. **Pagination defaults**: Records default to 20 per page, sorted by date descending.

7. **Category is a free-form string**: No predefined category taxonomy, giving maximum flexibility. Filtering is case-insensitive regex so `salary` matches `Salary`.

8. **Tests use Jest mocks**: Because `mongodb-memory-server` requires downloading a MongoDB binary (which may not be available in restricted environments), the test suite mocks Mongoose models and services. This gives fast, offline-capable unit and integration tests while fully verifying business logic and HTTP behavior.
