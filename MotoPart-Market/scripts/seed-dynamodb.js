const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');
const path = require('path');

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'PartsTable';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://127.0.0.1:8000',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
  }
});

const dynamoDb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true
  }
});

async function seedData() {
  try {
    const seedDataPath = path.join(__dirname, 'seed-data.json');
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

    for (const item of seedData) {
      await dynamoDb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: item
        })
      );
      console.log(`Seeded item: ${item.nombre}`);
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();