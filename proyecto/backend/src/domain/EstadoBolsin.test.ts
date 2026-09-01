import { describe, it, expect } from 'vitest';
import { EstadoBolsin } from './EstadoBolsin';

describe('EstadoBolsin.sosEnviado', () => {
  it('devuelve true cuando el nombre del estado es "Enviado"', () => {
    const estado = new EstadoBolsin(1, 'Enviado');
    expect(estado.sosEnviado()).toBe(true);
  });

  it('devuelve false para cualquier otro nombre de estado', () => {
    const estado = new EstadoBolsin(2, 'Entregado');
    expect(estado.sosEnviado()).toBe(false);
  });
});
