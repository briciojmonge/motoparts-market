const AWS = require('aws-sdk');
const Part = require('../models/Part');

const dynamoDb = new AWS.DynamoDB.DocumentClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'dummy',
  secretAccessKey: 'dummy'
});

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'PartsTable';

class PartRepository {
  async save(part) {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        id: part.id,
        nombre: part.nombre,
        tipo: part.tipo,
        precio: part.precio,
        createdAt: part.createdAt
      }
    };
    await dynamoDb.put(params).promise();
    return part;
  }

  async findByTipo(tipo) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'TipoIndex',
      KeyConditionExpression: 'tipo = :tipo',
      ExpressionAttributeValues: {
        ':tipo': tipo
      }
    };
    const result = await dynamoDb.query(params).promise();
    return result.Items.map(item => new Part(item.id, item.nombre, item.tipo, item.precio));
  }
}

module.exports = new PartRepository();