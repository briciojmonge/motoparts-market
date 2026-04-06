// In-memory database for local development
// Persiste datos entre llamadas usando módulo singleton

let instance = null;

class InMemoryDB {
  constructor() {
    this.parts = new Map();
    this.byType = new Map();
  }

  async save(part) {
    this.parts.set(part.id, part);
    
    if (!this.byType.has(part.tipo)) {
      this.byType.set(part.tipo, []);
    }
    
    // Evitar duplicados
    const existing = this.byType.get(part.tipo).find(p => p.id === part.id);
    if (!existing) {
      this.byType.get(part.tipo).push(part);
    }
    
    return part;
  }

  async findByTipo(tipo) {
    return this.byType.get(tipo) || [];
  }

  async findById(id) {
    return this.parts.get(id);
  }

  clear() {
    this.parts.clear();
    this.byType.clear();
  }
}

// Singleton pattern para mantener datos entre llamadas
if (!instance) {
  instance = new InMemoryDB();
}

module.exports = instance;

