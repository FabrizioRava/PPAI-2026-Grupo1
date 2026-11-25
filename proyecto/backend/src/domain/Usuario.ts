import { Empleado } from './Empleado';

export class Usuario {
  private nombreUsuario: string;
  // Contraseña moqueada (texto plano). Al migrar a DB se reemplaza por un hash.
  private contraseña: string;
  private empleado: Empleado;

  constructor(nombreUsuario: string, contraseña: string, empleado: Empleado) {
    this.nombreUsuario = nombreUsuario;
    this.contraseña = contraseña;
    this.empleado = empleado;
  }

  // --- Getters / Setters ---
  getUsername(): string {
    return this.nombreUsuario;
  }

  setUsername(username: string): void {
    this.nombreUsuario = username;
  }

  getPassword(): string {
    return this.contraseña;
  }

  setPassword(password: string): void {
    this.contraseña = password;
  }

  getEmpleado(): Empleado {
    return this.empleado;
  }

  setEmpleado(empleado: Empleado): void {
    this.empleado = empleado;
  }

  // --- Comportamiento ---
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
    const comisionMedica = empleado.getAsignadoA();
    return {
      username: this.nombreUsuario,
      nombre: empleado.getNombre(),
      apellido: empleado.getApellido(),
      correo: empleado.getMail(),
      rol: empleado.getRol().getNombre(),
      comisionMedica: {
        nombre: comisionMedica.getNombreCM(),
        codigo: comisionMedica.getCodigoCM(),
      },
    };
  }
}
