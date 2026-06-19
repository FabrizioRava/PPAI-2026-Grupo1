export class ComisionMedica {
  id: number;
  nombre: string;
  codigo: string;

  constructor(id: number, nombre: string, codigo: string) {
    this.id = id;
    this.nombre = nombre;
    this.codigo = codigo;
  }

  getNombreCM(): string {
    return this.nombre;
  }

  getCodigoCM(): string {
    return this.codigo;
  }
}
