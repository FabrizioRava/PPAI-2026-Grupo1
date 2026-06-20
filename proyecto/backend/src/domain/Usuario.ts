import { Empleado } from './Empleado';

export class Usuario {
  private id: number;
  private username: string;
  // Contraseña moqueada (texto plano). Al migrar a DB se reemplaza por un hash.
  private password: string;
  private empleado: Empleado;

  constructor(id: number, username: string, password: string, empleado: Empleado) {
    this.id = id;
    this.username = username;
    this.password = password;
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
    return this.username;
  }

  setUsername(username: string): void {
    this.username = username;
  }

  getPassword(): string {
    return this.password;
  }

  setPassword(password: string): void {
    this.password = password;
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
  sosVos(username: string, password: string): boolean {
    return this.username === username && this.password === password;
  }

  // DTO seguro para enviar al frontend (sin exponer la contraseña).
  toJSON() {
    const empleado = this.empleado;
    const comisionMedica = empleado.getComisionMedica();
    return {
      id: this.id,
      username: this.username,
      nombre: empleado.getNombre(),
      apellido: empleado.getApellido(),
      correo: empleado.getCorreo(),
      rol: empleado.getRol().getNombre(),
      comisionMedica: {
        id: comisionMedica.getId(),
        nombre: comisionMedica.getNombreCM(),
        codigo: comisionMedica.getCodigoCM(),
      },
    };
  }
}
