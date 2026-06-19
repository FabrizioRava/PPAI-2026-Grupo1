export class Rol {
  id: number;
  nombre: string;

  constructor(id: number, nombre: string) {
    this.id = id;
    this.nombre = nombre;
  }

  esGerente(): boolean {
    return this.nombre === 'Gerente';
  }
}

