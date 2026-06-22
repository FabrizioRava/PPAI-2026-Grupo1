import { Bolsin } from '../domain/Bolsin';

export interface DatosLocalizacion {
  latitud: number;
  longitud: number;
  fechaHoraActualizacion: Date;
  modeloDispositivo: string;
}

// Simulador del Actor Externo "GPS Tracker"
export class GPSTrackerActor {
  private static rutaLookup: Record<number, { lat: number; lng: number; desfasajeMinutos: number }> = {
    4501: { lat: -32.1632, lng: -63.4721, desfasajeMinutos: 120 },
    4502: { lat: -32.0421, lng: -63.5684, desfasajeMinutos: 90 },
    4503: { lat: -31.9115, lng: -63.6798, desfasajeMinutos: 45 },
    4504: { lat: -31.7852, lng: -63.8012, desfasajeMinutos: 15 },
    4505: { lat: -31.4225, lng: -64.1851, desfasajeMinutos: 4 },
    4801: { lat: -31.5432, lng: -63.9215, desfasajeMinutos: 60 },
    4802: { lat: -31.8765, lng: -63.7543, desfasajeMinutos: 30 },
    4803: { lat: -31.6123, lng: -63.3456, desfasajeMinutos: 10 },
  };
  private static ultimosReportes: Record<number, { lat: number; lng: number; fecha: Date }> = {};

  private static getFrescoOrCreate(numeroBolsin: number): { lat: number; lng: number; fecha: Date } {
    if (this.ultimosReportes[numeroBolsin]) {
      return this.ultimosReportes[numeroBolsin];
    }
    const coord = this.rutaLookup[numeroBolsin];
    if (coord) {
      return {
        lat: coord.lat,
        lng: coord.lng,
        fecha: new Date(Date.now() - coord.desfasajeMinutos * 60 * 1000)
      };
    }
    let hash = 0;
    const keyStr = `BOL-${numeroBolsin}`;
    for (let i = 0; i < keyStr.length; i++) {
      hash = (hash << 5) - hash + keyStr.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    const desfasajeMinutos = (absHash % 180) + 5;
    const fecha = new Date(Date.now() - desfasajeMinutos * 60 * 1000);
    const lat = -32.4 + (absHash % 1000) / 1000;
    const lng = -64.2 + ((absHash >> 3) % 1000) / 1000;
    return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)), fecha };
  }

  static registrarNuevoReporte(numeroBolsin: number): void {
    const actual = this.getFrescoOrCreate(numeroBolsin);
    this.ultimosReportes[numeroBolsin] = {
      lat: actual.lat,
      lng: actual.lng,
      fecha: new Date()
    };
  }

  static getBolsinLocation(apiKey: string, numeroBolsin: number, codigoCMOrigen: string): string {
    void apiKey; void codigoCMOrigen;
    const info = this.getFrescoOrCreate(numeroBolsin);
    return JSON.stringify({
      numeroBolsin,
      latitud: info.lat,
      longitud: info.lng,
      fechaHoraActualizacion: info.fecha.toISOString()
    });
  }

  static retrieveTrackingData(apiKey: string, numeroBolsin: number, codigoCMDestino: string): string {
    void apiKey; void codigoCMDestino;
    const info = this.getFrescoOrCreate(numeroBolsin);
    return `${numeroBolsin},${info.lat},${info.lng},${info.fecha.toISOString()}`;
  }

  static fetchCargoPositions(apiKey: string, numeroBolsin: number): any[][] {
    void apiKey;
    const info = this.getFrescoOrCreate(numeroBolsin);
    return [[numeroBolsin, info.lat, info.lng, info.fecha.toISOString()]];
  }
}

export class InterfazGPSTracker {
  private static coordenadasObtenidas: DatosLocalizacion[] = [];

  static obtenerUbicacionBolsin(bolsin: Bolsin): DatosLocalizacion {
    const dispositivo = bolsin.obtenerDispositivoGPS();
    const modelo = dispositivo.getModeloGPS();
    const numeroBolsin = bolsin.getNumeroPrecinto();
    const apiKey = 'API_KEY_SRT_2026';
    let localizacion: DatosLocalizacion;

    if (modelo === 'XTR-4500L') {
      // Modificado para usar el método getter igual que en GitHub
      const cmOrigen = bolsin.getComisionMedicaOrigen().getCodigoCM();
      const responseStr = GPSTrackerActor.getBolsinLocation(apiKey, numeroBolsin, cmOrigen);
      const parsed = JSON.parse(responseStr);
      localizacion = {
        latitud: parsed.latitud,
        longitud: parsed.longitud,
        fechaHoraActualizacion: new Date(parsed.fechaHoraActualizacion),
        modeloDispositivo: 'XTR-4500L'
      };
    } else if (modelo === 'NavTrack QX-7A') {
      const cmDestino = bolsin.obtenerCMDestino().getCodigoCM();
      const responseStr = GPSTrackerActor.retrieveTrackingData(apiKey, numeroBolsin, cmDestino);
      const parts = responseStr.split(',');
      localizacion = {
        latitud: parseFloat(parts[1]),
        longitud: parseFloat(parts[2]),
        fechaHoraActualizacion: new Date(parts[3]),
        modeloDispositivo: 'NavTrack QX-7A'
      };
    } else if (modelo === 'GeoPulse MTR-900') {
      const matrix = GPSTrackerActor.fetchCargoPositions(apiKey, numeroBolsin);
      localizacion = {
        latitud: matrix[0][1],
        longitud: matrix[0][2],
        fechaHoraActualizacion: new Date(matrix[0][3]),
        modeloDispositivo: 'GeoPulse MTR-900'
      };
    } else {
      throw new Error(`Modelo de GPS no soportado: ${modelo}`);
    }

    this.coordenadasObtenidas.push(localizacion);
    return localizacion;
  }

  static registrarNuevoReporte(bolsin: Bolsin): DatosLocalizacion {
    const numeroBolsin = bolsin.getNumeroPrecinto();
    GPSTrackerActor.registrarNuevoReporte(numeroBolsin);
    return this.obtenerUbicacionBolsin(bolsin);
  }
}