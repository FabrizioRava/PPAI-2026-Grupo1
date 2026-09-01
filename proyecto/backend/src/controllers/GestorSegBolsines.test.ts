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

const estadoEnviado = new EstadoBolsin(1, 'Enviado');
const estadoEntregado = new EstadoBolsin(2, 'Entregado');
const cmVillaMaria = new ComisionMedica(1, 'Villa María', 'CM-VM');
const cmCordoba = new ComisionMedica(2, 'Córdoba', 'CM-CBA');

function fakeBolsinRepository(bolsines: Bolsin[]): BolsinRepository {
  return { getAll: () => bolsines } as BolsinRepository;
}

function fakeEmpleadoRepository(empleados: Empleado[]): EmpleadoRepository {
  return { getAll: () => empleados } as EmpleadoRepository;
}

describe('GestorSegBolsines.buscarBolsinesEnEstadoEnviado', () => {
  it('solo devuelve bolsines cuyo origen coincide con la CM indicada y están en estado Enviado', () => {
    const bolsinEnviadoDeVM = new Bolsin(
      1,
      'BOL-4501',
      cmVillaMaria,
      cmCordoba,
      [new CambioDeEstadoBolsin(1, estadoEnviado, new Date(), null)],
      undefined,
      4501
    );
    const bolsinEntregadoDeVM = new Bolsin(
      2,
      'BOL-4502',
      cmVillaMaria,
      cmCordoba,
      [new CambioDeEstadoBolsin(2, estadoEntregado, new Date(), null)],
      undefined,
      4502
    );
    const bolsinEnviadoDeOtraCM = new Bolsin(
      3,
      'BOL-4503',
      cmCordoba,
      cmVillaMaria,
      [new CambioDeEstadoBolsin(3, estadoEnviado, new Date(), null)],
      undefined,
      4503
    );

    const gestor = new GestorSegBolsines(
      fakeBolsinRepository([bolsinEnviadoDeVM, bolsinEntregadoDeVM, bolsinEnviadoDeOtraCM]),
      fakeEmpleadoRepository([])
    );

    const resultado = gestor.buscarBolsinesEnEstadoEnviado('CM-VM');

    expect(resultado).toEqual([bolsinEnviadoDeVM]);
  });
});

describe('GestorSegBolsines.buscarMailGerente', () => {
  const rolGerente = new Rol(1, 'Gerente');
  const rolAdministrativo = new Rol(2, 'Administrativo');

  it('devuelve el mail del Gerente de la CM destino', () => {
    const gerenteCordoba = new Empleado(1, 'Ana', 'Gómez', 'agomez@srt.gob.ar', rolGerente, cmCordoba);
    const administrativoCordoba = new Empleado(
      2,
      'Luis',
      'Martínez',
      'lmartinez@srt.gob.ar',
      rolAdministrativo,
      cmCordoba
    );
    const gerenteOtraCM = new Empleado(3, 'María', 'López', 'mlopez@srt.gob.ar', rolGerente, cmVillaMaria);

    const gestor = new GestorSegBolsines(
      fakeBolsinRepository([]),
      fakeEmpleadoRepository([administrativoCordoba, gerenteOtraCM, gerenteCordoba])
    );

    expect(gestor.buscarMailGerente(cmCordoba)).toBe('agomez@srt.gob.ar');
  });

  it('devuelve null cuando la CM destino no tiene un Gerente en el padrón', () => {
    const administrativoCordoba = new Empleado(
      2,
      'Luis',
      'Martínez',
      'lmartinez@srt.gob.ar',
      rolAdministrativo,
      cmCordoba
    );

    const gestor = new GestorSegBolsines(fakeBolsinRepository([]), fakeEmpleadoRepository([administrativoCordoba]));

    expect(gestor.buscarMailGerente(cmCordoba)).toBeNull();
  });
});
