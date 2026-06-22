import { Request, Response } from 'express';
import { Sesion } from '../domain/Sesion';
import { ComisionMedica } from '../domain/ComisionMedica';
import { Bolsin } from '../domain/Bolsin';
import { bolsines, empleados } from '../mockData';
import { InterfazGPSTracker } from '../boundary/InterfazGPSTracker';
import { InterfazGoogleMaps } from '../boundary/InterfazGoogleMaps';
import { GestorLogin } from './GestorLogin';

export class GestorSegBolsines {
  private static nombreCMUsuarioLogueado: string;
  private static codigoCMUsuarioLogueado: string;
  private static numerosPrecintoBolsines: number[];
  private static numerosBolsines: number[];
  private static nombresCMDestino: string[];
  private static codigosCMDestino: string[];
  private static marcasGPSBolsines: string[];
  private static modelosGPSBolsines: string[];
  private static ubicacionesBolsines: any[];
  private static nroBolsinSeleccionado: number;
  private static mailGerente: string;

  static opConsultarUbicBolsines(sesion: Sesion): any {
    const cmUsuario = sesion.buscarCMUsuarioLogueado();
    this.nombreCMUsuarioLogueado = cmUsuario.getNombreCM();
    this.codigoCMUsuarioLogueado = cmUsuario.getCodigoCM();

    const bolsinesFiltrados = GestorSegBolsines.buscarBolsinesEnEstadoEnviado(this.codigoCMUsuarioLogueado);
    this.numerosPrecintoBolsines = bolsinesFiltrados.map(b => b.getNumeroPrecinto());
    this.numerosBolsines = bolsinesFiltrados.map(b => b.getNumeroBolsin());
    this.nombresCMDestino = bolsinesFiltrados.map(b => b.obtenerCMDestino().getNombreCM());
    this.codigosCMDestino = bolsinesFiltrados.map(b => b.obtenerCMDestino().getCodigoCM());
    this.marcasGPSBolsines = bolsinesFiltrados.map(b => b.obtenerDispositivoGPS().getMarcaGPS());
    this.modelosGPSBolsines = bolsinesFiltrados.map(b => b.obtenerDispositivoGPS().getModeloGPS());

    const bolsinesConUbicacion = GestorSegBolsines.buscarUbicacionBolsines(bolsinesFiltrados);
    this.ubicacionesBolsines = bolsinesConUbicacion;

    const mapa = GestorSegBolsines.obtenerMapaBolsines(bolsinesConUbicacion);
    void mapa;

    return {
      nombreCM: this.nombreCMUsuarioLogueado,
      bolsines: bolsinesConUbicacion
    };
  }

  static buscarBolsinesEnEstadoEnviado(codigoCM: string): Bolsin[] {
    return bolsines.filter(bolsin => {
      const esOrigen = bolsin.esTuCMDeOrigen(codigoCM);
      const esEnviado = bolsin.sosEnviado();
      return esOrigen && esEnviado;
    });
  }

  static buscarUbicacionBolsines(bolsinesEncontrados: Bolsin[]): any[] {
    return bolsinesEncontrados.map(bolsin => {
      const dispositivo = bolsin.obtenerDispositivoGPS();
      const marcaGPS = dispositivo.getMarcaGPS();
      const modeloGPS = dispositivo.getModeloGPS();
      void marcaGPS; void modeloGPS;

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
        cmDestinoCodigo: cmDestino.getCodigoCM()
      };
    });
  }

  static obtenerMapaBolsines(bolsinesConUbicacion: any[]): string {
    return InterfazGoogleMaps.obtenerMapaBolsines(bolsinesConUbicacion);
  }

  static tomarConfirmacionEnvioMail(numeroPrecinto: number, sesion: Sesion): any {
    void sesion;
    this.nroBolsinSeleccionado = numeroPrecinto;

    const precintoStr = `BOL-${String(numeroPrecinto).padStart(3, '0')}`;
    const bolsin = bolsines.find(b => b.getCodigo() === precintoStr || b.getNumeroPrecinto() === numeroPrecinto);

    if (!bolsin) {
      throw new Error(`No se encontró el bolsín con precinto ${numeroPrecinto}`);
    }

    const cmDestino = bolsin.obtenerCMDestino();

    const mailGerente = GestorSegBolsines.buscarMailGerente(cmDestino);
    if (!mailGerente) {
      throw new Error(`No se encontró un Gerente con correo para la Comisión Médica destino (${cmDestino.getNombreCM()}).`);
    }
    this.mailGerente = mailGerente;

    const coordenadas = InterfazGPSTracker.registrarNuevoReporte(bolsin);

    GestorSegBolsines.enviarMailGerente(
      mailGerente,
      numeroPrecinto,
      coordenadas.latitud,
      coordenadas.longitud,
      coordenadas.fechaHoraActualizacion.toISOString()
    );

    GestorSegBolsines.llamarCUNotificacionBolsin();
    GestorSegBolsines.finCU();

    return {
      exito: true,
      mensaje: 'Caso de Uso 31 ejecutado con éxito',
      fechaHoraActualizacion: coordenadas.fechaHoraActualizacion.toISOString(),
      latitud: coordenadas.latitud,
      longitud: coordenadas.longitud
    };
  }

  static buscarMailGerente(cmDestino: ComisionMedica): string | null {
    const gerente = empleados.find(e =>
      e.esTuCM(cmDestino) && e.esGerenteCMDestino()
    );
    return gerente ? gerente.getMail() : null;
  }

  static enviarMailGerente(mailGerente: string, numeroPrecinto: number, latitud: number, longitud: number, fechaHoraActualizacion: string): void {
    const d = new Date(fechaHoraActualizacion);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const fechaFormateada = `${dia}/${mes}/${anio} ${hora}:${min}`;

    console.log('\n====================================================================================================================================');
    console.log(`[CU31 NOTIFICACIÓN] Mail enviado con éxito al Gerente (${mailGerente}). Bolsín: ${numeroPrecinto}, Ubicación: Lat ${latitud}, Long ${longitud}, Última Actualización: ${fechaFormateada}`);
    console.log('====================================================================================================================================\n');
  }

  static llamarCUNotificacionBolsin(): void {
    console.log('[CU31] Caso de Uso 31: Notificar ubicación de bolsín ejecutado.');
  }

  static finCU(): void {
    console.log('[GestorSegBolsines] Fin del Caso de Uso.');
  }

