import { describe, it, expect } from 'vitest';
import { GestorSegBolsines } from './GestorSegBolsines';
import { Bolsin } from '../domain/Bolsin';
import { CambioDeEstadoBolsin } from '../domain/CambioDeEstadoBolsin';
import { EstadoBolsin } from '../domain/EstadoBolsin';
import { ComisionMedica } from '../domain/ComisionMedica';
import { Empleado } from '../domain/Empleado';
import { Rol } from '../domain/Rol';
import type { BolsinRepository } from '../repositories/BolsinRepository';
import type { EmpleadoRepository } from '../repositories/EmpleadoRepository';

const estadoEnviado = new EstadoBolsin('Enviado');
const estadoEntregado = new EstadoBolsin('Entregado');
const cmVillaMaria = new ComisionMedica('Villa María', 'CM-VM');
const cmCordoba = new ComisionMedica('Córdoba', 'CM-CBA');
const responsable = new Empleado('Juan', 'Pérez', 'jperez@srt.gob.ar', new Rol('Administrativo'), cmVillaMaria);

function fakeBolsinRepository(bolsines: Bolsin[]): BolsinRepository {
  return { getAll: async () => bolsines } as BolsinRepository;
}

function fakeEmpleadoRepository(empleados: Empleado[]): EmpleadoRepository {
  return { getAll: async () => empleados } as EmpleadoRepository;
}

describe('GestorSegBolsines.buscarBolsinesEnEstadoEnviado', () => {
  it('solo devuelve bolsines cuyo origen coincide con la CM indicada y están en estado Enviado', async () => {
    const bolsinEnviadoDeVM = new Bolsin(1, 4501, new Date(), 2.5, cmVillaMaria, cmCordoba, [
      new CambioDeEstadoBolsin(estadoEnviado, new Date(), null, responsable),
    ]);
    const bolsinEntregadoDeVM = new Bolsin(2, 4502, new Date(), 2.5, cmVillaMaria, cmCordoba, [
      new CambioDeEstadoBolsin(estadoEntregado, new Date(), null, responsable),
    ]);
    const bolsinEnviadoDeOtraCM = new Bolsin(3, 4503, new Date(), 2.5, cmCordoba, cmVillaMaria, [
      new CambioDeEstadoBolsin(estadoEnviado, new Date(), null, responsable),
    ]);

    const gestor = new GestorSegBolsines(
      fakeBolsinRepository([bolsinEnviadoDeVM, bolsinEntregadoDeVM, bolsinEnviadoDeOtraCM]),
      fakeEmpleadoRepository([])
    );

    const resultado = await gestor.buscarBolsinesEnEstadoEnviado('CM-VM');

    expect(resultado).toEqual([bolsinEnviadoDeVM]);
  });
});

describe('GestorSegBolsines.buscarMailGerente', () => {
  const rolGerente = new Rol('Gerente');
  const rolAdministrativo = new Rol('Administrativo');

  it('devuelve el mail del Gerente de la CM destino', async () => {
    const gerenteCordoba = new Empleado('Ana', 'Gómez', 'agomez@srt.gob.ar', rolGerente, cmCordoba);
    const administrativoCordoba = new Empleado(
      'Luis',
      'Martínez',
      'lmartinez@srt.gob.ar',
      rolAdministrativo,
      cmCordoba
    );
    const gerenteOtraCM = new Empleado('María', 'López', 'mlopez@srt.gob.ar', rolGerente, cmVillaMaria);

    const gestor = new GestorSegBolsines(
      fakeBolsinRepository([]),
      fakeEmpleadoRepository([administrativoCordoba, gerenteOtraCM, gerenteCordoba])
    );

    expect(await gestor.buscarMailGerente('CM-CBA')).toBe('agomez@srt.gob.ar');
  });

  it('devuelve null cuando la CM destino no tiene un Gerente en el padrón', async () => {
    const administrativoCordoba = new Empleado(
      'Luis',
      'Martínez',
      'lmartinez@srt.gob.ar',
      rolAdministrativo,
      cmCordoba
    );

    const gestor = new GestorSegBolsines(fakeBolsinRepository([]), fakeEmpleadoRepository([administrativoCordoba]));

    expect(await gestor.buscarMailGerente('CM-CBA')).toBeNull();
  });
});
