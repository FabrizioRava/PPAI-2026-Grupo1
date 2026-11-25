import { IAdaptadorGPSTracker } from './IAdaptadorGPSTracker';
import { ServicioXTR4500L } from './ServicioXTR4500L';

// «adapter» Adapta el servicio del GPS Tracker XTR-4500L (JSON en cadena de caracteres).
// Este modelo necesita el código de la CM origen.
export class AdaptadorXTR4500L implements IAdaptadorGPSTracker {
  private apiKey: string;
  private numeroBolsin!: number;
  private codigoCMOrigen!: string;
  private ubicacionRecibida!: string;
  private ubicacionAdaptada!: string[];
  private servicio: ServicioXTR4500L;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.servicio = new ServicioXTR4500L();
  }

  obtenerUbicacionBolsin(numeroBolsin: number, codigoCMOrigen: string, codigoCMDestino: string): string[] {
    void codigoCMDestino; // este modelo no usa la CM destino
    this.numeroBolsin = numeroBolsin;
    this.codigoCMOrigen = codigoCMOrigen;
    this.solicitarUbicacion();
    this.adaptarUbicacion();
    return this.ubicacionAdaptada;
  }

  solicitarUbicacion(): void {
    this.ubicacionRecibida = this.servicio.getBolsinLocation(this.apiKey, this.numeroBolsin, this.codigoCMOrigen);
  }

  // Interpreta el JSON; si trae varios ítems toma el de fecha y hora de actualización más reciente.
  adaptarUbicacion(): void {
    const items: { numeroBolsin: number; latitud: number; longitud: number; fechaHoraActualizacion: string }[] =
      JSON.parse(this.ubicacionRecibida);
    const masReciente = items.reduce((a, b) =>
      new Date(b.fechaHoraActualizacion) > new Date(a.fechaHoraActualizacion) ? b : a
    );
    this.ubicacionAdaptada = [
      String(masReciente.numeroBolsin),
      String(masReciente.latitud),
      String(masReciente.longitud),
      masReciente.fechaHoraActualizacion,
    ];
    console.log(
      `[AdaptadorXTR4500L] recibido: ${this.ubicacionRecibida} → adaptado: ${JSON.stringify(this.ubicacionAdaptada)}`
    );
  }
}
