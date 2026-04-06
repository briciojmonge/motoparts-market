// partService.test.js
const partService = require('../../src/business/partService');
const partRepository = require('../../src/repositories/partRepository');

jest.mock('../../src/repositories/partRepository');

test('createPart debe rechazar precio negativo', async () => {
  await expect(partService.createPart('Freno', 'frenos', -10))
    .rejects.toThrow('El precio debe ser un número positivo');
});