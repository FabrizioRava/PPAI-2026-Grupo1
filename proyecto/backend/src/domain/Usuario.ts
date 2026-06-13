import { Empleado } from './Empleado';

export class Usuario {
  id: number;
  username: string;
  empleado: Empleado;

  constructor(id: number, username: string, empleado: Empleado) {
    this.id = id;
    this.username = username;
    this.empleado = empleado;
  }
}
