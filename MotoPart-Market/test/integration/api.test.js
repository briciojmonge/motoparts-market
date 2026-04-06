// test/integration/api.test.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_ENDPOINT = '/partes';

// Función auxiliar para esperar que el servidor esté listo (opcional)
const waitForServer = async (retries = 5, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await axios.get(BASE_URL);
      console.log('Server is ready');
      return;
    } catch (err) {
      if (i === retries - 1) throw new Error('Server not reachable');
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

describe('API de partes de motos', () => {
  beforeAll(async () => {
    // Opcional: esperar a que el servidor esté disponible
    // await waitForServer();
  });

  describe('POST /partes', () => {
    it('debe crear una nueva parte con datos válidos', async () => {
      const nuevaParte = {
        nombre: 'Freno de disco trasero',
        tipo: 'frenos',
        precio: 45.99
      };

      const response = await axios.post(`${BASE_URL}${API_ENDPOINT}`, nuevaParte);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('message', 'Parte creada exitosamente');
      expect(response.data.part).toMatchObject({
        nombre: nuevaParte.nombre,
        tipo: nuevaParte.tipo,
        precio: nuevaParte.precio
      });
      expect(response.data.part).toHaveProperty('id');
      expect(response.data.part).toHaveProperty('createdAt');
    });

    it('debe rechazar una parte sin nombre', async () => {
      const parteInvalida = {
        tipo: 'motor',
        precio: 100
      };

      try {
        await axios.post(`${BASE_URL}${API_ENDPOINT}`, parteInvalida);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('nombre es obligatorio');
      }
    });

    it('debe rechazar una parte con precio negativo', async () => {
      const parteInvalida = {
        nombre: 'Manillar',
        tipo: 'manillar',
        precio: -10
      };

      try {
        await axios.post(`${BASE_URL}${API_ENDPOINT}`, parteInvalida);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('precio debe ser un número positivo');
      }
    });
  });

  describe('GET /partes?tipo=...', () => {
    // Primero creamos una parte para asegurar que existe un tipo
    let tipoPrueba = 'test-get';

    beforeAll(async () => {
      // Crear al menos dos partes del mismo tipo
      await axios.post(`${BASE_URL}${API_ENDPOINT}`, {
        nombre: 'Parte GET 1',
        tipo: tipoPrueba,
        precio: 10
      });
      await axios.post(`${BASE_URL}${API_ENDPOINT}`, {
        nombre: 'Parte GET 2',
        tipo: tipoPrueba,
        precio: 20
      });
    });

    it('debe devolver todas las partes de un tipo existente', async () => {
      const response = await axios.get(`${BASE_URL}${API_ENDPOINT}?tipo=${tipoPrueba}`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('tipo', tipoPrueba);
      expect(response.data.count).toBeGreaterThanOrEqual(2);
      expect(response.data.parts.length).toBe(response.data.count);
      response.data.parts.forEach(part => {
        expect(part.tipo).toBe(tipoPrueba);
      });
    });

    it('debe devolver un array vacío para un tipo que no existe', async () => {
      const response = await axios.get(`${BASE_URL}${API_ENDPOINT}?tipo=inexistente123`);
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
      expect(response.data.parts).toEqual([]);
    });

    it('debe responder con error 400 si falta el parámetro tipo', async () => {
      try {
        await axios.get(`${BASE_URL}${API_ENDPOINT}`);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('falta el parámetro "tipo"');
      }
    });
  });
});