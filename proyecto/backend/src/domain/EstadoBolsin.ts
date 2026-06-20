export class EstadoBolsin {
  id: number;
  nombre: string;
  descripcion: string;

  constructor(id: number, nombre: string, descripcion: string = '') {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
  }

  sosEnviado(): boolean {
    return this.nombre === 'Enviado';
  }
}
