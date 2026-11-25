import { SimuladorPosiciones } from './SimuladorPosiciones';

// «adaptable» Servicio externo del GPS Tracker modelo GeoPulse MTR-900 (simulado).
// Devuelve una matriz con el número de bolsín, la latitud, la longitud
// y la fecha y hora de la última actualización de posición.
export class ServicioGeoPulseMTR900 {
  fetchCargoPositions(apiKey: string, numeroBolsin: number): string[][] {
    void apiKey;
    const info = SimuladorPosiciones.obtenerPosicion(numeroBolsin);
    return [[String(numeroBolsin), String(info.lat), String(info.lng), info.fecha.toISOString()]];
  }
}
