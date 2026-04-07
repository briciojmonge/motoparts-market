const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const Part = require('../models/Part');

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'PartsTable';

const clientConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
  }
};

if (process.env.DYNAMODB_ENDPOINT) {
  clientConfig.endpoint = process.env.DYNAMODB_ENDPOINT;
}

const client = new DynamoDBClient(clientConfig);

const dynamoDb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true
  }
});

class PartRepository {
  async save(part) {
    const entity = part instanceof Part ? part : new Part(part);

    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: entity.toItem()
      })
    );

    return entity;
  }

  async findByTipo(tipo) {
    const result = await dynamoDb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'TipoIndex',
        KeyConditionExpression: 'tipo = :tipo',
        ExpressionAttributeValues: {
          ':tipo': tipo
        }
      })
    );

    return (result.Items || []).map((item) => Part.fromItem(item));
  }
}

module.exports = new PartRepository();