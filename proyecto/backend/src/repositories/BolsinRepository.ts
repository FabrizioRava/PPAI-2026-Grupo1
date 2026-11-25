import { Bolsin } from '../domain/Bolsin';
import { CambioDeEstadoBolsin } from '../domain/CambioDeEstadoBolsin';
import { DispositivoGPS } from '../domain/DispositivoGPS';
import { prisma } from './prisma';
import { MapeadorDominio } from './MapeadorDominio';

export class BolsinRepository {
  async getAll(): Promise<Bolsin[]> {
    const filas = await prisma.bolsin.findMany({
      include: {
        origen: true,
        destino: true,
        dispositivoGPS: true,
        cambioEstado: { include: { estado: true, responsableCE: { include: { rol: true, asignadoA: true } } } },
      },
      orderBy: { numeroBolsin: 'asc' },
    });

    const mapeador = new MapeadorDominio();
    return filas.map(
      (f) =>
        new Bolsin(
          f.numeroBolsin,
          f.numeroPrecinto,
          f.fecha,
          f.peso,
          mapeador.comisionMedica(f.origen),
          mapeador.comisionMedica(f.destino),
          f.cambioEstado.map(
            (c) =>
              new CambioDeEstadoBolsin(
                mapeador.estado(c.estado),
                c.fechaHoraInicio,
                c.fechaHoraFin,
                mapeador.empleado(c.responsableCE)
              )
          ),
          new DispositivoGPS(f.dispositivoGPS.marca, f.dispositivoGPS.modelo)
        )
    );
  }
}
