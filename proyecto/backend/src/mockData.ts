import { Rol } from './domain/Rol';
import { ComisionMedica } from './domain/ComisionMedica';
import { Empleado } from './domain/Empleado';
import { Usuario } from './domain/Usuario';
import { EstadoBolsin } from './domain/EstadoBolsin';
import { CambioDeEstadoBolsin } from './domain/CambioDeEstadoBolsin';
import { Bolsin } from './domain/Bolsin';
import { DispositivoGPS } from './domain/DispositivoGPS';

// --- MOCK DATA ---

// Roles
export const rolGerente = new Rol(1, 'Gerente');
export const rolAdministrativo = new Rol(2, 'Administrativo');

// Comisiones Medicas
export const cmVillaMaria = new ComisionMedica(1, 'Villa María', 'CM-VM');
export const cmCordoba = new ComisionMedica(2, 'Córdoba', 'CM-CBA');
export const cmRioCuarto = new ComisionMedica(3, 'Río Cuarto', 'CM-RC');
export const cmSanFrancisco = new ComisionMedica(4, 'San Francisco', 'CM-SF');
export const cmMarcosJuarez = new ComisionMedica(5, 'Marcos Juárez', 'CM-MJ');
export const cmSanJuan = new ComisionMedica(6, 'San Juan', 'CM-SJ');

// Estados de Bolsin
export const estadoEnviado = new EstadoBolsin(1, 'Enviado');
export const estadoEntregado = new EstadoBolsin(2, 'Entregado');
export const estadoRecibido = new EstadoBolsin(3, 'Recibido');
export const estadoCreado = new EstadoBolsin(4, 'Creado');

// Dispositivos GPS (3 modelos disponibles según Observación 1)
const gpsXTR = new DispositivoGPS('GPS Tracker', 'XTR-4500L');
const gpsNavTrack = new DispositivoGPS('NavTrack', 'NavTrack QX-7A');
const gpsGeoPulse = new DispositivoGPS('GeoPulse', 'GeoPulse MTR-900');

// --- EMPLEADOS (padrón de cada Comisión Médica) ---
// Empleados de CM Villa María
const empleadoVillaMariaGerente = new Empleado(6, 'María', 'López', 'mlopez@srt.gob.ar', rolGerente, cmVillaMaria);
export const empleadoVillaMaria = new Empleado(1, 'Juan', 'Pérez', 'jperez@srt.gob.ar', rolAdministrativo, cmVillaMaria);

// Empleados de CM Córdoba
const empleadoCordobaGerente = new Empleado(2, 'Ana', 'Gómez', 'agomez@srt.gob.ar', rolGerente, cmCordoba);
const empleadoCordobaAdmin = new Empleado(3, 'Luis', 'Martínez', 'lmartinez@srt.gob.ar', rolAdministrativo, cmCordoba);

// Empleados de CM Río Cuarto
const empleadoRioCuartoGerente = new Empleado(4, 'Carlos', 'Ruiz', 'cruiz@srt.gob.ar', rolGerente, cmRioCuarto);
const empleadoRioCuartoAdmin = new Empleado(5, 'Sofía', 'Peralta', 'speralta@srt.gob.ar', rolAdministrativo, cmRioCuarto);

// Padrón completo de empleados (todas las CM). Usado para buscar al Gerente de la CM destino.
export const empleados: Empleado[] = [
  empleadoVillaMaria,
  empleadoVillaMariaGerente,
  empleadoCordobaGerente,
  empleadoCordobaAdmin,
  empleadoRioCuartoGerente,
  empleadoRioCuartoAdmin,
];

// --- USUARIOS (credenciales moqueadas) ---
// Contraseña común de demo: "1234". Al migrar a DB se reemplaza por usuarios reales con hash.
export const usuarios: Usuario[] = [
  new Usuario(1, 'jperez', '1234', empleadoVillaMaria),
  new Usuario(2, 'agomez', '1234', empleadoCordobaGerente),
  new Usuario(3, 'lmartinez', '1234', empleadoCordobaAdmin),
  new Usuario(4, 'cruiz', '1234', empleadoRioCuartoGerente),
  new Usuario(5, 'speralta', '1234', empleadoRioCuartoAdmin),
];

