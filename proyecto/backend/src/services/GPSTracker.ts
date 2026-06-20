export interface DatosLocalizacion {
  latitud: number;
  longitud: number;
  fechaHoraActualizacion: Date;
  modeloDispositivo: string;
}

export class GPSTracker {
  // Coordenadas reales y desfasajes en minutos para simular horas de reporte realistas
  private static rutaLookup: Record<string, { lat: number; lng: number; desfasajeMinutos: number }> = {
    'BOL-4501': { lat: -32.1632, lng: -63.4721, desfasajeMinutos: 120 }, // James Craik, reporte hace 2 horas
    'BOL-4502': { lat: -32.0421, lng: -63.5684, desfasajeMinutos: 90 },  // Oliva, reporte hace 1 hora y media
    'BOL-4503': { lat: -31.9115, lng: -63.6798, desfasajeMinutos: 45 },  // Oncativo, reporte hace 45 minutos
    'BOL-4504': { lat: -31.7852, lng: -63.8012, desfasajeMinutos: 15 },  // Laguna Larga, reporte hace 15 minutos
    'BOL-4505': { lat: -31.4225, lng: -64.1851, desfasajeMinutos: 4 },   // Entrando a Córdoba, reporte hace 4 minutos
  };

  // Últimos reportes "frescos" registrados (p. ej. al notificar). Persisten en memoria
  // para que las siguientes lecturas reflejen la hora actualizada. A futuro: tabla en DB.
  private static ultimosReportes: Record<string, DatosLocalizacion> = {};

  /**
   * Diagrama (paso 4-5): InterfazGPSTracker.obtenerUbicacionBolsin()
   * Simula la obtención de coordenadas GPS de un hardware real (XTR-4500L)
   * incorporando una fecha y hora de reporte distinta para cada bolsín.
   */
  static obtenerUbicacionBolsin(numeroPrecinto: string): DatosLocalizacion {
    // Si el dispositivo ya emitió un reporte fresco, se devuelve esa última lectura.
    if (GPSTracker.ultimosReportes[numeroPrecinto]) {
      return GPSTracker.ultimosReportes[numeroPrecinto];
    }

    if (GPSTracker.rutaLookup[numeroPrecinto]) {
      const coord = GPSTracker.rutaLookup[numeroPrecinto];
      const fechaReporte = new Date(Date.now() - coord.desfasajeMinutos * 60 * 1000);
      
      return {
        latitud: coord.lat,
        longitud: coord.lng,
        fechaHoraActualizacion: fechaReporte,
        modeloDispositivo: 'XTR-4500L'
      };
    }

    // Generación determinista para bolsines fuera de la ruta planificada
    let hash = 0;
    for (let i = 0; i < numeroPrecinto.length; i++) {
      hash = (hash << 5) - hash + numeroPrecinto.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    const desfasajeMinutos = (absHash % 180) + 5; // Entre 5 y 185 minutos de desfasaje
    const fechaReporte = new Date(Date.now() - desfasajeMinutos * 60 * 1000);
    
    // Rango Latitud: [-32.4, -31.4]
    const lat = -32.4 + (absHash % 1000) / 1000;
    // Rango Longitud: [-64.2, -63.2]
    const lng = -64.2 + ((absHash >> 3) % 1000) / 1000;

    return {
      latitud: Number(lat.toFixed(6)),
      longitud: Number(lng.toFixed(6)),
      fechaHoraActualizacion: fechaReporte,
      modeloDispositivo: 'XTR-4500L'
    };
  }

  /**
   * Simula que el dispositivo emite un nuevo reporte AHORA mismo (lectura fresca).
   * Mantiene las coordenadas de la última posición conocida y refresca la fecha/hora.
   * Se usa, por ejemplo, al notificar la ubicación de un bolsín (CU31).
   */
  static registrarNuevoReporte(numeroPrecinto: string): DatosLocalizacion {
    const ubicacionActual = GPSTracker.obtenerUbicacionBolsin(numeroPrecinto);
    const reporteFresco: DatosLocalizacion = {
      ...ubicacionActual,
      fechaHoraActualizacion: new Date(), // reporte tomado ahora
    };
    GPSTracker.ultimosReportes[numeroPrecinto] = reporteFresco;
    return reporteFresco;
  }
}
