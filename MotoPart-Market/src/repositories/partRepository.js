const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const Part = require('../models/Part');
const fs = require('fs');
const path = require('path');

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'PartsTable';

let dynamoDb = null;

// Solo inicializar DynamoDB si no estamos en local
const isProduction = process.env.NODE_ENV === 'production' || (process.env.AWS_REGION && process.env.AWS_REGION !== 'local');
if (isProduction) {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1'
  });

  dynamoDb = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true
    }
  });
}

// Path para almacenamiento local persistente
const DB_FILE = path.join(__dirname, '../../.dev-db.json');

// Funciones helper para persistencia de archivos
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    return { parts: {}, partsByType: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (err) {
    console.error('[PartRepository] Error leyendo DB:', err.message);
    return { parts: {}, partsByType: {} };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[PartRepository] Error escribiendo DB:', err.message);
  }
}

class PartRepository {
  async save(part) {
    const isLocal = !isProduction;
    
    if (isLocal) {
      const db = readDB();
      
      // Guardar parte
      db.parts[part.id] = {
        id: part.id,
        nombre: part.nombre,
        tipo: part.tipo,
        precio: part.precio,
        createdAt: part.createdAt
      };
      
      // Guardar por tipo
      if (!db.partsByType[part.tipo]) {
        db.partsByType[part.tipo] = [];
      }
      if (!db.partsByType[part.tipo].find(p => p.id === part.id)) {
        db.partsByType[part.tipo].push(db.parts[part.id]);
      }
      
      writeDB(db);
      console.log(`[PartRepository.save] Guardado: ${part.nombre} (tipo: ${part.tipo})`);
      return part;
    }

    // En producción, usar DynamoDB
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
    await dynamoDb.send(new PutCommand(params));
    return part;
  }

  async findByTipo(tipo) {
    const isLocal = !isProduction;
    
    if (isLocal) {
      const db = readDB();
      const parts = db.partsByType[tipo] || [];
      console.log(`[PartRepository.findByTipo] Tipo "${tipo}" tiene ${parts.length} partes`);
      return parts.map(p => new Part(p.id, p.nombre, p.tipo, p.precio));
    }

    // En producción, usar DynamoDB
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'TipoIndex',
      KeyConditionExpression: 'tipo = :tipo',
      ExpressionAttributeValues: {
        ':tipo': tipo
      }
    };
    const result = await dynamoDb.send(new QueryCommand(params));
    return result.Items.map(item => new Part(item.id, item.nombre, item.tipo, item.precio));
  }
}

module.exports = new PartRepository();