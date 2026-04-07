const { v4: uuidv4 } = require('uuid');
const Part = require('../models/Part');
const partRepository = require('../repositories/partRepository');

class PartService {
  async createPart(nombre, tipo, precio) {
    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre es obligatorio');
    }

    if (!tipo || tipo.trim() === '') {
      throw new Error('El tipo es obligatorio');
    }

    const precioNumerico = Number(precio);

    if (!Number.isFinite(precioNumerico) || precioNumerico <= 0) {
      throw new Error('El precio debe ser un número positivo');
    }

    const part = new Part({
      id: uuidv4(),
      nombre: nombre.trim(),
      tipo: tipo.trim(),
      precio: precioNumerico
    });

    await partRepository.save(part);
    return part;
  }

  async getPartsByTipo(tipo) {
    if (!tipo || tipo.trim() === '') {
      throw new Error('El parámetro "tipo" es requerido');
    }

    return partRepository.findByTipo(tipo.trim());
  }
}

module.exports = new PartService();