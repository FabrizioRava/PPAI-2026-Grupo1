export class Rol {
  private id: number;
  private nombre: string;

  constructor(id: number, nombre: string) {
    this.id = id;
    this.nombre = nombre;
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

  // --- Comportamiento ---
  esGerente(): boolean {
    return this.nombre === 'Gerente';
  }
}
