export class EstadoBolsin {
  private id: number;
  private nombre: string;
  private descripcion: string;

  constructor(id: number, nombre: string, descripcion: string = '') {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
  }

  // --- Getters / Setters ---
  getId(): number {
    return this.id;
  }

  setId(id: number): void {
    this.id = id;
  }

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