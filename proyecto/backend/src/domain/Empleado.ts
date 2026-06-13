import { Rol } from './Rol';
import { ComisionMedica } from './ComisionMedica';

export class Empleado {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: Rol;
  comisionMedica: ComisionMedica;

  constructor(id: number, nombre: string, apellido: string, correo: string, rol: Rol, comisionMedica: ComisionMedica) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.correo = correo;
    this.rol = rol;
    this.comisionMedica = comisionMedica;
  }

  obtenerMail(): string {
    return this.correo;
  }
}

