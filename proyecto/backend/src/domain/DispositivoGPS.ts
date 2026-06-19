// Entidad :DispositivoGPS del diagrama (pasos 4-5).
// Representa el hardware GPS Tracker asociado a un bolsín (modelo XTR-4500L).
export class DispositivoGPS {
  marca: string;
  modelo: string;

  constructor(marca: string = 'GPS Tracker', modelo: string = 'XTR-4500L') {
    this.marca = marca;
    this.modelo = modelo;
  }

  getMarcaGPS(): string {
    return this.marca;
  }

  getModeloGPS(): string {
    return this.modelo;
  }
}
