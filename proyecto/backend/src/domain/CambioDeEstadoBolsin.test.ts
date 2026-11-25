import { describe, it, expect } from 'vitest';
import { CambioDeEstadoBolsin } from './CambioDeEstadoBolsin';
import { EstadoBolsin } from './EstadoBolsin';
import { Empleado } from './Empleado';
import { Rol } from './Rol';
import { ComisionMedica } from './ComisionMedica';

describe('CambioDeEstadoBolsin.sosActual', () => {
  const estado = new EstadoBolsin('Enviado');
  const responsable = new Empleado(
    'Juan',
    'Pérez',
    'jperez@srt.gob.ar',
    new Rol('Administrativo'),
    new ComisionMedica('Villa María', 'CM-VM')
  );

  it('devuelve true cuando tiene fecha de inicio y no tiene fecha de fin', () => {
    const cambio = new CambioDeEstadoBolsin(estado, new Date(), null, responsable);
    expect(cambio.sosActual()).toBe(true);
  });

  it('devuelve false cuando ya tiene fecha de fin (fue reemplazado por otro cambio)', () => {
    const cambio = new CambioDeEstadoBolsin(estado, new Date(), new Date(), responsable);
    expect(cambio.sosActual()).toBe(false);
  });
});
