import type {
  ComisionMedica as FilaCM,
  Rol as FilaRol,
  Empleado as FilaEmpleado,
  EstadoBolsin as FilaEstado,
} from '@prisma/client';
import { ComisionMedica } from '../domain/ComisionMedica';
import { Rol } from '../domain/Rol';
import { Empleado } from '../domain/Empleado';
import { EstadoBolsin } from '../domain/EstadoBolsin';

// Convierte filas de la base en objetos de dominio. Cachea por id para que, dentro de una
// misma consulta, una fila sea siempre el mismo objeto (los punteros apuntan a la misma instancia).
export class MapeadorDominio {
  private cms = new Map<number, ComisionMedica>();
  private roles = new Map<number, Rol>();
  private empleados = new Map<number, Empleado>();
  private estados = new Map<number, EstadoBolsin>();

  comisionMedica(fila: FilaCM): ComisionMedica {
    if (!this.cms.has(fila.id)) this.cms.set(fila.id, new ComisionMedica(fila.nombre, fila.codigo));
    return this.cms.get(fila.id)!;
  }

  rol(fila: FilaRol): Rol {
    if (!this.roles.has(fila.id)) this.roles.set(fila.id, new Rol(fila.nombre, fila.descripcion));
    return this.roles.get(fila.id)!;
  }

  empleado(fila: FilaEmpleado & { rol: FilaRol; asignadoA: FilaCM }): Empleado {
    if (!this.empleados.has(fila.id)) {
      this.empleados.set(
        fila.id,
        new Empleado(fila.nombre, fila.apellido, fila.mail, this.rol(fila.rol), this.comisionMedica(fila.asignadoA))
      );
    }
    return this.empleados.get(fila.id)!;
  }

  estado(fila: FilaEstado): EstadoBolsin {
    if (!this.estados.has(fila.id)) this.estados.set(fila.id, new EstadoBolsin(fila.nombre, fila.descripcion));
    return this.estados.get(fila.id)!;
  }
}
