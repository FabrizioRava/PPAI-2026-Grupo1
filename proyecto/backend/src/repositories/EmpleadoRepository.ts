import { Empleado } from '../domain/Empleado';
import { empleados } from '../mockData';

export class EmpleadoRepository {
  getAll(): Empleado[] {
    return empleados;
  }
}
