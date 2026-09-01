import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './server';

describe('POST /api/login', () => {
  it('devuelve token y usuario con credenciales válidas', async () => {
    const res = await request(app).post('/api/login').send({ username: 'jperez', password: '1234' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.usuario.username).toBe('jperez');
  });

  it('devuelve 401 con credenciales inválidas', async () => {
    const res = await request(app).post('/api/login').send({ username: 'jperez', password: 'incorrecta' });

    expect(res.status).toBe(401);
  });

  it('devuelve 400 si falta la contraseña', async () => {
    const res = await request(app).post('/api/login').send({ username: 'jperez' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/bolsines/activos', () => {
  it('devuelve 401 sin token de sesión', async () => {
    const res = await request(app).get('/api/bolsines/activos');

    expect(res.status).toBe(401);
  });

  it('devuelve los bolsines de la CM del usuario logueado', async () => {
    const login = await request(app).post('/api/login').send({ username: 'jperez', password: '1234' });
    const token = login.body.token;

    const res = await request(app).get('/api/bolsines/activos').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.nombreCM).toBe('Villa María');
    expect(Array.isArray(res.body.bolsines)).toBe(true);
    expect(res.body.bolsines.length).toBeGreaterThan(0);
  });
});

describe('POST /api/bolsines/notificar', () => {
  it('notifica con éxito un bolsín válido de la sesión activa', async () => {
    const login = await request(app).post('/api/login').send({ username: 'jperez', password: '1234' });
    const token = login.body.token;

    const res = await request(app)
      .post('/api/bolsines/notificar')
      .set('Authorization', `Bearer ${token}`)
      .send({ numeroPrecinto: 4501 });

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
  });

  it('devuelve 400 si falta numeroPrecinto', async () => {
    const login = await request(app).post('/api/login').send({ username: 'jperez', password: '1234' });
    const token = login.body.token;

    const res = await request(app).post('/api/bolsines/notificar').set('Authorization', `Bearer ${token}`).send({});

    expect(res.status).toBe(400);
  });
});
