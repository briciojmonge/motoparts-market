const partService = require('../business/partService');

module.exports.handler = async (event) => {
  try {
    const tipo = event.queryStringParameters?.tipo?.trim();

    if (!tipo) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Falta el parámetro "tipo" en la query string'
        })
      };
    }

    const parts = await partService.getPartsByTipo(tipo);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        tipo,
        count: parts.length,
        parts
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Error interno del servidor'
      })
    };
  }
};