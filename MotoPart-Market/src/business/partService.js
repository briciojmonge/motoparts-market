const { v4: uuidv4 } = require('uuid');
const Part = require('../models/Part');
const partRepository = require('../repositories/partRepository');

class PartService {
  async createPart(nombre, tipo, precio) {
    // Validaciones de negocio
    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre es obligatorio');
    }
    if (!tipo || tipo.trim() === '') {
      throw new Error('El tipo es obligatorio');
    }
    if (precio === undefined || precio <= 0) {
      throw new Error('El precio debe ser un número positivo');
    }

    const id = uuidv4();
    const part = new Part(id, nombre.trim(), tipo.trim(), parseFloat(precio));
    await partRepository.save(part);
    return part;
  }

  async getPartsByTipo(tipo) {
    if (!tipo) {
      throw new Error('El parámetro "tipo" es requerido');
    }
    return await partRepository.findByTipo(tipo);
  }
}

module.exports = new PartService();