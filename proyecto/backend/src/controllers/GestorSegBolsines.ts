import { Sesion } from '../domain/Sesion';
import { Bolsin } from '../domain/Bolsin';
import { InterfazGPSTracker } from '../boundary/InterfazGPSTracker';
import { InterfazMapa } from '../boundary/InterfazMapa';
import { BolsinRepository } from '../repositories/BolsinRepository';
import { EmpleadoRepository } from '../repositories/EmpleadoRepository';

export class GestorSegBolsines {
  private sesionActual!: Sesion;
  private nombreCMUsuarioLogueado!: string;
  private codigoCMUsuarioLogueado!: string;
  private numerosPrecintoBolsines!: number[];
  private numerosBolsines!: number[];
  private nombresCMDestino!: string[];
  private codigosCMDestino!: string[];
  private marcasGPSBolsines!: string[];
  private modelosGPSBolsines!: string[];
  private ubicacionesBolsines!: (string[] | null)[]; // [numeroBolsin, latitud, longitud, fechaHoraUltimaActualizacion]; null = A3
  private nroBolsinSeleccionado!: number;
  private mailGerente!: string;
  private interfazGPSTracker = new InterfazGPSTracker();

  constructor(
    private readonly bolsinRepository: BolsinRepository,
    private readonly empleadoRepository: EmpleadoRepository
  ) {}

  async opConsultarUbicBolsines(sesion: Sesion): Promise<any> {
    this.sesionActual = sesion;
    [this.nombreCMUsuarioLogueado, this.codigoCMUsuarioLogueado] = this.buscarCMUsuarioLogueado();

    const bolsinesFiltrados = await this.buscarBolsinesEnEstadoEnviado(this.codigoCMUsuarioLogueado);
    this.numerosPrecintoBolsines = bolsinesFiltrados.map((b) => b.getNumeroPrecinto());
    this.numerosBolsines = bolsinesFiltrados.map((b) => b.getNumeroBolsin());
    const cmsDestino = bolsinesFiltrados.map((b) => b.obtenerCMDestino());
    this.nombresCMDestino = cmsDestino.map((cm) => cm[0]);
    this.codigosCMDestino = cmsDestino.map((cm) => cm[1]);
    const dispositivosGPS = bolsinesFiltrados.map((b) => b.obtenerDispositivoGPS());
    this.marcasGPSBolsines = dispositivosGPS.map((gps) => gps[0]);
    this.modelosGPSBolsines = dispositivosGPS.map((gps) => gps[1]);

    this.buscarUbicacionBolsines();

    const bolsinesConUbicacion = this.numerosPrecintoBolsines.map((numeroPrecinto, i) => {
      const ubicacion = this.ubicacionesBolsines[i]; // null si el GPS no informó la ubicación (A3)
      return {
        numeroPrecinto,
        latitud: ubicacion ? parseFloat(ubicacion[1]) : null,
        longitud: ubicacion ? parseFloat(ubicacion[2]) : null,
        estado: 'Enviado', // todos los bolsines buscados están en estado Enviado
        fechaHoraActualizacion: ubicacion ? ubicacion[3] : null,
        cmDestinoNombre: this.nombresCMDestino[i],
        cmDestinoCodigo: this.codigosCMDestino[i],
      };
    });

    this.obtenerMapaBolsines(bolsinesConUbicacion);

    return {
      nombreCM: this.nombreCMUsuarioLogueado,
      bolsines: bolsinesConUbicacion,
    };
  }

  private buscarCMUsuarioLogueado() {
    return this.sesionActual.buscarCMUsuarioLogueado();
  }

  async buscarBolsinesEnEstadoEnviado(codigoCM: string): Promise<Bolsin[]> {
    return (await this.bolsinRepository.getAll()).filter((bolsin) => {
      const esEnviado = bolsin.sosEnviado();
      const esOrigen = bolsin.esTuCMDeOrigen(codigoCM);
      return esEnviado && esOrigen;
    });
  }

