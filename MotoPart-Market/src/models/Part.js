class Part {
  constructor({ id, nombre, tipo, precio, createdAt = new Date().toISOString() }) {
    this.id = id;
    this.nombre = nombre;
    this.tipo = tipo;
    this.precio = Number(precio);
    this.createdAt = createdAt;
  }

  toItem() {
    return {
      id: this.id,
      nombre: this.nombre,
      tipo: this.tipo,
      precio: this.precio,
      createdAt: this.createdAt
    };
  }

  static fromItem(item) {
    return new Part({
      id: item.id,
      nombre: item.nombre,
      tipo: item.tipo,
      precio: item.precio,
      createdAt: item.createdAt
    });
  }
}

module.exports = Part;