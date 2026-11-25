import { SimuladorPosiciones } from './SimuladorPosiciones';

// «adaptable» Servicio externo del GPS Tracker modelo NavTrack QX-7A (simulado).
// Devuelve un único String con sus ítems separados por comas:
// número de bolsín, latitud, longitud y fecha y hora del último reporte.
export class ServicioNavTrackQX7A {
  retrieveTrackingData(apiKey: string, numeroBolsin: number, codigoCMDestino: string): string {
    void apiKey;
    void codigoCMDestino;
    const info = SimuladorPosiciones.obtenerPosicion(numeroBolsin);
    return `${numeroBolsin},${info.lat},${info.lng},${info.fecha.toISOString()}`;
  }
}