// Bolsines (Mínimo 10 bolsines distribuidos según requerimiento)
export const bolsines: Bolsin[] = [
  
  // ==========================================
  // GRUPO A: 5 Bolsines en estado 'Enviado' con origen 'Villa María' (CM-VM)
  // [Aparecen en el mapa / filtro]
  // ==========================================
  
  // 1. BOL-4501 -> Destino Córdoba (James Craik)
  new Bolsin(1, 'BOL-4501', cmVillaMaria, cmCordoba, [
    new CambioDeEstadoBolsin(1, estadoCreado, new Date(Date.now() - 150000), new Date(Date.now() - 100000)),
    new CambioDeEstadoBolsin(2, estadoEnviado, new Date(Date.now() - 100000), null)
  ]),
  // 2. BOL-4502 -> Destino Córdoba (Oliva)
  new Bolsin(2, 'BOL-4502', cmVillaMaria, cmCordoba, [
    new CambioDeEstadoBolsin(3, estadoCreado, new Date(Date.now() - 160000), new Date(Date.now() - 110000)),
    new CambioDeEstadoBolsin(4, estadoEnviado, new Date(Date.now() - 110000), null)
  ]),
  // 3. BOL-4503 -> Destino Córdoba (Oncativo)
  new Bolsin(3, 'BOL-4503', cmVillaMaria, cmCordoba, [
    new CambioDeEstadoBolsin(5, estadoCreado, new Date(Date.now() - 170000), new Date(Date.now() - 120000)),
    new CambioDeEstadoBolsin(6, estadoEnviado, new Date(Date.now() - 120000), null)
  ]),
  // 4. BOL-4504 -> Destino Río Cuarto (Laguna Larga)
  new Bolsin(4, 'BOL-4504', cmVillaMaria, cmRioCuarto, [
    new CambioDeEstadoBolsin(7, estadoCreado, new Date(Date.now() - 180000), new Date(Date.now() - 130000)),
    new CambioDeEstadoBolsin(8, estadoEnviado, new Date(Date.now() - 130000), null)
  ]),
  // 5. BOL-4505 -> Destino Río Cuarto (Entrando a Córdoba Capital)
  new Bolsin(5, 'BOL-4505', cmVillaMaria, cmRioCuarto, [
    new CambioDeEstadoBolsin(9, estadoCreado, new Date(Date.now() - 190000), new Date(Date.now() - 140000)),
    new CambioDeEstadoBolsin(10, estadoEnviado, new Date(Date.now() - 140000), null)
  ]),

  // ==========================================
  // GRUPO B: Bolsines de control (No deben aparecer en el mapa)
  // ==========================================

  // B.1: Bolsín en estado 'Enviado' pero con origen de OTRA comisión (Marcos Juárez)
  // 6. BOL-4506 -> Origen Marcos Juárez, Destino San Juan (Enviado) [no aparece: origen != Villa María]
  new Bolsin(6, 'BOL-4506', cmMarcosJuarez, cmSanJuan, [
    new CambioDeEstadoBolsin(11, estadoCreado, new Date(Date.now() - 120000), new Date(Date.now() - 90000)),
    new CambioDeEstadoBolsin(12, estadoEnviado, new Date(Date.now() - 90000), null)
  ]),

  // B.2: 3 Bolsines con origen 'Villa María' pero estado actual 'Entregado' o 'Recibido'
  // 7. BOL-4601 -> Destino Córdoba (Entregado)
  new Bolsin(7, 'BOL-4601', cmVillaMaria, cmCordoba, [
    new CambioDeEstadoBolsin(13, estadoCreado, new Date(Date.now() - 300000), new Date(Date.now() - 250000)),
    new CambioDeEstadoBolsin(14, estadoEnviado, new Date(Date.now() - 250000), new Date(Date.now() - 50000)),
    new CambioDeEstadoBolsin(15, estadoEntregado, new Date(Date.now() - 50000), null)
  ]),
  // 8. BOL-4602 -> Destino Río Cuarto (Entregado)
  new Bolsin(8, 'BOL-4602', cmVillaMaria, cmRioCuarto, [
    new CambioDeEstadoBolsin(16, estadoCreado, new Date(Date.now() - 400000), new Date(Date.now() - 350000)),
    new CambioDeEstadoBolsin(17, estadoEnviado, new Date(Date.now() - 350000), new Date(Date.now() - 60000)),
    new CambioDeEstadoBolsin(18, estadoEntregado, new Date(Date.now() - 60000), null)
  ]),
  // 9. BOL-4603 -> Destino Córdoba (Recibido)
  new Bolsin(9, 'BOL-4603', cmVillaMaria, cmCordoba, [
    new CambioDeEstadoBolsin(19, estadoCreado, new Date(Date.now() - 500000), new Date(Date.now() - 450000)),
    new CambioDeEstadoBolsin(20, estadoEnviado, new Date(Date.now() - 450000), new Date(Date.now() - 100000)),
    new CambioDeEstadoBolsin(21, estadoRecibido, new Date(Date.now() - 100000), null)
  ]),

  // B.3: 2 Bolsines en estado 'Enviado' pero cuyo origen sea otra comisión
  // 10. BOL-4701 -> Origen San Francisco, Destino Córdoba (Enviado)
  new Bolsin(10, 'BOL-4701', cmSanFrancisco, cmCordoba, [
    new CambioDeEstadoBolsin(22, estadoCreado, new Date(Date.now() - 100000), new Date(Date.now() - 80000)),
    new CambioDeEstadoBolsin(23, estadoEnviado, new Date(Date.now() - 80000), null)
  ]),
  // 11. BOL-4702 -> Origen San Francisco, Destino Córdoba (Enviado)
  new Bolsin(11, 'BOL-4702', cmSanFrancisco, cmCordoba, [
    new CambioDeEstadoBolsin(24, estadoCreado, new Date(Date.now() - 120000), new Date(Date.now() - 90000)),
    new CambioDeEstadoBolsin(25, estadoEnviado, new Date(Date.now() - 90000), null)
  ]),

  // ==========================================
  // GRUPO C: 3 Bolsines en estado 'Enviado' con origen 'Córdoba' (CM-CBA)
  // [Aparecen en el mapa cuando se loguea lmartinez]
  // Cada uno con un modelo de GPS distinto
  // ==========================================

  // 12. BOL-4801 -> Destino Villa María (GPS: NavTrack QX-7A)
  new Bolsin(12, 'BOL-4801', cmCordoba, cmVillaMaria, [
    new CambioDeEstadoBolsin(26, estadoCreado, new Date(Date.now() - 200000), new Date(Date.now() - 160000)),
    new CambioDeEstadoBolsin(27, estadoEnviado, new Date(Date.now() - 160000), null)
  ], gpsNavTrack),
  // 13. BOL-4802 -> Destino Río Cuarto (GPS: GeoPulse MTR-900)
  new Bolsin(13, 'BOL-4802', cmCordoba, cmRioCuarto, [
    new CambioDeEstadoBolsin(28, estadoCreado, new Date(Date.now() - 210000), new Date(Date.now() - 170000)),
    new CambioDeEstadoBolsin(29, estadoEnviado, new Date(Date.now() - 170000), null)
  ], gpsGeoPulse),
  // 14. BOL-4803 -> Destino San Francisco (GPS: XTR-4500L)
  new Bolsin(14, 'BOL-4803', cmCordoba, cmSanFrancisco, [
    new CambioDeEstadoBolsin(30, estadoCreado, new Date(Date.now() - 220000), new Date(Date.now() - 180000)),
    new CambioDeEstadoBolsin(31, estadoEnviado, new Date(Date.now() - 180000), null)
  ], gpsXTR),

];
