import { Rol } from './Rol';
import { ComisionMedica } from './ComisionMedica';

export class Empleado {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  nombreCM: string;
  codigoCM: string;
  rol: Rol;
  comisionMedica: ComisionMedica;

  constructor(id: number, nombre: string, apellido: string, mail: string, rol: Rol, comisionMedica: ComisionMedica) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.mail = mail;
    this.rol = rol;
    this.comisionMedica = comisionMedica;
    this.nombreCM = comisionMedica.getNombreCM();
    this.codigoCM = comisionMedica.getCodigoCM();
  }

  getMail(): string {
    return this.mail;
  }

  // Diagrama (paso 2): el mensaje se llama obtenerCM; devuelve la CM del empleado
  // para que luego se consulten getNombreCM()/getCodigoCM() sobre ella.
  obtenerCM(): ComisionMedica {
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

