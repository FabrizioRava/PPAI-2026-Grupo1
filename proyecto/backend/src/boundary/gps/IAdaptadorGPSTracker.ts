// «interface» Target del patrón Adapter.
// Todos los adaptadores devuelven la ubicación en el mismo formato:
// [numeroBolsin, latitud, longitud, fechaHoraUltimaActualizacion]
export interface IAdaptadorGPSTracker {
  // Método polimórfico que invoca el Cliente (InterfazGPSTracker)
  obtenerUbicacionBolsin(numeroBolsin: number, codigoCMOrigen: string, codigoCMDestino: string): string[];
  // Método polimórfico: invoca el servicio externo del modelo con los parámetros que este espera
  solicitarUbicacion(): void;
  // Método polimórfico: interpreta la respuesta del servicio y la convierte al formato común
  adaptarUbicacion(): void;
}
