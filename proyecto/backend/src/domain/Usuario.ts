import { Empleado } from './Empleado';

export class Usuario {
  id: number;
  nombreUsuario: string;
  // Contraseña moqueada (texto plano). Al migrar a DB se reemplaza por un hash.
  contraseña: string;
  empleado: Empleado;

  constructor(id: number, nombreUsuario: string, contraseña: string, empleado: Empleado) {
    this.id = id;
    this.nombreUsuario = nombreUsuario;
    this.contraseña = contraseña;
    this.empleado = empleado;
  }

  obtenerEmpleado(): Empleado {
    return this.empleado;
  }

  // Valida usuario + contraseña. Hoy compara texto plano (mock); a futuro, hash.
  sosVos(nombreUsuario: string, contraseña: string): boolean {
    return this.nombreUsuario === nombreUsuario && this.contraseña === contraseña;
  }

  // DTO seguro para enviar al frontend (sin exponer la contraseña).
  toJSON() {
    const empleado = this.empleado;
    return {
      id: this.id,
      username: this.nombreUsuario,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      correo: empleado.mail,
      rol: empleado.rol.nombre,
      comisionMedica: {
        id: empleado.comisionMedica.id,
        nombre: empleado.comisionMedica.getNombreCM(),
        codigo: empleado.comisionMedica.getCodigoCM(),
      },
    };
  }
}
