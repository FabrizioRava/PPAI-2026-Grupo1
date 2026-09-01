import { describe, it, expect } from 'vitest';
import { Bolsin } from './Bolsin';
import { CambioDeEstadoBolsin } from './CambioDeEstadoBolsin';
import { EstadoBolsin } from './EstadoBolsin';
import { ComisionMedica } from './ComisionMedica';

const estadoCreado = new EstadoBolsin(1, 'Creado');
const estadoEnviado = new EstadoBolsin(2, 'Enviado');
const cmVillaMaria = new ComisionMedica(1, 'Villa María', 'CM-VM');
const cmCordoba = new ComisionMedica(2, 'Córdoba', 'CM-CBA');

function crearBolsin(cambiosDeEstado: CambioDeEstadoBolsin[]): Bolsin {
  return new Bolsin(1, 'BOL-4501', cmVillaMaria, cmCordoba, cambiosDeEstado, undefined, 4501);
}

describe('Bolsin.sosEnviado', () => {
  it('devuelve true cuando el cambio de estado actual es "Enviado"', () => {
    const bolsin = crearBolsin([
      new CambioDeEstadoBolsin(1, estadoCreado, new Date(Date.now() - 1000), new Date()),
      new CambioDeEstadoBolsin(2, estadoEnviado, new Date(), null),
    ]);
    expect(bolsin.sosEnviado()).toBe(true);
  });

  it('devuelve false cuando el cambio de estado actual no es "Enviado"', () => {
    const bolsin = crearBolsin([new CambioDeEstadoBolsin(1, estadoCreado, new Date(), null)]);
    expect(bolsin.sosEnviado()).toBe(false);
  });

  it('devuelve false cuando no hay ningún cambio de estado actual', () => {
    const bolsin = crearBolsin([new CambioDeEstadoBolsin(1, estadoCreado, new Date(), new Date())]);
    expect(bolsin.sosEnviado()).toBe(false);
  });
});

describe('Bolsin.esTuCMDeOrigen', () => {
  it('devuelve true cuando el código coincide con la CM de origen', () => {
    const bolsin = crearBolsin([]);
    expect(bolsin.esTuCMDeOrigen('CM-VM')).toBe(true);
  });

  it('devuelve false cuando el código no coincide con la CM de origen', () => {
    const bolsin = crearBolsin([]);
    expect(bolsin.esTuCMDeOrigen('CM-CBA')).toBe(false);
  });
});
