import express from 'express';
import cors from 'cors';
import { GestorSegBolsines } from './controllers/GestorSegBolsines';
// Importamos mockData para inicializar las instancias y registrar la sesión activa
import './mockData';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas
app.get('/api/bolsines/activos', GestorSegBolsines.getBolsinesActivos);
app.post('/api/bolsines/notificar', GestorSegBolsines.notificarUbicacionBolsin);
app.get('/api/bolsines', GestorSegBolsines.getTodosLosBolsines);

app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});
