import { Request, Response } from 'express';
import { Sesion } from '../domain/Sesion';
import { usuarios } from '../mockData';

/**
 * Gestor de autenticación. Maneja el inicio y cierre de sesión de los
 * empleados de cada Comisión Médica contra los usuarios moqueados.
 * Al migrar a DB, sólo cambia el origen de `usuarios` (repositorio) y el
 * almacenamiento de tokens en `Sesion`.
 */
export class GestorLogin
{
  // Extrae el token "Bearer <token>" del header Authorization.
  static obtenerToken(req: Request): string | undefined {
    const header = req.headers.authorization;
    if (!header) return undefined;
    return header.startsWith('Bearer ') ? header.slice(7) : header;
  }

  // Busca el usuario que coincide con las credenciales (usuario + contraseña).
  static autenticar(username: string, password: string) {
    return usuarios.find(u => u.sosVos(username, password)) ?? null;
  }

/**
 * @openapi
 * /api/login:
 *   post:
 *     summary: Inicia sesión de usuario
 *     description: Autentica al usuario con sus credenciales y crea una sesión activa.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario
 *               password:
 *                 type: string
 *                 description: Contraseña de usuario
 *     responses:
 *       200:
 *         description: Autenticación exitosa. Retorna el token y los datos del usuario.
 *       400:
 *         description: Solicitud incorrecta. Falta usuario o contraseña.
 *       401:
 *         description: Credenciales incorrectas.
 *       500:
 *         description: Error interno del servidor.
 */
  static login(req: Request, res: Response): void 
  {
    try 
    {
      const { username, password } = req.body ?? {};
      if (!username || !password)
      {
        res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
        return;
      }

      const usuario = GestorLogin.autenticar(username, password);
      if (!usuario)
      {
        res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
        return;
      }

      const sesion = Sesion.iniciarSesion(usuario);

      res.status(200).json({
        token: sesion.getToken(),
        usuario: usuario.toJSON(),
      });
    }
    catch (error: any)
    {
      res.status(500).json({ error: error.message });
    }
  }

/**
 * @openapi
 * /api/logout:
 *   post:
 *     summary: Cierra la sesión activa
 *     description: Invalida la sesión actual asociada al token Bearer provisto.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cierre de sesión exitoso.
 *       500:
 *         description: Error interno del servidor.
 */
  static logout(req: Request, res: Response): void 
  {
    try 
    {
      const token = GestorLogin.obtenerToken(req);
      const cerrada = Sesion.cerrarSesion(token);
      res.status(200).json({ exito: cerrada });
    } 
    catch (error: any) 
    {
      res.status(500).json({ error: error.message });
    }
  }

/**
 * @openapi
 * /api/me:
 *   get:
 *     summary: Obtiene la información del usuario de la sesión activa
 *     description: Retorna los datos del usuario logueado basándose en el token Bearer.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos de usuario recuperados con éxito.
 *       401:
 *         description: No hay una sesión activa con el token provisto.
 *       500:
 *         description: Error interno del servidor.
 */
  static me(req: Request, res: Response): void 
  {
    try 
    {
      const token = GestorLogin.obtenerToken(req);
      const sesion = Sesion.buscarPorToken(token);
      if (!sesion) 
      {
        res.status(401).json({ error: 'No hay una sesión activa.' });
        return;
      }
      res.status(200).json({ usuario: sesion.getUsuario().toJSON() });
    } 
    catch (error: any) 
    {
      res.status(500).json({ error: error.message });
    }
  }
}