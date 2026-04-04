# Finance Dashboard API – Endpoint Reference

Base URL: `http://localhost:5000`

Interactive docs (Swagger UI): `http://localhost:5000/api-docs`

---

## Rate Limiting

| Scope | Limit |
|-------|-------|
| All `/api/*` routes | 100 requests / 15 minutes per IP |
| `/api/auth/*` routes | 30 requests / 15 minutes per IP (stricter, applied on top) |

Responses when the limit is exceeded return **HTTP 429** with:
```json
{ "success": false, "message": "Too many requests, please try again later" }
```

---

## Authentication

All protected routes require a **Bearer JWT token** in the `Authorization` header:
```
Authorization: Bearer <token>
```

Roles: `viewer` · `analyst` · `admin`

---

## Health Check

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | Returns API status and timestamp |

---

## Auth Routes — `/api/auth`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/api/auth/register` | Required | Admin | Register a new user (admin-only, no public sign-up) |
| POST | `/api/auth/login` | None | — | Log in and receive a JWT token |
| GET | `/api/auth/me` | Required | Any | Get the currently authenticated user's profile |

### POST `/api/auth/register`
**Request body:**
```json
{
  "name": "Alice Admin",
  "email": "alice@example.com",
  "password": "secret123",
  "role": "viewer"
}
```
**Responses:** `201 Created` · `401 Unauthorized` · `403 Forbidden` · `409 Conflict (duplicate email)` · `422 Validation error`

---

### POST `/api/auth/login`
**Request body:**
```json
{ "email": "alice@example.com", "password": "secret123" }
```
**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "user": { "id": "...", "name": "Alice", "role": "admin" }, "token": "<jwt>" }
}
```
**Responses:** `200 OK` · `401 Invalid credentials` · `422 Validation error`

---

### GET `/api/auth/me`
**Responses:** `200 OK` · `401 Unauthorized`

---

## User Management Routes — `/api/users`

> All routes require **Admin** role.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | List all users (filter by role/status) |
| POST | `/api/users` | Create a new user |
| GET | `/api/users/:id` | Get a specific user by ID |
| PATCH | `/api/users/:id` | Update a user (name, role, status) |
| DELETE | `/api/users/:id` | Permanently delete a user |

### GET `/api/users`
**Query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `role` | string | Filter by role: `viewer` \| `analyst` \| `admin` |
| `status` | string | Filter by status: `active` \| `inactive` |

**Responses:** `200 OK` · `403 Forbidden`

---

### POST `/api/users`
**Request body:**
```json
{
  "name": "Bob Viewer",
  "email": "bob@example.com",
  "password": "pass123",
  "role": "viewer"
}
```
**Responses:** `201 Created` · `409 Duplicate email` · `422 Validation error`

---

### GET `/api/users/:id`
**Responses:** `200 OK` · `404 Not found`

---

### PATCH `/api/users/:id`
**Request body (any combination of):**
```json
{ "name": "Bob", "role": "analyst", "status": "inactive" }
```
**Responses:** `200 OK` · `404 Not found` · `422 Validation error`

---

### DELETE `/api/users/:id`
**Responses:** `200 OK` · `404 Not found`

---

## Financial Record Routes — `/api/records`

> All routes require authentication. Write operations require **Admin** role.

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/records` | Viewer, Analyst, Admin | List records with filtering and pagination |
| GET | `/api/records/:id` | Viewer, Analyst, Admin | Get a single record by ID |
| POST | `/api/records` | Admin | Create a new financial record |
| PATCH | `/api/records/:id` | Admin | Update an existing record |
| DELETE | `/api/records/:id` | Admin | Soft-delete a record |

### GET `/api/records`
**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | string | — | Filter by `income` or `expense` |
| `category` | string | — | Filter by category (partial match, case-insensitive) |
| `startDate` | date | — | Filter records on or after this date (ISO 8601) |
| `endDate` | date | — | Filter records on or before this date (ISO 8601) |
| `search` | string | — | Full-text search across category and notes |
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Results per page |
| `sortBy` | string | `date` | Sort field |
| `sortOrder` | string | `desc` | `asc` or `desc` |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "records": [...],
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### POST `/api/records`
**Request body:**
```json
{
  "amount": 500.00,
  "type": "income",
  "category": "Salary",
  "date": "2024-01-15",
  "notes": "Monthly salary deposit",
  "paymentMethod": "NEFT"
}
```
`paymentMethod` options: `Credit Card` · `Debit Card` · `UPI` · `NEFT` · `CASH`

**Responses:** `201 Created` · `403 Forbidden` · `422 Validation error`

---

### PATCH `/api/records/:id`
**Request body (any combination of):**
```json
{ "amount": 600, "category": "Bonus", "notes": "Q1 bonus" }
```
**Responses:** `200 OK` · `403 Forbidden` · `404 Not found`

---

### DELETE `/api/records/:id`
Performs a **soft delete** — the record is hidden from all queries but preserved in the database.

**Responses:** `200 OK` · `403 Forbidden` · `404 Not found`

---

## Dashboard Routes — `/api/dashboard`

> All routes require authentication.

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard/summary` | Viewer, Analyst, Admin | Total income, expenses, and net balance |
| GET | `/api/dashboard/category-totals` | Analyst, Admin | Expense totals grouped by category |
| GET | `/api/dashboard/recent` | Viewer, Analyst, Admin | Most recent financial records |
| GET | `/api/dashboard/monthly-trends` | Analyst, Admin | Month-by-month income/expense totals |
| GET | `/api/dashboard/weekly-trends` | Analyst, Admin | Week-by-week income/expense totals |

---

### GET `/api/dashboard/summary`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 12000,
    "totalExpenses": 7500,
    "netBalance": 4500,
    "recordCount": 38
  }
}
```

---

### GET `/api/dashboard/category-totals`
**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "category": "Rent", "amount": 3000, "count": 3 },
    { "category": "Food", "amount": 1200, "count": 12 }
  ]
}
```

---

### GET `/api/dashboard/recent`
**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | integer | `10` | Number of records to return |

---

### GET `/api/dashboard/monthly-trends`
**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `year` | integer | current year | Year to aggregate (e.g. `2024`) |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "month": 1, "income": 5000, "expenses": 2500 },
    { "month": 2, "income": 4800, "expenses": 3100 }
  ]
}
```

---

### GET `/api/dashboard/weekly-trends`
**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `weeks` | integer | `8` | Number of past weeks to include |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "week": 1, "year": 2024, "income": 1200, "expenses": 800 }
  ]
}
```

---

## Common Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Bad request / invalid input |
| 401 | Not authenticated (missing or invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |
| 422 | Validation error (field-level details included) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

**Error response shape:**
```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": ["field-level detail 1", "field-level detail 2"]
}
```
