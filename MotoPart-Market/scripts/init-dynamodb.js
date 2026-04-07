const {
  DynamoDBClient,
  DescribeTableCommand,
  CreateTableCommand
} = require('@aws-sdk/client-dynamodb');

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'PartsTable';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://127.0.0.1:8000',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
  }
});

async function tableExists() {
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    return true;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

async function init() {
  const exists = await tableExists();

  if (exists) {
    console.log(`La tabla ${TABLE_NAME} ya existe.`);
    return;
  }

  await client.send(
    new CreateTableCommand({
      TableName: TABLE_NAME,
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'tipo', AttributeType: 'S' }
      ],
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'TipoIndex',
          KeySchema: [{ AttributeName: 'tipo', KeyType: 'HASH' }],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    })
  );

  console.log(`Tabla ${TABLE_NAME} creada correctamente.`);
}

init().catch((error) => {
  console.error('Error inicializando DynamoDB local:', error);
  process.exit(1);
});