const partService = require('../business/partService');

module.exports.handler = async (event) => {
  let body;

  try {
    body = JSON.parse(event.body || '{}');
  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'El body debe ser JSON válido'
      })
    };
  }

  try {
    const { nombre, tipo, precio } = body;
    const part = await partService.createPart(nombre, tipo, precio);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Parte creada exitosamente',
        part
      })
    };
  } catch (error) {
    const isBadRequest =
      error.message.includes('obligatorio') ||
      error.message.includes('positivo') ||
      error.message.includes('requerido') ||
      error.message.includes('JSON válido');

    return {
      statusCode: isBadRequest ? 400 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};