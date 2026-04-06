class Part {
  constructor(id, nombre, tipo, precio) {
    this.id = id;
    this.nombre = nombre;
    this.tipo = tipo;
    this.precio = precio;
    this.createdAt = new Date().toISOString();
  }

  toDynamoItem() {
    return {
      id: { S: this.id },
      nombre: { S: this.nombre },
      tipo: { S: this.tipo },
      precio: { N: this.precio.toString() },
      createdAt: { S: this.createdAt }
    };
  }

  static fromDynamoItem(item) {
    return new Part(
      item.id.S,
      item.nombre.S,
      item.tipo.S,
      parseFloat(item.precio.N)
    );
  }
}

module.exports = Part;