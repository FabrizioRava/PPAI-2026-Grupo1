import { Empleado } from '../domain/Empleado';
import { prisma } from './prisma';
import { MapeadorDominio } from './MapeadorDominio';

export class EmpleadoRepository {
  async getAll(): Promise<Empleado[]> {
    const filas = await prisma.empleado.findMany({ include: { rol: true, asignadoA: true } });
    const mapeador = new MapeadorDominio();
    return filas.map((f) => mapeador.empleado(f));
  }
}
