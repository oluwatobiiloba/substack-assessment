# Store Product Management API

A RESTful API built with Node.js, Express, TypeScript, and MongoDB for managing products in a store with role-based authentication and comprehensive audit logging.

## Implementation

- Token-based JWT Authentication
- Role-based Access Control (Owner/Clerk/Admin/User) for product routes
- Product CRUD Operations 
- Pagination Support for product list
- Audit Logging
- Security Features (Rate Limiting, Helmet)
- 📚 API Documentation (Swagger)
- Clustering for CPU utilizations

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- Jest
- Docker
- Swagger/OpenAPI

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your configurations.

3. Run the application:

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

Using Docker:
```bash
docker-compose up
```

## API Endpoints

### Authentication

All endpoints require JWT token authentication via Bearer token.

### Products

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | /api/v1/products | List all products | Owner, Clerk |
| GET | /api/v1/products/:id | Get product details | Owner, Clerk |
| POST | /api/v1/products | Create new product | Owner |
| PUT | /api/v1/products/:id | Update product | Owner, Clerk |
| DELETE | /api/v1/products/:id | Delete product | Owner |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | API health status |

## Role-Based Access

- **Owner**: Full access to all operations
- **Clerk**: Can view products and update stock levels

## API Documentation

The API documentation is available at `/api-docs` when the server is running.

## Testing

Run the test suite:
```bash
npm test
```

Generate coverage report:
```bash
npm run test:coverage
```

## Security Features

- JWT Authentication
- Role-based Access Control
- Rate Limiting
- Helmet Security Headers
- CORS Configuration
- Input Validation
- Error Handling

## Database Design

### Product Schema
- name (String, indexed)
- description (String)
- price (Number)
- stock (Number)
- sku (String, unique, indexed)
- timestamps (createdAt, updatedAt)

### Audit Log Schema
- action (String, indexed)
- resource (String, indexed)
- resourceId (ObjectId, indexed)
- userId (ObjectId, indexed)
- timestamp (Date, indexed)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/store |
| JWT_SECRET | JWT signing key | - |
| JWT_EXPIRATION_MINUTES | JWT token expiration | 60 |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 900000 |
| RATE_LIMIT_MAX | Max requests per window | 100 |

## Error Handling

The API uses standard HTTP status codes and returns error responses in the following format:
```json
{
  "status": 400,
  "message": "Error message"
}
```

## Postman Doc

https://documenter.getpostman.com/view/23034417/2sB2cPik6V

## Note
- User schema not included as its out of scope
