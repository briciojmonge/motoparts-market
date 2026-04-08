# Moto Parts Market - Serverless API

A local serverless API for motorcycle parts exchange built with the Serverless Framework, AWS SDK v3, and DynamoDB Local.

## Project Overview

This project is a local serverless REST API that allows users to:

- Create motorcycle parts with details (name, type, price)
- Retrieve parts by type
- Store data in DynamoDB Local

**Technology Stack:**

- Node.js 20.x
- Serverless Framework
- Serverless Offline
- AWS SDK v3
- DynamoDB Local
- Jest (testing)

## Architecture

The project follows a layered architecture:

- **Handlers**: receive HTTP requests and return HTTP responses
- **Business**: implements business rules and validations
- **Repositories**: handle access to DynamoDB Local
- **Models**: represent domain entities

### Request Flow

Client (curl / Postman / Insomnia)  
→ Serverless Offline  
→ Lambda Handler  
→ Business Layer  
→ Repository  
→ DynamoDB Local

## Project Structure

```text
MotoPart-Market/
├── src/
│   ├── handlers/
│   │   ├── createPart.js
│   │   ├── getParts.js
│   │   └── health.js
│   ├── business/
│   │   └── partService.js
│   ├── models/
│   │   └── Part.js
│   └── repositories/
│       └── partRepository.js
├── scripts/
│   ├── init-dynamodb.js
│   ├── seed-dynamodb.js
│   └── seed-data.json
├── test/
│   ├── unit/
│   │   └── partService.test.js
│   └── integration/
│       └── api.test.js
├── package.json
├── serverless.yml
└── ARCHITECTURE.md
```

## Prerequisites

- **Node.js**: v20.x or higher
- **npm**: Comes with Node.js
- **Docker Desktop**
- **Serverless Framework**: installed locally via npm

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/motoparts-market.git
cd MotoPart-Market
```

### 2. Install dependencies

```bash
npm install
```

This installs the main packages used by the project, including:

- `@aws-sdk/client-dynamodb`
- `@aws-sdk/lib-dynamodb`
- `uuid`
- `serverless`
- `serverless-offline`
- `jest`

## Running the Application

### Local Development

#### 1. Start DynamoDB Local

```bash
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local
```

#### 2. Initialize the table

```bash
npm run db:init
```

#### 3. Seed sample data

```bash
npm run seed
```

#### 4. Start the local Serverless Offline environment

```bash
npm run offline
```

This setup:

- Starts DynamoDB Local on `http://127.0.0.1:8000`
- Creates the `PartsTable` table
- Inserts sample data
- Starts the local API on `http://localhost:3000`
- Emulates Lambda handlers locally
- Exposes endpoints under `http://localhost:3000/dev/...`

### Simulated Production Packaging

To simulate a production deployment without using AWS real:

```bash
npm run deploy:sim
```

This command packages the application for a production-like stage without deploying it to AWS.

## Interacting with the API

The API provides two main endpoints.

### 1. Create a Part (POST)

**Endpoint:** `POST /dev/partes`

**Request Headers:**

```text
Content-Type: application/json
```

**Request Body:**

```json
{
  "nombre": "Spark Plug",
  "tipo": "Electrical",
  "precio": 15.5
}
```

**Parameters:**

- `nombre` (string, required): name of the part
- `tipo` (string, required): type/category of the part
- `precio` (number, required): price, must be positive

**cURL Example:**

```bash
curl -X POST http://localhost:3000/dev/partes \
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
    "precio": 15.5
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "El nombre es obligatorio"
}
```

### 2. Get Parts by Type (GET)

**Endpoint:** `GET /dev/partes?tipo={type}`

**Query Parameters:**

- `tipo` (string, required): type/category to filter by

**cURL Example:**

```bash
curl http://localhost:3000/dev/partes?tipo=Electrical
```

**Success Response (200 OK):**

```json
{
  "tipo": "Electrical",
  "count": 2,
  "parts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Spark Plug",
      "tipo": "Electrical",
      "precio": 15.5
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "nombre": "Battery",
      "tipo": "Electrical",
      "precio": 45
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

## Testing

### Run all tests

```bash
npm test
```

### Run integration tests only

```bash
npm run test:integration
```

## Database Seeding

Sample data is stored in:

```text
scripts/seed-data.json
```

To seed the database manually:

```bash
npm run seed
```

## Validation Rules

The API enforces the following business rules:

| Field | Validation |
|-------|------------|
| `nombre` | Required, non-empty string |
| `tipo` | Required, non-empty string |
| `precio` | Required, must be a positive number (> 0) |

## Environment Variables

The application uses the following environment variables, configured in `serverless.yml`:

| Variable | Value (Local) | Purpose |
|----------|----------------|---------|
| `DYNAMODB_TABLE` | `PartsTable` | DynamoDB Local table name |
| `DYNAMODB_ENDPOINT` | `http://127.0.0.1:8000` | Local DynamoDB endpoint |
| `AWS_REGION` | `us-east-1` | Region used by the local SDK client |
| `AWS_ACCESS_KEY_ID` | `dummy` | Dummy credentials for local development |
| `AWS_SECRET_ACCESS_KEY` | `dummy` | Dummy credentials for local development |

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, the offline server may fail to start.

**Windows (PowerShell):**

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Mac/Linux:**

```bash
lsof -ti:3000 | xargs kill -9
```

Then restart the API:

```bash
npm run offline
```

### Resetting Local Data

To reset local data, recreate the DynamoDB Local container and initialize the table again:

```bash
docker rm -f dynamodb-local
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local
npm run db:init
npm run seed
```

## API Examples

### Example 1: Create Multiple Parts

```bash
curl -X POST http://localhost:3000/dev/partes \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Air Filter","tipo":"Engine","precio":22.99}'

curl -X POST http://localhost:3000/dev/partes \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Brake Pads","tipo":"Brake","precio":35.50}'

curl -X POST http://localhost:3000/dev/partes \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Chain","tipo":"Transmission","precio":45.00}'
```

### Example 2: Retrieve All Engine Parts

```bash
curl http://localhost:3000/dev/partes?tipo=Engine
```

### Example 3: Using Postman

1. Open Postman
2. Create a new POST request to `http://localhost:3000/dev/partes`
3. Set header: `Content-Type: application/json`
4. Set body as raw JSON:

```json
{
  "nombre": "Muffler",
  "tipo": "Exhaust",
  "precio": 89.99
}
```

5. Click **Send**