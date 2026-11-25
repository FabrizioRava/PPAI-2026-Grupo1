// Carga inicial de la base de datos a partir de los objetos de dominio de mockData.ts.
import { PrismaClient } from '@prisma/client';
import { bolsines, empleados, usuarios } from '../src/mockData';
import { ComisionMedica } from '../src/domain/ComisionMedica';
import { Rol } from '../src/domain/Rol';
import { Empleado } from '../src/domain/Empleado';
import { EstadoBolsin } from '../src/domain/EstadoBolsin';

const prisma = new PrismaClient();

async function main() {
  // Limpia las tablas (orden inverso a las dependencias)
  await prisma.cambioDeEstadoBolsin.deleteMany();
  await prisma.bolsin.deleteMany();
  await prisma.dispositivoGPS.deleteMany();
  await prisma.estadoBolsin.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.empleado.deleteMany();
  await prisma.rol.deleteMany();
  await prisma.comisionMedica.deleteMany();

  // Puntero de dominio -> id de la base
  const idsCM = new Map<ComisionMedica, number>();
  const idsRol = new Map<Rol, number>();
  const idsEmpleado = new Map<Empleado, number>();
  const idsEstado = new Map<EstadoBolsin, number>();

  const idCM = async (cm: ComisionMedica) => {
    if (!idsCM.has(cm)) {
      const fila = await prisma.comisionMedica.create({ data: { nombre: cm.getNombre(), codigo: cm.getCodigo() } });
      idsCM.set(cm, fila.id);
    }
    return idsCM.get(cm)!;
  };

  const idRol = async (rol: Rol) => {
    if (!idsRol.has(rol)) {
      const fila = await prisma.rol.create({ data: { nombre: rol.getNombre(), descripcion: rol.getDescripcion() } });
      idsRol.set(rol, fila.id);
    }
    return idsRol.get(rol)!;
  };

  const idEstado = async (estado: EstadoBolsin) => {
    if (!idsEstado.has(estado)) {
      const fila = await prisma.estadoBolsin.create({
        data: { nombre: estado.getNombre(), descripcion: estado.getDescripcion() },
      });
      idsEstado.set(estado, fila.id);
    }
    return idsEstado.get(estado)!;
  };

  for (const empleado of empleados) {
    const fila = await prisma.empleado.create({
      data: {
        nombre: empleado.getNombre(),
        apellido: empleado.getApellido(),
        mail: empleado.getMail(),
        rolId: await idRol(empleado.getRol()),
        asignadoAId: await idCM(empleado.getAsignadoA()),
      },
    });
    idsEmpleado.set(empleado, fila.id);
  }

  for (const usuario of usuarios) {
    await prisma.usuario.create({
      data: {
        nombreUsuario: usuario.getUsername(),
        contrasena: usuario.getPassword(),
        empleadoId: idsEmpleado.get(usuario.getEmpleado())!,
      },
    });
  }

  for (const bolsin of bolsines) {
    const gps = bolsin.getDispositivoGPS();
    const filaGPS = await prisma.dispositivoGPS.create({ data: { marca: gps.getMarca(), modelo: gps.getModelo() } });
    const filaBolsin = await prisma.bolsin.create({
      data: {
        numeroBolsin: bolsin.getNumeroBolsin(),
        numeroPrecinto: bolsin.getNumeroPrecinto(),
        fecha: bolsin.getFecha(),
        peso: bolsin.getPeso(),
        origenId: await idCM(bolsin.getOrigen()),
        destinoId: await idCM(bolsin.getDestino()),
        dispositivoGPSId: filaGPS.id,
      },
    });
    for (const cambio of bolsin.getCambioEstado()) {
      await prisma.cambioDeEstadoBolsin.create({
        data: {
          fechaHoraInicio: cambio.getFechaHoraInicio(),
          fechaHoraFin: cambio.getFechaHoraFin(),
          bolsinId: filaBolsin.id,
          estadoId: await idEstado(cambio.getEstado()),
          responsableCEId: idsEmpleado.get(cambio.getResponsableCE())!,
        },
      });
    }
  }

  console.log(`Seed OK: ${empleados.length} empleados, ${usuarios.length} usuarios, ${bolsines.length} bolsines.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
