import { Sesion } from '../domain/Sesion';
import { ComisionMedica } from '../domain/ComisionMedica';
import { Bolsin } from '../domain/Bolsin';
import { InterfazGPSTracker } from '../boundary/InterfazGPSTracker';
import { InterfazMapa } from '../boundary/InterfazMapa';
import { BolsinRepository } from '../repositories/BolsinRepository';
import { EmpleadoRepository } from '../repositories/EmpleadoRepository';

export class GestorSegBolsines {
  private nombreCMUsuarioLogueado!: string;
  private codigoCMUsuarioLogueado!: string;
  private numerosPrecintoBolsines!: number[];
  private numerosBolsines!: number[];
  private nombresCMDestino!: string[];
  private codigosCMDestino!: string[];
  private marcasGPSBolsines!: string[];
  private modelosGPSBolsines!: string[];
  private ubicacionesBolsines!: any[];
  private nroBolsinSeleccionado!: number;
  private mailGerente!: string;

  constructor(
    private readonly bolsinRepository: BolsinRepository,
    private readonly empleadoRepository: EmpleadoRepository
  ) {}

  opConsultarUbicBolsines(sesion: Sesion): any {
    const cmUsuario = this.buscarCMUsuarioLogueado(sesion);
    this.nombreCMUsuarioLogueado = cmUsuario.getNombreCM();
    this.codigoCMUsuarioLogueado = cmUsuario.getCodigoCM();

    const bolsinesFiltrados = this.buscarBolsinesEnEstadoEnviado(this.codigoCMUsuarioLogueado);
    this.numerosPrecintoBolsines = bolsinesFiltrados.map((b) => b.getNumeroPrecinto());
    this.numerosBolsines = bolsinesFiltrados.map((b) => b.getNumeroBolsin());
    this.nombresCMDestino = bolsinesFiltrados.map((b) => b.obtenerCMDestino().getNombreCM());
    this.codigosCMDestino = bolsinesFiltrados.map((b) => b.obtenerCMDestino().getCodigoCM());
    this.marcasGPSBolsines = bolsinesFiltrados.map((b) => b.obtenerDispositivoGPS().getMarcaGPS());
    this.modelosGPSBolsines = bolsinesFiltrados.map((b) => b.obtenerDispositivoGPS().getModeloGPS());

    const bolsinesConUbicacion = this.buscarUbicacionBolsines(bolsinesFiltrados);
    this.ubicacionesBolsines = bolsinesConUbicacion;

    this.obtenerMapaBolsines(bolsinesConUbicacion);

    return {
      nombreCM: this.nombreCMUsuarioLogueado,
      bolsines: bolsinesConUbicacion,
    };
  }

  private buscarCMUsuarioLogueado(sesion: Sesion) {
    return sesion.buscarCMUsuarioLogueado();
  }

  buscarBolsinesEnEstadoEnviado(codigoCM: string): Bolsin[] {
    return this.bolsinRepository.getAll().filter((bolsin) => {
      const esOrigen = bolsin.esTuCMDeOrigen(codigoCM);
      const esEnviado = bolsin.sosEnviado();
      return esOrigen && esEnviado;
    });
  }

  buscarUbicacionBolsines(bolsinesEncontrados: Bolsin[]): any[] {
    return bolsinesEncontrados.map((bolsin) => {
      const localizacion = InterfazGPSTracker.obtenerUbicacionBolsin(bolsin);
      const numeroPrecinto = bolsin.getNumeroPrecinto();
      const estadoActual = bolsin.getEstadoActual()?.getNombre() || 'Enviado';
      const cmDestino = bolsin.obtenerCMDestino();

      return {
        numeroPrecinto,
        latitud: localizacion.latitud,
        longitud: localizacion.longitud,
        estado: estadoActual,
        fechaHoraActualizacion: localizacion.fechaHoraActualizacion.toISOString(),
        cmDestinoNombre: cmDestino.getNombreCM(),
        cmDestinoCodigo: cmDestino.getCodigoCM(),
      };
    });
  }

  obtenerMapaBolsines(bolsinesConUbicacion: any[]): string {
    return InterfazMapa.obtenerMapaBolsines(bolsinesConUbicacion);
  }

  tomarSeleccionBolsin(numeroPrecinto: number): void {
    this.nroBolsinSeleccionado = numeroPrecinto;
  }

  tomarConfirmacionEnvioMail(numeroPrecinto: number, sesion: Sesion): any {
    void sesion;
    this.nroBolsinSeleccionado = numeroPrecinto;

    const bolsin = this.bolsinRepository.getAll().find((b) => b.getNumeroPrecinto() === numeroPrecinto);

    if (!bolsin) {
      throw new Error(`No se encontró el bolsín con precinto ${numeroPrecinto}`);
    }

    const cmDestino = bolsin.obtenerCMDestino();

    const mailGerente = this.buscarMailGerente(cmDestino);
    if (!mailGerente) {
      throw new Error(
        `No se encontró un Gerente con correo para la Comisión Médica destino (${cmDestino.getNombreCM()}).`
      );
    }
    this.mailGerente = mailGerente;

    const coordenadas = InterfazGPSTracker.registrarNuevoReporte(bolsin);

    this.enviarMailGerente(
      mailGerente,
      numeroPrecinto,
      coordenadas.latitud,
      coordenadas.longitud,
      coordenadas.fechaHoraActualizacion.toISOString()
    );

    this.llamarCUNotificacionBolsin();
    this.finCU();

    return {
      exito: true,
      mensaje: 'Caso de Uso 31 ejecutado con éxito',
      fechaHoraActualizacion: coordenadas.fechaHoraActualizacion.toISOString(),
      latitud: coordenadas.latitud,
      longitud: coordenadas.longitud,
    };
  }

  buscarMailGerente(cmDestino: ComisionMedica): string | null {
    const gerente = this.empleadoRepository.getAll().find((e) => e.esTuCM(cmDestino) && e.esGerenteCMDestino());
    return gerente ? gerente.getMail() : null;
  }

  enviarMailGerente(
    mailGerente: string,
    numeroPrecinto: number,
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
      `[CU31 NOTIFICACIÓN] Mail enviado con éxito al Gerente (${mailGerente}). Bolsín: ${numeroPrecinto}, Ubicación: Lat ${latitud}, Long ${longitud}, Última Actualización: ${fechaFormateada}`
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
