import { IAdaptadorGPSTracker } from './IAdaptadorGPSTracker';
import { ServicioNavTrackQX7A } from './ServicioNavTrackQX7A';

// «adapter» Adapta el servicio del GPS Tracker NavTrack QX-7A (String separado por comas).
// Este modelo necesita el código de la CM destino.
export class AdaptadorNavTrackQX7A implements IAdaptadorGPSTracker {
  private apiKey: string;
  private numeroBolsin!: number;
  private codigoCMDestino!: string;
  private ubicacionRecibida!: string;
  private ubicacionAdaptada!: string[];
  private servicio: ServicioNavTrackQX7A;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.servicio = new ServicioNavTrackQX7A();
  }

  obtenerUbicacionBolsin(numeroBolsin: number, codigoCMOrigen: string, codigoCMDestino: string): string[] {
    void codigoCMOrigen; // este modelo no usa la CM origen
    this.numeroBolsin = numeroBolsin;
    this.codigoCMDestino = codigoCMDestino;
    this.solicitarUbicacion();
    this.adaptarUbicacion();
    return this.ubicacionAdaptada;
  }

  solicitarUbicacion(): void {
    this.ubicacionRecibida = this.servicio.retrieveTrackingData(this.apiKey, this.numeroBolsin, this.codigoCMDestino);
  }

  // Separa el String por comas y lo ordena en el formato común.
  adaptarUbicacion(): void {
    const [numeroBolsin, latitud, longitud, fechaHora] = this.ubicacionRecibida.split(',');
    this.ubicacionAdaptada = [numeroBolsin, latitud, longitud, fechaHora];
    console.log(
      `[AdaptadorNavTrackQX7A] recibido: ${JSON.stringify(this.ubicacionRecibida)} → adaptado: ${JSON.stringify(this.ubicacionAdaptada)}`
    );
  }
}
