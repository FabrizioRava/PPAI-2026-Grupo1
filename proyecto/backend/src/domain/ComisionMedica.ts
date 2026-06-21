export class ComisionMedica {
  private id: number;
  private nombre: string;
  private codigo: string;

  constructor(id: number, nombre: string, codigo: string) {
    this.id = id;
    this.nombre = nombre;
    this.codigo = codigo;
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