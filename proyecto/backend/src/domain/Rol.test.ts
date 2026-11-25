import { describe, it, expect } from 'vitest';
import { Rol } from './Rol';

describe('Rol.esGerente', () => {
  it('devuelve true cuando el nombre del rol es "Gerente"', () => {
    const rol = new Rol('Gerente');
    expect(rol.esGerente()).toBe(true);
  });

  it('devuelve false para cualquier otro nombre de rol', () => {
    const rol = new Rol('Administrativo');
    expect(rol.esGerente()).toBe(false);
  });
});
