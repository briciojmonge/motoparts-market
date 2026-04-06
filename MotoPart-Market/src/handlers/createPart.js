const partService = require('../business/partService');

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
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
    console.error(error);
    const isBadRequest = error.message.includes('obligatorio') || 
                         error.message.includes('positivo') ||
                         error.message.includes('debe ser');
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