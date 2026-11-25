// Simulación de las posiciones que reportan los GPS Tracker (actor externo).
// La usan los tres servicios externos simulados (ServicioXTR4500L, ServicioNavTrackQX7A, ServicioGeoPulseMTR900).
export class SimuladorPosiciones {
  // Clave: número de bolsín
  private static rutaLookup: Record<number, { lat: number; lng: number; desfasajeMinutos: number }> = {
    1: { lat: -32.1632, lng: -63.4721, desfasajeMinutos: 120 },
    2: { lat: -32.0421, lng: -63.5684, desfasajeMinutos: 90 },
    3: { lat: -31.9115, lng: -63.6798, desfasajeMinutos: 45 },
    4: { lat: -31.7852, lng: -63.8012, desfasajeMinutos: 15 },
    5: { lat: -31.4225, lng: -64.1851, desfasajeMinutos: 4 },
    12: { lat: -31.5432, lng: -63.9215, desfasajeMinutos: 60 },
    13: { lat: -31.8765, lng: -63.7543, desfasajeMinutos: 30 },
    14: { lat: -31.6123, lng: -63.3456, desfasajeMinutos: 10 },
  };

  // Bolsines cuyo GPS Tracker no responde (flujo alternativo A3 del CU 36)
  private static sinSenal: number[] = [15];

  static obtenerPosicion(numeroBolsin: number): { lat: number; lng: number; fecha: Date } {
    if (this.sinSenal.includes(numeroBolsin)) {
      throw new Error(`El GPS Tracker no pudo informar la ubicación del bolsín ${numeroBolsin}`);
    }
    const coord = this.rutaLookup[numeroBolsin];
    if (coord) {
      return {
        lat: coord.lat,
        lng: coord.lng,
        fecha: new Date(Date.now() - coord.desfasajeMinutos * 60 * 1000),
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
}
