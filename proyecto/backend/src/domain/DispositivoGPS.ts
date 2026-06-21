// Entidad :DispositivoGPS del diagrama (pasos 4-5).
// Representa el hardware GPS Tracker asociado a un bolsín (modelo XTR-4500L).
export class DispositivoGPS {
  private marca: string;
  private modelo: string;

  constructor(marca: string = 'GPS Tracker', modelo: string = 'XTR-4500L') {
    this.marca = marca;
    this.modelo = modelo;
  }

  // --- Getters / Setters ---
  getMarca(): string {
    return this.marca;
  }

  setMarca(marca: string): void {
    this.marca = marca;
  }

  getModelo(): string {
    return this.modelo;
  }

  setModelo(modelo: string): void {
    this.modelo = modelo;
  }

  // --- Mensajes del diagrama de secuencia ---
  getMarcaGPS(): string {
    return this.marca;
  }

  getModeloGPS(): string {
    return this.modelo;
  }
}