  // Método de enganche del patrón Adapter: no sabe qué modelo de GPS hay detrás ni en qué formato responde.
  buscarUbicacionBolsines(): void {
    this.ubicacionesBolsines = this.numerosBolsines.map((numeroBolsin, i) => {
      try {
        return this.interfazGPSTracker.obtenerUbicacionBolsin(
          numeroBolsin,
          this.codigoCMUsuarioLogueado,
          this.codigosCMDestino[i],
          this.modelosGPSBolsines[i]
        );
      } catch (error) {
        // A3: el GPS Tracker no pudo informar la ubicación del bolsín; se continúa con los demás.
        console.warn('[GestorSegBolsines] A3:', (error as Error).message);
        return null;
      }
    });
  }

  obtenerMapaBolsines(bolsinesConUbicacion: any[]): string {
    return InterfazMapa.obtenerMapaBolsines(bolsinesConUbicacion);
  }

  tomarSeleccionBolsin(numeroPrecinto: number): void {
    this.nroBolsinSeleccionado = numeroPrecinto;
  }

  async tomarConfirmacionEnvioMail(numeroPrecinto: number): Promise<any> {
    this.nroBolsinSeleccionado = numeroPrecinto;

    // Datos del bolsín seleccionado, obtenidos al consultar la ubicación (no se vuelve a buscar)
    const i = this.numerosPrecintoBolsines.indexOf(this.nroBolsinSeleccionado);
    if (i === -1) {
      throw new Error(`No se encontró el bolsín con precinto ${numeroPrecinto}`);
    }

    const mailGerente = await this.buscarMailGerente(this.codigosCMDestino[i]);
    if (!mailGerente) {
      throw new Error(
        `No se encontró un Gerente con correo para la Comisión Médica destino (${this.nombresCMDestino[i]}).`
      );
    }
    this.mailGerente = mailGerente;

    const ubicacion = this.ubicacionesBolsines[i];
    if (!ubicacion) {
      throw new Error(`El GPS Tracker no pudo informar la ubicación del bolsín con precinto ${numeroPrecinto}.`);
    }
    const [, latitud, longitud, fechaHoraActualizacion] = ubicacion;

    this.enviarMailGerente(
      mailGerente,
      this.numerosBolsines[i],
      parseFloat(latitud),
      parseFloat(longitud),
      fechaHoraActualizacion
    );

    this.llamarCUNotificacionBolsin();
    this.finCU();

    return {
      exito: true,
      mensaje: 'Caso de Uso 31 ejecutado con éxito',
      fechaHoraActualizacion,
      latitud: parseFloat(latitud),
      longitud: parseFloat(longitud),
    };
  }

  async buscarMailGerente(codigoCMDestino: string): Promise<string | null> {
    const gerente = (await this.empleadoRepository.getAll()).find(
      (e) => e.esTuCM(codigoCMDestino) && e.esGerenteCMDestino()
    );
    return gerente ? gerente.getMail() : null;
  }

  enviarMailGerente(
    mailGerente: string,
    numeroBolsin: number,
    latitud: number,
    longitud: number,
    fechaHoraActualizacion: string
  ): void {
    const d = new Date(fechaHoraActualizacion);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const fechaFormateada = `${dia}/${mes}/${anio} ${hora}:${min}`;

    console.log(
      '\n===================================================================================================================================='
    );
    console.log(
      `[CU31 NOTIFICACIÓN] Mail enviado con éxito al Gerente (${mailGerente}). Bolsín: ${numeroBolsin}, Ubicación: Lat ${latitud}, Long ${longitud}, Última Actualización: ${fechaFormateada}`
    );
    console.log(
      '====================================================================================================================================\n'
    );
  }

  llamarCUNotificacionBolsin(): void {
    console.log('[CU31] Caso de Uso 31: Notificar ubicación de bolsín ejecutado.');
  }

  finCU(): void {
    console.log('[GestorSegBolsines] Fin del Caso de Uso.');
  }
}
