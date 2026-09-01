// Simulador del Actor Externo "MapaActor"
export class MapaActor {
  static getMapaBolsines(bolsinesConUbicacion: any[]): string {
    // Simula obtener/renderizar el mapa con los bolsines localizados
    void bolsinesConUbicacion;
    return `Mapa renderizado con ${bolsinesConUbicacion.length} bolsines`;
  }
}

// Clase de Frontera del Sistema
export class InterfazMapa {
  private static mapaRenderizado: string = '';

  static obtenerMapaBolsines(bolsinesConUbicacion: any[]): string {
    // Paso 6 del diagrama de secuencia: InterfazMapa -> MapaActor: getMapaBolsines()
    this.mapaRenderizado = MapaActor.getMapaBolsines(bolsinesConUbicacion);
    return this.mapaRenderizado;
  }
}
