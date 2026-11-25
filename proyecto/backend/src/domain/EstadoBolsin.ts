export class EstadoBolsin {
  private nombre: string;
  private descripcion: string;

  constructor(nombre: string, descripcion: string = '') {
    this.nombre = nombre;
    this.descripcion = descripcion;
  }

  // --- Getters / Setters ---
  getNombre(): string {
    return this.nombre;
  }

  setNombre(nombre: string): void {
    this.nombre = nombre;
  }

  getDescripcion(): string {
    return this.descripcion;
  }

  setDescripcion(descripcion: string): void {
    this.descripcion = descripcion;
  }

  // --- Comportamiento ---
  sosEnviado(): boolean {
    return this.nombre === 'Enviado';
  }
}
