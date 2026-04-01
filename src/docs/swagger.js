/**
 * Swagger / OpenAPI 3.0 configuration.
 *
 * swagger-jsdoc reads JSDoc @swagger annotations from route files,
 * but here we define the full spec inline for clarity and completeness.
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Dashboard API',
      version: '1.0.0',
      description:
        'REST API for the Finance Dashboard system. Supports user management, financial records, ' +
        'dashboard analytics, and role-based access control.',
      contact: {
        name: 'Finance API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────────────────────
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Alice Admin' },
            email: { type: 'string', format: 'email', example: 'alice@example.com' },
            password: { type: 'string', minLength: 6, example: 'secret123' },
            role: {
              type: 'string',
              enum: ['viewer', 'analyst', 'admin'],
              default: 'viewer',
            },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'alice@example.com' },
            password: { type: 'string', example: 'secret123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/UserProfile' },
                token: { type: 'string' },
              },
            },
          },
        },
        UserProfile: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['viewer', 'analyst', 'admin'] },
            status: { type: 'string', enum: ['active', 'inactive'] },
          },
        },
        // ── Users ─────────────────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['viewer', 'analyst', 'admin'] },
            status: { type: 'string', enum: ['active', 'inactive'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateUserInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            role: { type: 'string', enum: ['viewer', 'analyst', 'admin'] },
          },
        },
        UpdateUserInput: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            role: { type: 'string', enum: ['viewer', 'analyst', 'admin'] },
            status: { type: 'string', enum: ['active', 'inactive'] },
          },
        },
        // ── Financial Records ─────────────────────────────────────────────
        FinancialRecord: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            amount: { type: 'number' },
            type: { type: 'string', enum: ['income', 'expense'] },
            category: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            notes: { type: 'string' },
            createdBy: { $ref: '#/components/schemas/UserProfile' },
            isDeleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateRecordInput: {
          type: 'object',
          required: ['amount', 'type', 'category'],
          properties: {
            amount: { type: 'number', example: 500.0 },
            type: { type: 'string', enum: ['income', 'expense'] },
            category: { type: 'string', example: 'Salary' },
            date: { type: 'string', format: 'date', example: '2024-01-15' },
            notes: { type: 'string', example: 'Monthly salary deposit' },
          },
        },
        UpdateRecordInput: {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            type: { type: 'string', enum: ['income', 'expense'] },
            category: { type: 'string' },
            date: { type: 'string', format: 'date' },
            notes: { type: 'string' },
          },
        },
        // ── Dashboard ─────────────────────────────────────────────────────
        DashboardSummary: {
          type: 'object',
          properties: {
            totalIncome: { type: 'number' },
            totalExpenses: { type: 'number' },
            netBalance: { type: 'number' },
          },
        },
        // ── Generic Responses ─────────────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    // Apply BearerAuth globally (can be overridden per route)
    security: [{ BearerAuth: [] }],
    paths: {
      // ── AUTH ─────────────────────────────────────────────────────────────
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } },
            },
          },
          responses: {
            201: { description: 'User registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            409: { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            422: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login and receive JWT token',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } },
            },
          },
          responses: {
            200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            401: { description: 'Invalid credentials' },
            422: { description: 'Validation error' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          responses: {
            200: { description: 'User profile retrieved' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      // ── USERS ─────────────────────────────────────────────────────────
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'List all users (Admin)',
          parameters: [
            { name: 'role', in: 'query', schema: { type: 'string', enum: ['viewer', 'analyst', 'admin'] } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'inactive'] } },
          ],
          responses: { 200: { description: 'Users list' }, 403: { description: 'Forbidden' } },
        },
        post: {
          tags: ['Users'],
          summary: 'Create a user (Admin)',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserInput' } } },
          },
          responses: { 201: { description: 'User created' }, 409: { description: 'Duplicate email' } },
        },
      },
      '/api/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get user by ID (Admin)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'User retrieved' }, 404: { description: 'User not found' } },
        },
        patch: {
          tags: ['Users'],
          summary: 'Update a user (Admin)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserInput' } } },
          },
          responses: { 200: { description: 'User updated' }, 404: { description: 'User not found' } },
        },
        delete: {
          tags: ['Users'],
          summary: 'Delete a user (Admin)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'User deleted' }, 404: { description: 'User not found' } },
        },
      },
      // ── RECORDS ───────────────────────────────────────────────────────
      '/api/records': {
        get: {
          tags: ['Financial Records'],
          summary: 'List financial records (all roles)',
          parameters: [
            { name: 'type', in: 'query', schema: { type: 'string', enum: ['income', 'expense'] } },
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'sortBy', in: 'query', schema: { type: 'string', default: 'date' } },
            { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
          ],
          responses: { 200: { description: 'Records list' } },
        },
        post: {
          tags: ['Financial Records'],
          summary: 'Create a financial record (Analyst, Admin)',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateRecordInput' } } },
          },
          responses: { 201: { description: 'Record created' }, 403: { description: 'Forbidden' } },
        },
      },
      '/api/records/{id}': {
        get: {
          tags: ['Financial Records'],
          summary: 'Get a record by ID (all roles)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Record retrieved' }, 404: { description: 'Not found' } },
        },
        patch: {
          tags: ['Financial Records'],
          summary: 'Update a record (Admin)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateRecordInput' } } },
          },
          responses: { 200: { description: 'Record updated' }, 403: { description: 'Forbidden' } },
        },
        delete: {
          tags: ['Financial Records'],
          summary: 'Soft-delete a record (Admin)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Record deleted' }, 403: { description: 'Forbidden' } },
        },
      },
      // ── DASHBOARD ─────────────────────────────────────────────────────
      '/api/dashboard/summary': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get total income, expenses, and net balance (all roles)',
          responses: { 200: { description: 'Summary retrieved', content: { 'application/json': { schema: { $ref: '#/components/schemas/DashboardSummary' } } } } },
        },
      },
      '/api/dashboard/category-totals': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get totals grouped by category (Analyst, Admin)',
          responses: { 200: { description: 'Category totals retrieved' } },
        },
      },
      '/api/dashboard/recent': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get recent financial activity (all roles)',
          parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }],
          responses: { 200: { description: 'Recent records retrieved' } },
        },
      },
      '/api/dashboard/monthly-trends': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get month-by-month trends (Analyst, Admin)',
          parameters: [{ name: 'year', in: 'query', schema: { type: 'integer', example: 2024 } }],
          responses: { 200: { description: 'Monthly trends retrieved' } },
        },
      },
      '/api/dashboard/weekly-trends': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get week-by-week trends (Analyst, Admin)',
          parameters: [{ name: 'weeks', in: 'query', schema: { type: 'integer', default: 8 } }],
          responses: { 200: { description: 'Weekly trends retrieved' } },
        },
      },
    },
  },
  apis: [], // We're using the inline spec above
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
