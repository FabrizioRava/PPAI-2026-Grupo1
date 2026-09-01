import { Bolsin } from '../domain/Bolsin';
import { bolsines } from '../mockData';

export class BolsinRepository {
  getAll(): Bolsin[] {
    return bolsines;
  }
}
