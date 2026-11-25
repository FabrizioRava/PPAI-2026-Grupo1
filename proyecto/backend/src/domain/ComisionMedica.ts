export class ComisionMedica {
  private nombre: string;
  private codigo: string;

  constructor(nombre: string, codigo: string) {
    this.nombre = nombre;
    this.codigo = codigo;
  }

  // --- Getters / Setters ---
  getNombre(): string {
    return this.nombre;
  }

  setNombre(nombre: string): void {
    this.nombre = nombre;
  }

  getCodigo(): string {
    return this.codigo;
  }

  setCodigo(codigo: string): void {
    this.codigo = codigo;
  }

  // --- Mensajes del diagrama de secuencia ---
  getNombreCM(): string {
    return this.nombre;
  }

  getCodigoCM(): string {
    return this.codigo;
  }
}
