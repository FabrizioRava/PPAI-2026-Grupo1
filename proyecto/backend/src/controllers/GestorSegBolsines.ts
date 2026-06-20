import { Request, Response } from 'express';
import { Sesion } from '../domain/Sesion';
import { ComisionMedica } from '../domain/ComisionMedica';
import { Bolsin } from '../domain/Bolsin';
import { bolsines, empleadosCordoba } from '../mockData';
import { GPSTracker } from '../services/GPSTracker';

export class GestorSegBolsines {
  /**
   * Paso 2: Busca la CM del usuario logueado en la sesión activa.
   */
  static buscarCMUsuarioLogueado(): ComisionMedica | null {
    return Sesion.buscarCMUsuarioLogueado();
  }

  /**
   * Paso 3: Filtra los bolsines simulados comparando si su CM de origen
   * es la del usuario y si su estado es 'Enviado'.
   */
  static buscarBolsines(cmId: number): Bolsin[] {
    return bolsines.filter(bolsin => {
      const esOrigen = bolsin.esTuCMDeOrigen(cmId);
      const esEnviado = bolsin.sosEnviado();
      return esOrigen && esEnviado;
    });
  }

  /**
   * Paso 4, 5 y 6: Asigna coordenadas ficticias a los bolsines simulando el GPS tracker.
   * Ahora incluye el campo fechaHoraActualizacion en formato de string ISO.
   */
  static buscarDatosLocalizacionBolsines(bolsinesEncontrados: Bolsin[]): Array<{
    numeroPrecinto: number;
    latitud: number;
    longitud: number;
    estado: string;
    fechaHoraActualizacion: string;
    cmDestinoNombre: string;
    cmDestinoCodigo: string;
  }> {
    return bolsinesEncontrados.map(bolsin => {
      // Paso 4 del diagrama: obtenerDispositivoGPS() -> getMarcaGPS() / getModeloGPS()
      const dispositivo = bolsin.obtenerDispositivoGPS();
      const marcaGPS = dispositivo.getMarcaGPS();
      const modeloGPS = dispositivo.getModeloGPS();

      // Paso 4-5 del diagrama: InterfazGPSTracker.obtenerUbicacionBolsin()
      const localizacion = GPSTracker.obtenerUbicacionBolsin(bolsin.codigo);
      void marcaGPS; void modeloGPS; // datos del dispositivo consultados según el diagrama

      // Paso 3 del diagrama: número de precinto del bolsín
      const numeroPrecinto = bolsin.getNumeroPrecinto();

      // Obtenemos el nombre del estado actual del bolsín
      const estadoActual = bolsin.getEstadoActual()?.nombre || 'Enviado';

      // Paso 3 del diagrama: obtenerCMDestino() -> getNombreCM() / getCodigoCM()
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

  /**
   * Endpoint Handler para GET /api/bolsines/activos
   */
  static getBolsinesActivos(req: Request, res: Response): void {
    try {
      // 1. buscarCMUsuarioLogueado()
      const cmUsuario = GestorSegBolsines.buscarCMUsuarioLogueado();
      if (!cmUsuario) {
        res.status(401).json({ error: 'No hay una sesión activa con un usuario logueado.' });
        return;
      }

      // 2. buscarBolsines()
      const bolsinesFiltrados = GestorSegBolsines.buscarBolsines(cmUsuario.id);

      // 3. buscarDatosLocalizacionBolsines()
      const bolsinesConUbicacion = GestorSegBolsines.buscarDatosLocalizacionBolsines(bolsinesFiltrados);

      // 4. Devolver la estructura exacta solicitada con fechaHoraActualizacion
      const respuestaExacta = {
        nombreCM: cmUsuario.getNombreCM(),
        bolsines: bolsinesConUbicacion
      };

      res.status(200).json(respuestaExacta);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Paso 10 del diagrama de secuencia: Busca el mail del Gerente de la CM destino.
   * Recorre los empleados de la CM destino, filtrando aquel cuyo Rol ejecute esGerente() === true
   * y extrayendo su correo electrónico con getMail().
   */
  static buscarMailGerente(cmDestino: ComisionMedica): string | null {
    // Diagrama (paso 10): Em -> esTuCM() / esGerenteCMDestino() -> R: esGerente()
    const gerente = empleadosCordoba.find(e =>
      e.esTuCM(cmDestino) && e.esGerenteCMDestino()
    );

    return gerente ? gerente.getMail() : null;
  }

  /**
   * Paso 11 del diagrama de secuencia: Envía la notificación al Gerente.
   * Simula el éxito imprimiendo un console.log() gigante en la terminal incorporando la última actualización.
   */
  static enviarMailGerente(mailGerente: string, numeroPrecinto: number, latitud: number, longitud: number, fechaHoraActualizacion: string): void {
    // Formatear la fecha para la terminal
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

  /**
   * Endpoint Handler para POST /api/bolsines/notificar (Pasos 9, 10 y 11)
   */
  static notificarUbicacionBolsin(req: Request, res: Response): void {
    try {
      const { numeroPrecinto } = req.body;
      if (numeroPrecinto === undefined) {
        res.status(400).json({ error: 'El parámetro numeroPrecinto es requerido en el cuerpo (body).' });
        return;
      }

      // 1. Encontrar el bolsín seleccionado
      const precintoStr = `BOL-${String(numeroPrecinto).padStart(3, '0')}`;
      const bolsin = bolsines.find(b => b.codigo === precintoStr || b.id === numeroPrecinto);

      if (!bolsin) {
        res.status(404).json({ error: `No se encontró el bolsín con precinto ${numeroPrecinto}` });
        return;
      }

      // Paso 9: Ejecutar obtenerCMDestino() del bolsín seleccionado
      const cmDestino = bolsin.obtenerCMDestino();

      // Paso 10: Ejecutar buscarMailGerente()
      const mailGerente = GestorSegBolsines.buscarMailGerente(cmDestino);
      if (!mailGerente) {
        res.status(404).json({ 
          error: `No se encontró un Gerente con correo para la Comisión Médica destino (${cmDestino.nombre}).` 
        });
        return;
      }

      // Obtener ubicación GPS actual y su fechaHoraActualizacion correspondiente
      const coordenadas = GPSTracker.obtenerUbicacionBolsin(bolsin.codigo);

      // Paso 11: Ejecutar enviarMailGerente() con la fecha y hora de la última actualización
      GestorSegBolsines.enviarMailGerente(
        mailGerente,
        numeroPrecinto,
        coordenadas.latitud,
        coordenadas.longitud,
        coordenadas.fechaHoraActualizacion.toISOString()
      );

      // Responder al frontend con un estado HTTP 200 y JSON de éxito
      res.status(200).json({
        exito: true,
        mensaje: 'Caso de Uso 31 ejecutado con éxito'
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Endpoint obtenerBolsines (sin Filtrar)
  // http://localhost:3000/api/bolsines
  /**
   *@openapi
   * /api/bolsines:
   *   get:
   *     summary: Obtiene el universo total de bolsines
   *     description: Retorna una lista con la totalidad de los bolsines simulados, acoplándoles sus datos de localización GPS actual.
   *     responses:
   *       200:
   *         description: Operación exitosa. Devuelve la lista de bolsines.
   *       500:
   *         description: Error interno del servidor.
   */
  static getTodosLosBolsines(req: Request, res: Response): void {
    try {
      // Buscamos la CM del usuario logueado
      const cmUsuario = GestorSegBolsines.buscarCMUsuarioLogueado();
      const nombreCM = cmUsuario ? cmUsuario.getNombreCM() : 'Sin Comisión';

      // Tomamos TODOS los bolsines directamente
      const bolsinesConUbicacion = GestorSegBolsines.buscarDatosLocalizacionBolsines(bolsines);

      // Armamos la estructura de respuesta idéntica a la de activos para facilitar su uso en el front
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