import { SimuladorPosiciones } from './SimuladorPosiciones';

// «adaptable» Servicio externo del GPS Tracker modelo XTR-4500L (simulado).
// Devuelve un JSON en cadena de caracteres con, para cada ítem, el número de bolsín,
// la latitud, la longitud y la fecha y hora de la última actualización.
export class ServicioXTR4500L {
  getBolsinLocation(apiKey: string, numeroBolsin: number, codigoCMOrigen: string): string {
    void apiKey;
    void codigoCMOrigen;
    const info = SimuladorPosiciones.obtenerPosicion(numeroBolsin);
    return JSON.stringify([
      {
        numeroBolsin,
        latitud: info.lat,
        longitud: info.lng,
        fechaHoraActualizacion: info.fecha.toISOString(),
      },
    ]);
  }
}
