import { describe, it, expect } from 'vitest';
import { CambioDeEstadoBolsin } from './CambioDeEstadoBolsin';
import { EstadoBolsin } from './EstadoBolsin';

describe('CambioDeEstadoBolsin.sosActual', () => {
  const estado = new EstadoBolsin(1, 'Enviado');

  it('devuelve true cuando tiene fecha de inicio y no tiene fecha de fin', () => {
    const cambio = new CambioDeEstadoBolsin(1, estado, new Date(), null);
    expect(cambio.sosActual()).toBe(true);
  });

  it('devuelve false cuando ya tiene fecha de fin (fue reemplazado por otro cambio)', () => {
    const cambio = new CambioDeEstadoBolsin(2, estado, new Date(), new Date());
    expect(cambio.sosActual()).toBe(false);
  });
});
