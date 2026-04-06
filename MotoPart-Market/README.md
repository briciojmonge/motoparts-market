# Moto Parts Market - Serverless API

A serverless API for motorcycle parts exchange built with AWS Lambda, DynamoDB, and the Serverless Framework.

## Project Overview

This project is a fully serverless RESTful API that allows users to:
- Create motorcycle parts with details (name, type, price)
- Retrieve parts by type
- Store data in AWS DynamoDB

**Technology Stack:**
- Node.js 18.x
- AWS Lambda
- AWS DynamoDB
- Serverless Framework
- Jest (testing)

## Project Structure

```
MotoPart-Market/
├── src/
│   ├── handlers/              # Lambda function handlers
│   │   ├── createPart.js     # POST /partes handler
│   │   └── getParts.js       # GET /partes handler
│   ├── business/
│   │   └── partService.js    # Business logic & validations
│   ├── models/
│   │   └── Part.js           # Part data model
│   └── repositories/
│       └── partRepository.js  # DynamoDB data access
├── scripts/
│   └── seed-data.json        # Sample data for local development
├── test/
│   ├── unit/
│   │   └── partService.test.js
│   └── integration/
│       └── api.test.js
├── package.json
├── serverless.yml            # Serverless Framework configuration
└── ARCHITECTURE.md
```

## Prerequisites

- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js
- **Serverless Framework**: Installed globally or locally via npm
- **AWS Account**: Required for deployment (optional for local testing)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/motoparts-market.git
cd MotoPart-Market
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages including:
- `aws-sdk`: AWS SDK for JavaScript
- `uuid`: For generating unique part IDs
- `serverless`: Serverless Framework
- `serverless-offline`: Local AWS Lambda emulation
- `serverless-dynamodb-local`: Local DynamoDB emulation
- `jest`: Testing framework

### 3. Install Serverless CLI (Optional - if not already installed)
```bash
npm install -g serverless
```

## Running the Application

### Local Development (Recommended for Testing)

Start the local Serverless Offline environment with DynamoDB:

```bash
npm run offline
```

This command:
- Starts a local HTTP server on `http://localhost:3000`
- Emulates AWS Lambda functions
- Emulates DynamoDB database in memory
- Auto-seeds sample data from `scripts/seed-data.json`

You should see output indicating the server is running:
```
offline: Starting Offline: dev, nodejs18.x, undefined
...
offline: Ready! Your function will be called when you make an HTTP request
```

### Production Deploy to AWS

Before deploying, ensure you have AWS credentials configured:

```bash
npm run deploy:sim
```

For actual deployment to AWS:
```bash
serverless deploy --stage prod
```

## Interacting with the API

The API provides two main endpoints:

### 1. Create a Part (POST)

**Endpoint:** `POST /partes`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "nombre": "Spark Plug",
  "tipo": "Electrical",
  "precio": 15.50
}
```

**Parameters:**
- `nombre` (string, required): Name of the part
- `tipo` (string, required): Type/category of the part
- `precio` (number, required): Price (must be positive)

**cURL Example:**
```bash
curl -X POST http://localhost:3000/partes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Spark Plug",
    "tipo": "Electrical",
    "precio": 15.50
  }'
```

**Success Response (201 Created):**
```json
{
  "message": "Parte creada exitosamente",
  "part": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Spark Plug",
    "tipo": "Electrical",
    "precio": 15.50
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "El nombre es obligatorio"
}
```

---

### 2. Get Parts by Type (GET)

**Endpoint:** `GET /partes?tipo={type}`

**Query Parameters:**
- `tipo` (string, required): Type/category to filter by

**cURL Example:**
```bash
curl http://localhost:3000/partes?tipo=Electrical
```

**Success Response (200 OK):**
```json
{
  "tipo": "Electrical",
  "count": 3,
  "parts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Spark Plug",
      "tipo": "Electrical",
      "precio": 15.50
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "nombre": "Battery",
      "tipo": "Electrical",
      "precio": 45.00
    }
  ]
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Falta el parámetro \"tipo\" en la query string"
}
```

---

## Testing

### Run All Tests
```bash
npm test
```

### Run Integration Tests Only
```bash
npm run test:integration
```

Tests are configured with a 30-second timeout for integration tests.

## Database Seeding

The application auto-seeds sample data when running locally. View the seed file:

```bash
cat scripts/seed-data.json
```

To manually seed data:
```bash
npm run seed
```

## Validation Rules

The API enforces the following business rules:

| Field | Validation |
|-------|-----------|
| `nombre` | Required, non-empty string |
| `tipo` | Required, non-empty string |
| `precio` | Required, must be positive number (> 0) |

## Environment Variables

The application uses the following environment variables (configured in `serverless.yml`):

| Variable | Value (Local) | Purpose |
|----------|---------------|---------|
| `DYNAMODB_TABLE` | `PartsTable` | DynamoDB table name |
| `AWS_REGION` | `local` | AWS region (local for development) |
| `AWS_ACCESS_KEY_ID` | `dummy` | Dummy credentials for local dev |
| `AWS_SECRET_ACCESS_KEY` | `dummy` | Dummy credentials for local dev |

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, the offline server will fail to start. Kill the process using port 3000 or modify `serverless.yml`.

### DynamoDB Connection Issues
Ensure the DynamoDB Local (in-memory) is running. The `serverless-dynamodb-local` plugin should handle this automatically.

### AWS Credentials Not Found
For deployment, configure AWS credentials:
```bash
aws configure
```

Or set environment variables:
```bash
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

## API Examples

### Example 1: Create Multiple Parts
```bash
curl -X POST http://localhost:3000/partes \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Air Filter","tipo":"Engine","precio":22.99}'

curl -X POST http://localhost:3000/partes \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Brake Pads","tipo":"Brake","precio":35.50}'

curl -X POST http://localhost:3000/partes \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Chain","tipo":"Transmission","precio":45.00}'
```

### Example 2: Retrieve All Engine Parts
```bash
curl http://localhost:3000/partes?tipo=Engine
```

### Example 3: Using Postman
1. Open Postman
2. Create a new POST request to `http://localhost:3000/partes`
3. Set header: `Content-Type: application/json`
4. Set body (raw JSON):
```json
{
  "nombre": "Muffler",
  "tipo": "Exhaust",
  "precio": 89.99
}
```
5. Click Send

## Next Steps

- Review [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture information
- Extend the API with additional endpoints (update, delete, search)
- Add authentication and authorization
- Implement additional business logic layers
- Deploy to AWS Lambda and DynamoDB

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
