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
    return this.comisionMedica.id === comisionMedica.id;
  }

  // Diagrama (paso 10): el empleado es Gerente (delega en su Rol)
  esGerenteCMDestino(): boolean {
    return this.rol.esGerente();
  }
}

