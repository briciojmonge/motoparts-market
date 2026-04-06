const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const dynamoDb = new AWS.DynamoDB.DocumentClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'dummy',
  secretAccessKey: 'dummy'
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
      await dynamoDb.put(params).promise();
      console.log(`Seeded item: ${item.nombre}`);
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();