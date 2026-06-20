import { Empleado } from './Empleado';

export class Usuario {
  id: number;
  username: string;
  // Contraseña moqueada (texto plano). Al migrar a DB se reemplaza por un hash.
  password: string;
  empleado: Empleado;

  constructor(id: number, username: string, password: string, empleado: Empleado) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.empleado = empleado;
  }

  obtenerEmpleado(): Empleado {
    return this.empleado;
  }

  // Valida usuario + contraseña. Hoy compara texto plano (mock); a futuro, hash.
  sosVos(username: string, password: string): boolean {
    return this.username === username && this.password === password;
  }

  // DTO seguro para enviar al frontend (sin exponer la contraseña).
  toJSON() {
    const empleado = this.empleado;
    return {
      id: this.id,
      username: this.username,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      correo: empleado.correo,
      rol: empleado.rol.nombre,
      comisionMedica: {
        id: empleado.comisionMedica.id,
        nombre: empleado.comisionMedica.getNombreCM(),
        codigo: empleado.comisionMedica.getCodigoCM(),
      },
    };
  }
}
