import { Rol } from './Rol';
import { ComisionMedica } from './ComisionMedica';

export class Empleado {
  private id: number;
  private nombre: string;
  private apellido: string;
  private correo: string;
  private rol: Rol;
  private comisionMedica: ComisionMedica;

  constructor(id: number, nombre: string, apellido: string, correo: string, rol: Rol, comisionMedica: ComisionMedica) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.correo = correo;
    this.rol = rol;
    this.comisionMedica = comisionMedica;
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

  getApellido(): string {
    return this.apellido;
  }

  setApellido(apellido: string): void {
    this.apellido = apellido;
  }

  getCorreo(): string {
    return this.correo;
  }

  setCorreo(correo: string): void {
    this.correo = correo;
  }

  getRol(): Rol {
    return this.rol;
  }

  setRol(rol: Rol): void {
    this.rol = rol;
  }

  getComisionMedica(): ComisionMedica {
    return this.comisionMedica;
  }

  setComisionMedica(comisionMedica: ComisionMedica): void {
    this.comisionMedica = comisionMedica;
  }

  // --- Mensajes del diagrama de secuencia / comportamiento ---
  getMail(): string {
    return this.correo;
  }

  // Diagrama (paso 2): el mensaje se llama obtenerCodigoCM; devuelve la CM del empleado
  // para que luego se consulten getNombreCM()/getCodigoCM() sobre ella.
  obtenerCodigoCM(): ComisionMedica {
    return this.comisionMedica;
  }

  // Diagrama (paso 10): el empleado pertenece a la CM destino indicada
  esTuCM(comisionMedica: ComisionMedica): boolean {
    return this.comisionMedica.getId() === comisionMedica.getId();
  }

  // Diagrama (paso 10): el empleado es Gerente (delega en su Rol)
  esGerenteCMDestino(): boolean {
    return this.rol.esGerente();
  }
}
