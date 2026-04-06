// test/integration/api.test.js
const partService = require('../../src/business/partService');
const partRepository = require('../../src/repositories/partRepository');
const createPartHandler = require('../../src/handlers/createPart');
const getPartsHandler = require('../../src/handlers/getParts');

// Mock del repositorio para evitar conexiones reales a DynamoDB
jest.mock('../../src/repositories/partRepository');

describe('API de partes de motos - Integración', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /partes - Handler', () => {
    it('debe crear una nueva parte con datos válidos', async () => {
      const mockPart = {
        id: 'test-id-123',
        nombre: 'Freno de disco trasero',
        tipo: 'frenos',
        precio: 45.99
      };

      partRepository.save.mockResolvedValue(mockPart);

      const event = {
        body: JSON.stringify({
          nombre: 'Freno de disco trasero',
          tipo: 'frenos',
          precio: 45.99
        })
      };

      const response = await createPartHandler.handler(event);
      
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('message', 'Parte creada exitosamente');
      expect(body.part).toMatchObject({
        nombre: 'Freno de disco trasero',
        tipo: 'frenos',
        precio: 45.99
      });
      expect(body.part).toHaveProperty('id');
    });

    it('debe rechazar una parte sin nombre', async () => {
      const event = {
        body: JSON.stringify({
          tipo: 'motor',
          precio: 100
        })
      };

      const response = await createPartHandler.handler(event);
      
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('nombre');
    });

    it('debe rechazar una parte con precio negativo', async () => {
      const event = {
        body: JSON.stringify({
          nombre: 'Manillar',
          tipo: 'manillar',
          precio: -10
        })
      };

      const response = await createPartHandler.handler(event);
      
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('precio debe ser un número positivo');
    });
  });

  describe('GET /partes?tipo=... - Handler', () => {
    it('debe devolver todas las partes de un tipo existente', async () => {
      const tipoPrueba = 'frenos';
      const mockParts = [
        {
          id: 'id-1',
          nombre: 'Freno de disco',
          tipo: tipoPrueba,
          precio: 45.99
        },
        {
          id: 'id-2',
          nombre: 'Pastillas de freno',
          tipo: tipoPrueba,
          precio: 25.50
        }
      ];

      partRepository.findByTipo.mockResolvedValue(mockParts);

      const event = {
        queryStringParameters: {
          tipo: tipoPrueba
        }
      };

      const response = await getPartsHandler.handler(event);
      
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('tipo', tipoPrueba);
      expect(body.count).toBe(2);
      expect(body.parts.length).toBe(2);
      body.parts.forEach(part => {
        expect(part.tipo).toBe(tipoPrueba);
      });
    });

    it('debe retornar error cuando no se proporciona tipo', async () => {
      const event = {
        queryStringParameters: null
      };

      const response = await getPartsHandler.handler(event);
      
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
    });

    it('debe devolver un array vacío para un tipo que no existe', async () => {
      partRepository.findByTipo.mockResolvedValue([]);

      const event = {
        queryStringParameters: {
          tipo: 'inexistente123'
        }
      };

      const response = await getPartsHandler.handler(event);
      
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.count).toBe(0);
      expect(body.parts).toEqual([]);
    });
  });
});
