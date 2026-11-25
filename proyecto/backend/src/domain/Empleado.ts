import { Rol } from './Rol';
import { ComisionMedica } from './ComisionMedica';

export class Empleado {
  private nombre: string;
  private apellido: string;
  private mail: string;
  private rol: Rol;
  private asignadoA: ComisionMedica;

  constructor(nombre: string, apellido: string, mail: string, rol: Rol, asignadoA: ComisionMedica) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.mail = mail;
    this.rol = rol;
    this.asignadoA = asignadoA;
  }

  // --- Getters / Setters ---
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

  getMail(): string {
    return this.mail;
  }

  setMail(mail: string): void {
    this.mail = mail;
  }

  getRol(): Rol {
    return this.rol;
  }

  setRol(rol: Rol): void {
    this.rol = rol;
  }

  getAsignadoA(): ComisionMedica {
    return this.asignadoA;
  }

  setAsignadoA(asignadoA: ComisionMedica): void {
    this.asignadoA = asignadoA;
  }

  // --- Mensajes del diagrama de secuencia / comportamiento ---

  // Diagrama (paso 2): E -> CM: getNombreCM(), getCodigoCM(). Retorna [nombreCM, codigoCM]
  obtenerCM(): string[] {
    return [this.asignadoA.getNombreCM(), this.asignadoA.getCodigoCM()];
  }

  // Diagrama (paso 10): el empleado pertenece a la CM destino indicada
  esTuCM(codigoCM: string): boolean {
    return this.asignadoA.getCodigoCM() === codigoCM;
  }

  // Diagrama (paso 10): el empleado es Gerente (delega en su Rol)
  esGerenteCMDestino(): boolean {
    return this.rol.esGerente();
  }
}
