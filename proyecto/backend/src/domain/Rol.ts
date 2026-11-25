export class Rol {
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
  esGerente(): boolean {
    return this.nombre === 'Gerente';
  }
}
