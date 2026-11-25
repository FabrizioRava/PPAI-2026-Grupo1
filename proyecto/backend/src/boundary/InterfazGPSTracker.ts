import { IAdaptadorGPSTracker } from './gps/IAdaptadorGPSTracker';
import { AdaptadorXTR4500L } from './gps/AdaptadorXTR4500L';
import { AdaptadorNavTrackQX7A } from './gps/AdaptadorNavTrackQX7A';
import { AdaptadorGeoPulseMTR900 } from './gps/AdaptadorGeoPulseMTR900';

// «boundary» Cliente del patrón Adapter: trabaja siempre contra IAdaptadorGPSTracker,
// sin saber qué modelo de GPS hay detrás ni en qué formato responde.
export class InterfazGPSTracker {
  // Una fila por modelo: [modelo, apiKey]
  private apiKeysModelosGPS: string[][] = [
    ['XTR-4500L', process.env.GPS_TRACKER_API_KEY ?? 'API_KEY_SRT_2026'],
    ['NavTrack QX-7A', process.env.GPS_TRACKER_API_KEY ?? 'API_KEY_SRT_2026'],
    ['GeoPulse MTR-900', process.env.GPS_TRACKER_API_KEY ?? 'API_KEY_SRT_2026'],
  ];
  private adaptadorGPS!: IAdaptadorGPSTracker;
  private ubicacionObtenida!: string[];

  obtenerUbicacionBolsin(
    numeroBolsin: number,
    codigoCMOrigen: string,
    codigoCMDestino: string,
    modeloGPS: string
  ): string[] {
    this.adaptadorGPS = this.crearAdaptador(modeloGPS);
    // Llamada polimórfica: cada adaptador resuelve su propio servicio y formato.
    this.ubicacionObtenida = this.adaptadorGPS.obtenerUbicacionBolsin(numeroBolsin, codigoCMOrigen, codigoCMDestino);
    return this.ubicacionObtenida;
  }

  private crearAdaptador(modeloGPS: string): IAdaptadorGPSTracker {
    const apiKey = this.obtenerApiKey(modeloGPS);
    if (modeloGPS === 'XTR-4500L') return new AdaptadorXTR4500L(apiKey);
    if (modeloGPS === 'NavTrack QX-7A') return new AdaptadorNavTrackQX7A(apiKey);
    if (modeloGPS === 'GeoPulse MTR-900') return new AdaptadorGeoPulseMTR900(apiKey);
    throw new Error(`Modelo de GPS no soportado: ${modeloGPS}`);
  }

  private obtenerApiKey(modeloGPS: string): string {
    const fila = this.apiKeysModelosGPS.find((f) => f[0] === modeloGPS);
    if (!fila) throw new Error(`Modelo de GPS no soportado: ${modeloGPS}`);
    return fila[1];
  }
}
