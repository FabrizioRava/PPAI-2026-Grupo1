import { Usuario } from '../domain/Usuario';
import { usuarios } from '../mockData';

export class UsuarioRepository {
  getAll(): Usuario[] {
    return usuarios;
  }
}