/**
 * @openapi
 * /api/bolsines/activos:
 *   get:
 *     summary: Obtiene los bolsines activos del usuario logueado
 *     description: Filtra los bolsines cuyo origen coincida con la Comisión Médica de la sesión activa y cuyo estado actual sea Enviado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de bolsines activos recuperada con éxito.
 *       401:
 *         description: No autorizado. No se encontró una sesión activa.
 *       500:
 *         description: Error interno del servidor.
 */
  static getBolsinesActivos(req: Request, res: Response): void {
    try {
      const token = GestorLogin.obtenerToken(req);
      const sesion = Sesion.buscarPorToken(token);
      if (!sesion) {
        res.status(401).json({ error: 'No hay una sesión activa con un usuario logueado.' });
        return;
      }

      const respuestaExacta = GestorSegBolsines.opConsultarUbicBolsines(sesion);
      res.status(200).json(respuestaExacta);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

/**
 * @openapi
 * /api/bolsines/notificar:
 *   post:
 *     summary: Envía una notificación de ubicación al Gerente de destino
 *     description: Busca un bolsín por su número de precinto, identifica la Comisión Médica de destino y notifica al Gerente.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numeroPrecinto
 *             properties:
 *               numeroPrecinto:
 *                 type: integer
 *                 description: Número identificador del precinto
 *     responses:
 *       200:
 *         description: Notificación simulada y enviada con éxito.
 *       400:
 *         description: Solicitud incorrecta. Falta el parámetro numeroPrecinto.
 *       404:
 *         description: No se encontró el bolsín o el Gerente asociado a la Comisión Médica destino.
 *       500:
 *         description: Error interno del servidor.
 */
  static notificarUbicacionBolsin(req: Request, res: Response): void {
    try {
      const token = GestorLogin.obtenerToken(req);
      const sesion = Sesion.buscarPorToken(token);
      if (!sesion) {
        res.status(401).json({ error: 'No hay una sesión activa con un usuario logueado.' });
        return;
      }

      const { numeroPrecinto } = req.body;
      if (numeroPrecinto === undefined) {
        res.status(400).json({ error: 'El parámetro numeroPrecinto es requerido en el cuerpo (body).' });
        return;
      }

      const resultado = GestorSegBolsines.tomarConfirmacionEnvioMail(numeroPrecinto, sesion);
      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

/**
 * @openapi
 * /api/bolsines:
 *   get:
 *     summary: Obtiene el universo total de bolsines
 *     description: Retorna una lista con la totalidad de los bolsines simulados junto con sus datos de localización GPS actual.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operación exitosa. Devuelve la lista de bolsines.
 *       401:
 *         description: No autorizado. No se encontró una sesión activa.
 *       500:
 *         description: Error interno del servidor.
 */
  static getTodosLosBolsines(req: Request, res: Response): void {
    try {
      const token = GestorLogin.obtenerToken(req);
      const sesion = Sesion.buscarPorToken(token);
      if (!sesion) {
        res.status(401).json({ error: 'No hay una sesión activa con un usuario logueado.' });
        return;
      }

      const cmUsuario = sesion.buscarCMUsuarioLogueado();
      const nombreCM = cmUsuario ? cmUsuario.getNombreCM() : 'Sin Comisión';

      const bolsinesConUbicacion = GestorSegBolsines.buscarUbicacionBolsines(bolsines);

      const respuesta = {
        nombreCM,
        bolsines: bolsinesConUbicacion
      };

      res.status(200).json(respuesta);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}