import { describe, it, expect, vi, afterEach } from 'vitest';
import { AdaptadorXTR4500L } from './AdaptadorXTR4500L';
import { AdaptadorNavTrackQX7A } from './AdaptadorNavTrackQX7A';
import { AdaptadorGeoPulseMTR900 } from './AdaptadorGeoPulseMTR900';
import { ServicioXTR4500L } from './ServicioXTR4500L';
import { ServicioNavTrackQX7A } from './ServicioNavTrackQX7A';
import { ServicioGeoPulseMTR900 } from './ServicioGeoPulseMTR900';
import { InterfazGPSTracker } from '../InterfazGPSTracker';

afterEach(() => vi.restoreAllMocks());

describe('AdaptadorXTR4500L', () => {
  it('pide la ubicación con la CM origen y convierte el JSON al formato común', () => {
    const servicio = vi.spyOn(ServicioXTR4500L.prototype, 'getBolsinLocation').mockReturnValue(
      JSON.stringify([
        { numeroBolsin: 7, latitud: -31.1, longitud: -63.1, fechaHoraActualizacion: '2026-11-25T10:00:00.000Z' },
        { numeroBolsin: 7, latitud: -31.2, longitud: -63.2, fechaHoraActualizacion: '2026-11-25T12:00:00.000Z' },
      ])
    );

    const ubicacion = new AdaptadorXTR4500L('KEY').obtenerUbicacionBolsin(7, 'CM-VM', 'CM-CBA');

    expect(servicio).toHaveBeenCalledWith('KEY', 7, 'CM-VM');
    // Con varios ítems toma el de fecha y hora de actualización más reciente
    expect(ubicacion).toEqual(['7', '-31.2', '-63.2', '2026-11-25T12:00:00.000Z']);
  });
});

describe('AdaptadorNavTrackQX7A', () => {
  it('pide la ubicación con la CM destino y convierte el String separado por comas al formato común', () => {
    const servicio = vi
      .spyOn(ServicioNavTrackQX7A.prototype, 'retrieveTrackingData')
      .mockReturnValue('7,-31.5,-63.5,2026-11-25T10:00:00.000Z');

    const ubicacion = new AdaptadorNavTrackQX7A('KEY').obtenerUbicacionBolsin(7, 'CM-VM', 'CM-CBA');

    expect(servicio).toHaveBeenCalledWith('KEY', 7, 'CM-CBA');
    expect(ubicacion).toEqual(['7', '-31.5', '-63.5', '2026-11-25T10:00:00.000Z']);
  });
});

describe('AdaptadorGeoPulseMTR900', () => {
  it('pide la ubicación sin códigos de CM y toma la fila más reciente de la matriz', () => {
    const servicio = vi.spyOn(ServicioGeoPulseMTR900.prototype, 'fetchCargoPositions').mockReturnValue([
      ['7', '-31.8', '-63.8', '2026-11-25T12:00:00.000Z'],
      ['7', '-31.7', '-63.7', '2026-11-25T09:00:00.000Z'],
    ]);

    const ubicacion = new AdaptadorGeoPulseMTR900('KEY').obtenerUbicacionBolsin(7, 'CM-VM', 'CM-CBA');

    expect(servicio).toHaveBeenCalledWith('KEY', 7);
    expect(ubicacion).toEqual(['7', '-31.8', '-63.8', '2026-11-25T12:00:00.000Z']);
  });
});

describe('InterfazGPSTracker', () => {
  it('delega en el adaptador del modelo de GPS indicado', () => {
    const servicio = vi
      .spyOn(ServicioNavTrackQX7A.prototype, 'retrieveTrackingData')
      .mockReturnValue('7,-31.5,-63.5,2026-11-25T10:00:00.000Z');

    const ubicacion = new InterfazGPSTracker().obtenerUbicacionBolsin(7, 'CM-VM', 'CM-CBA', 'NavTrack QX-7A');

    expect(servicio).toHaveBeenCalled();
    expect(ubicacion).toEqual(['7', '-31.5', '-63.5', '2026-11-25T10:00:00.000Z']);
  });

  it('lanza un error si el modelo de GPS no está soportado', () => {
    expect(() => new InterfazGPSTracker().obtenerUbicacionBolsin(7, 'CM-VM', 'CM-CBA', 'Modelo X')).toThrow(
      'Modelo de GPS no soportado'
    );
  });
});
