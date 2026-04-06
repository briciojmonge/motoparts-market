// jest.setup.js
process.env.AWS_ACCESS_KEY_ID = 'test';
process.env.AWS_SECRET_ACCESS_KEY = 'test';
process.env.AWS_REGION = 'local';
process.env.DYNAMODB_TABLE = 'PartsTable';

// Aumentar el límite de listeners para evitar advertencias
require('events').EventEmitter.defaultMaxListeners = 20;
