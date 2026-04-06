module.exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      status: 'ok',
      message: 'API está funcionando correctamente',
      endpoints: {
        'POST /partes': 'Crear una nueva parte',
        'GET /partes?tipo={tipo}': 'Obtener partes por tipo'
      }
    })
  };
};
