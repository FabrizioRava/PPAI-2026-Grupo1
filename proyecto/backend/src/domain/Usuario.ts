import { Empleado } from './Empleado';

export class Usuario {
  private id: number;
  private nombreUsuario: string;
  // Contraseña moqueada (texto plano). Al migrar a DB se reemplaza por un hash.
  private contraseña: string;
  private empleado: Empleado;

  constructor(id: number, nombreUsuario: string, contraseña: string, empleado: Empleado) {
    this.id = id;
    this.nombreUsuario = nombreUsuario;
    this.contraseña = contraseña;
    this.empleado = empleado;
  }

  // --- Getters / Setters ---
  getId(): number {
    return this.id;
  }

  setId(id: number): void {
    this.id = id;
  }

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
    const comisionMedica = empleado.getComisionMedica();
    return {
      id: this.id,
      username: this.nombreUsuario,
      nombre: empleado.getNombre(),
      apellido: empleado.getApellido(),
      correo: empleado.getMail(),
      rol: empleado.getRol().getNombre(),
      comisionMedica: {
        id: comisionMedica.getId(),
        nombre: comisionMedica.getNombreCM(),
        codigo: comisionMedica.getCodigoCM(),
      },
    };
  }
}