const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');
const path = require('path');

const client = new DynamoDBClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  }
});

const dynamoDb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true
  }
});

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'PartsTable';

async function seedData() {
  try {
    const seedDataPath = path.join(__dirname, 'seed-data.json');
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

    for (const item of seedData) {
      const params = {
        TableName: TABLE_NAME,
        Item: item
      };
      await dynamoDb.send(new PutCommand(params));
      console.log(`Seeded item: ${item.nombre}`);
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();