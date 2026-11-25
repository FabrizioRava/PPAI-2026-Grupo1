import { describe, it, expect } from 'vitest';
import { Bolsin } from './Bolsin';
import { CambioDeEstadoBolsin } from './CambioDeEstadoBolsin';
import { EstadoBolsin } from './EstadoBolsin';
import { ComisionMedica } from './ComisionMedica';
import { Empleado } from './Empleado';
import { Rol } from './Rol';

const estadoCreado = new EstadoBolsin('Creado');
const estadoEnviado = new EstadoBolsin('Enviado');
const cmVillaMaria = new ComisionMedica('Villa María', 'CM-VM');
const cmCordoba = new ComisionMedica('Córdoba', 'CM-CBA');
const responsable = new Empleado('Juan', 'Pérez', 'jperez@srt.gob.ar', new Rol('Administrativo'), cmVillaMaria);

function crearBolsin(cambiosDeEstado: CambioDeEstadoBolsin[]): Bolsin {
  return new Bolsin(1, 4501, new Date(), 2.5, cmVillaMaria, cmCordoba, cambiosDeEstado);
}

describe('Bolsin.sosEnviado', () => {
  it('devuelve true cuando el cambio de estado actual es "Enviado"', () => {
    const bolsin = crearBolsin([
      new CambioDeEstadoBolsin(estadoCreado, new Date(Date.now() - 1000), new Date(), responsable),
      new CambioDeEstadoBolsin(estadoEnviado, new Date(), null, responsable),
    ]);
    expect(bolsin.sosEnviado()).toBe(true);
  });

  it('devuelve false cuando el cambio de estado actual no es "Enviado"', () => {
    const bolsin = crearBolsin([new CambioDeEstadoBolsin(estadoCreado, new Date(), null, responsable)]);
    expect(bolsin.sosEnviado()).toBe(false);
  });

  it('devuelve false cuando no hay ningún cambio de estado actual', () => {
    const bolsin = crearBolsin([new CambioDeEstadoBolsin(estadoCreado, new Date(), new Date(), responsable)]);
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
