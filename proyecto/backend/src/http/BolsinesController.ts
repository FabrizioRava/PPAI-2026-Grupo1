import { Request, Response } from 'express';
import { Sesion } from '../domain/Sesion';
import { GestorLogin } from '../controllers/GestorLogin';
import { GestorSegBolsines } from '../controllers/GestorSegBolsines';
import { BolsinRepository } from '../repositories/BolsinRepository';
import { EmpleadoRepository } from '../repositories/EmpleadoRepository';

const bolsinRepository = new BolsinRepository();
const empleadoRepository = new EmpleadoRepository();

// Un GestorSegBolsines por sesión: se crea al iniciar el CU y conserva su estado
// (bolsines, ubicaciones, bolsín seleccionado); se reemplaza en la próxima consulta.
const gestoresPorSesion = new Map<Sesion, GestorSegBolsines>();

function resolverSesion(req: Request): Sesion | null {
  const token = GestorLogin.obtenerToken(req);
  return GestorLogin.buscarPorToken(token);
}

export class BolsinesController {
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
  static async getBolsinesActivos(req: Request, res: Response): Promise<void> {
    try {
      const sesion = resolverSesion(req);
      if (!sesion) {
        res.status(401).json({ error: 'No hay una sesión activa con un usuario logueado.' });
        return;
      }

      const gestor = new GestorSegBolsines(bolsinRepository, empleadoRepository);
      gestoresPorSesion.set(sesion, gestor);
      const respuesta = await gestor.opConsultarUbicBolsines(sesion);
      res.status(200).json(respuesta);
    } catch (error: any) {
      console.error('[BolsinesController.getBolsinesActivos]', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }

  /**
   * @openapi
   * /api/bolsines/seleccionar:
   *   post:
   *     summary: Registra la selección de un bolsín
   *     description: Informa al Gestor de Seguimiento de Bolsines cuál es el bolsín seleccionado por el Encargado de Bolsín para habilitar la opción de notificar su ubicación.
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
   *                 description: Número identificador del precinto seleccionado
   *     responses:
   *       200:
   *         description: Selección registrada con éxito.
   *       400:
   *         description: Solicitud incorrecta. Falta el parámetro numeroPrecinto.
   *       401:
   *         description: No autorizado. No se encontró una sesión activa.
   *       500:
   *         description: Error interno del servidor.
   */
  static seleccionarBolsin(req: Request, res: Response): void {
    try {
      const sesion = resolverSesion(req);
      if (!sesion) {
        res.status(401).json({ error: 'No hay una sesión activa con un usuario logueado.' });
        return;
      }

      const { numeroPrecinto } = req.body;
      if (numeroPrecinto === undefined) {
        res.status(400).json({ error: 'El parámetro numeroPrecinto es requerido en el cuerpo (body).' });
        return;
      }

      const gestor = gestoresPorSesion.get(sesion);
      if (!gestor) {
        res.status(400).json({ error: 'Primero debe consultar la ubicación de los bolsines.' });
        return;
      }
      gestor.tomarSeleccionBolsin(numeroPrecinto);
      res.status(200).json({ exito: true, nroBolsinSeleccionado: numeroPrecinto });
    } catch (error: any) {
      console.error('[BolsinesController.seleccionarBolsin]', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
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
  static async notificarUbicacionBolsin(req: Request, res: Response): Promise<void> {
    try {
      const sesion = resolverSesion(req);
      if (!sesion) {
        res.status(401).json({ error: 'No hay una sesión activa con un usuario logueado.' });
        return;
      }

      const { numeroPrecinto } = req.body;
      if (numeroPrecinto === undefined) {
        res.status(400).json({ error: 'El parámetro numeroPrecinto es requerido en el cuerpo (body).' });
        return;
      }

      const gestor = gestoresPorSesion.get(sesion);
      if (!gestor) {
        res.status(400).json({ error: 'Primero debe consultar la ubicación de los bolsines.' });
        return;
      }
      const resultado = await gestor.tomarConfirmacionEnvioMail(numeroPrecinto);
      res.status(200).json(resultado);
    } catch (error: any) {
      console.error('[BolsinesController.notificarUbicacionBolsin]', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
}
