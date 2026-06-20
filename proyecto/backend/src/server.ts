import express from 'express';
import cors from 'cors';
import { GestorSegBolsines } from './controllers/GestorSegBolsines';
import { GestorLogin } from './controllers/GestorLogin';
// Importamos mockData para inicializar las instancias en memoria (usuarios, empleados, bolsines)
import './mockData';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.post('/api/login', GestorLogin.login);
app.post('/api/logout', GestorLogin.logout);
app.get('/api/me', GestorLogin.me);

// Rutas de seguimiento de bolsines (requieren sesión activa)
app.get('/api/bolsines/activos', GestorSegBolsines.getBolsinesActivos);
app.post('/api/bolsines/notificar', GestorSegBolsines.notificarUbicacionBolsin);

app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});
