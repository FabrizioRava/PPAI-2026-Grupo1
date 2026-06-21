// Simulador del Actor Externo "GoogleMaps"
export class GoogleMapsActor {
  static getMapaBolsines(bolsinesConUbicacion: any[]): string {
    // Simula obtener/renderizar el mapa con los bolsines localizados
    void bolsinesConUbicacion;
    return `Mapa renderizado con ${bolsinesConUbicacion.length} bolsines`;
  }
}

// Clase de Frontera del Sistema
export class InterfazGoogleMaps {
  private static mapaRenderizado: string = '';

  static obtenerMapaBolsines(bolsinesConUbicacion: any[]): string {
    // Paso 6 del diagrama de secuencia: InterfazGoogleMaps -> GoogleMaps: getMapaBolsines()
    this.mapaRenderizado = GoogleMapsActor.getMapaBolsines(bolsinesConUbicacion);
    return this.mapaRenderizado;
  }
}
