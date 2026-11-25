import { Usuario } from '../domain/Usuario';
import { prisma } from './prisma';
import { MapeadorDominio } from './MapeadorDominio';

export class UsuarioRepository {
  async getAll(): Promise<Usuario[]> {
    const filas = await prisma.usuario.findMany({ include: { empleado: { include: { rol: true, asignadoA: true } } } });
    const mapeador = new MapeadorDominio();
    return filas.map((f) => new Usuario(f.nombreUsuario, f.contrasena, mapeador.empleado(f.empleado)));
  }
}
