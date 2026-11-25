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
export const rolGerente = new Rol('Gerente');
export const rolAdministrativo = new Rol('Administrativo');

// Comisiones Medicas
export const cmVillaMaria = new ComisionMedica('Villa María', 'CM-VM');
export const cmCordoba = new ComisionMedica('Córdoba', 'CM-CBA');
export const cmRioCuarto = new ComisionMedica('Río Cuarto', 'CM-RC');
export const cmSanFrancisco = new ComisionMedica('San Francisco', 'CM-SF');
export const cmMarcosJuarez = new ComisionMedica('Marcos Juárez', 'CM-MJ');
export const cmSanJuan = new ComisionMedica('San Juan', 'CM-SJ');

// Estados de Bolsin
export const estadoEnviado = new EstadoBolsin('Enviado');
export const estadoEntregado = new EstadoBolsin('Entregado');
export const estadoRecibido = new EstadoBolsin('Recibido');
export const estadoCreado = new EstadoBolsin('Creado');

// Dispositivos GPS (3 modelos disponibles según Observación 1)
const gpsXTR = new DispositivoGPS('GPS Tracker', 'XTR-4500L');
const gpsNavTrack = new DispositivoGPS('NavTrack', 'NavTrack QX-7A');
const gpsGeoPulse = new DispositivoGPS('GeoPulse', 'GeoPulse MTR-900');

// --- EMPLEADOS (padrón de cada Comisión Médica) ---
// Empleados de CM Villa María
const empleadoVillaMariaGerente = new Empleado('María', 'López', 'mlopez@srt.gob.ar', rolGerente, cmVillaMaria);
export const empleadoVillaMaria = new Empleado('Juan', 'Pérez', 'jperez@srt.gob.ar', rolAdministrativo, cmVillaMaria);

// Empleados de CM Córdoba
const empleadoCordobaGerente = new Empleado('Ana', 'Gómez', 'agomez@srt.gob.ar', rolGerente, cmCordoba);
const empleadoCordobaAdmin = new Empleado('Luis', 'Martínez', 'lmartinez@srt.gob.ar', rolAdministrativo, cmCordoba);

// Empleados de CM Río Cuarto
const empleadoRioCuartoGerente = new Empleado('Carlos', 'Ruiz', 'cruiz@srt.gob.ar', rolGerente, cmRioCuarto);
const empleadoRioCuartoAdmin = new Empleado('Sofía', 'Peralta', 'speralta@srt.gob.ar', rolAdministrativo, cmRioCuarto);

// Empleados de CM San Francisco y Marcos Juárez (responsables de cambios de estado)
const empleadoSanFranciscoAdmin = new Empleado('Diego', 'Sosa', 'dsosa@srt.gob.ar', rolAdministrativo, cmSanFrancisco);
const empleadoMarcosJuarezAdmin = new Empleado(
  'Paula',
  'Ferreyra',
  'pferreyra@srt.gob.ar',
  rolAdministrativo,
  cmMarcosJuarez
);

// Padrón completo de empleados (todas las CM). Usado para buscar al Gerente de la CM destino.
export const empleados: Empleado[] = [
  empleadoVillaMaria,
  empleadoVillaMariaGerente,
  empleadoCordobaGerente,
  empleadoCordobaAdmin,
  empleadoRioCuartoGerente,
  empleadoRioCuartoAdmin,
  empleadoSanFranciscoAdmin,
  empleadoMarcosJuarezAdmin,
];

// --- USUARIOS (credenciales moqueadas) ---
export const usuarios: Usuario[] = [
  new Usuario('jperez', '1234', empleadoVillaMaria),
  new Usuario('agomez', '1234', empleadoCordobaGerente),
  new Usuario('lmartinez', '1234', empleadoCordobaAdmin),
  new Usuario('cruiz', '1234', empleadoRioCuartoGerente),
  new Usuario('speralta', '1234', empleadoRioCuartoAdmin),
];

// Bolsines (Mínimo 10 bolsines distribuidos según requerimiento)
export const bolsines: Bolsin[] = [
  // ==========================================
  // GRUPO A: 5 Bolsines en estado 'Enviado' con origen 'Villa María' (CM-VM)
  // [Aparecen en el mapa / filtro]
  // ==========================================

  // 1. BOL-4501 -> Destino Córdoba (James Craik) (Precinto: 4501)
  new Bolsin(1, 4501, new Date(Date.now() - 150000), 2.5, cmVillaMaria, cmCordoba, [
    new CambioDeEstadoBolsin(
      estadoCreado,
      new Date(Date.now() - 150000),
      new Date(Date.now() - 100000),
      empleadoVillaMaria
    ),
    new CambioDeEstadoBolsin(estadoEnviado, new Date(Date.now() - 100000), null, empleadoVillaMaria),
  ]),

  // 2. BOL-4502 -> Destino Córdoba (Oliva) (GPS: NavTrack QX-7A) (Precinto: 4502)
  new Bolsin(
    2,
    4502,
    new Date(Date.now() - 160000),
    2.5,
    cmVillaMaria,
    cmCordoba,
    [
      new CambioDeEstadoBolsin(
        estadoCreado,
        new Date(Date.now() - 160000),
        new Date(Date.now() - 110000),
        empleadoVillaMaria
      ),
      new CambioDeEstadoBolsin(estadoEnviado, new Date(Date.now() - 110000), null, empleadoVillaMaria),
    ],
    new DispositivoGPS('NavTrack', 'NavTrack QX-7A')
  ),

  // 3. BOL-4503 -> Destino Córdoba (Oncativo) (GPS: GeoPulse MTR-900) (Precinto: 4503)
  new Bolsin(
    3,
    4503,
    new Date(Date.now() - 170000),
    2.5,
    cmVillaMaria,
    cmCordoba,
    [
      new CambioDeEstadoBolsin(
        estadoCreado,
        new Date(Date.now() - 170000),
        new Date(Date.now() - 120000),
        empleadoVillaMaria
      ),
      new CambioDeEstadoBolsin(estadoEnviado, new Date(Date.now() - 120000), null, empleadoVillaMaria),
    ],
    new DispositivoGPS('GeoPulse', 'GeoPulse MTR-900')
  ),

  // 4. BOL-4504 -> Destino Río Cuarto (Laguna Larga) (Precinto: 4504)
  new Bolsin(4, 4504, new Date(Date.now() - 180000), 2.5, cmVillaMaria, cmRioCuarto, [
    new CambioDeEstadoBolsin(
      estadoCreado,
      new Date(Date.now() - 180000),
      new Date(Date.now() - 130000),
      empleadoVillaMaria
    ),
    new CambioDeEstadoBolsin(estadoEnviado, new Date(Date.now() - 130000), null, empleadoVillaMaria),
  ]),

  // 5. BOL-4505 -> Destino Río Cuarto (Entrando a Córdoba Capital) (Precinto: 4505)
  new Bolsin(5, 4505, new Date(Date.now() - 190000), 2.5, cmVillaMaria, cmRioCuarto, [
    new CambioDeEstadoBolsin(
      estadoCreado,
      new Date(Date.now() - 190000),
      new Date(Date.now() - 140000),
      empleadoVillaMaria
    ),
    new CambioDeEstadoBolsin(estadoEnviado, new Date(Date.now() - 140000), null, empleadoVillaMaria),
  ]),

  // 15. BOL-4507 -> Destino Córdoba. Su GPS Tracker no responde (flujo alternativo A3) (Precinto: 4507)
  new Bolsin(
    15,
    4507,
    new Date(Date.now() - 200000),
    2.5,
    cmVillaMaria,
    cmCordoba,
    [
      new CambioDeEstadoBolsin(
        estadoCreado,
        new Date(Date.now() - 200000),
        new Date(Date.now() - 150000),
        empleadoVillaMaria
      ),
      new CambioDeEstadoBolsin(estadoEnviado, new Date(Date.now() - 150000), null, empleadoVillaMaria),
    ],
    new DispositivoGPS('GeoPulse', 'GeoPulse MTR-900')
  ),

  // ==========================================
  // GRUPO B: Bolsines de control (No deben aparecer en el mapa)
  // ==========================================

  // B.1: Bolsín en estado 'Enviado' pero con origen de OTRA comisión (Marcos Juárez)
  // 6. BOL-4506 -> Origen Marcos Juárez, Destino San Juan (Enviado) (Precinto: 4506)
  new Bolsin(6, 4506, new Date(Date.now() - 120000), 2.5, cmMarcosJuarez, cmSanJuan, [
    new CambioDeEstadoBolsin(
      estadoCreado,
      new Date(Date.now() - 120000),
      new Date(Date.now() - 90000),
      empleadoMarcosJuarezAdmin
    ),
    new CambioDeEstadoBolsin(estadoEnviado, new Date(Date.now() - 90000), null, empleadoMarcosJuarezAdmin),
  ]),

  // B.2: 3 Bolsines con origen 'Villa María' pero estado actual 'Entregado' o 'Recibido'
  // 7. BOL-4601 -> Destino Córdoba (Entregado) (Precinto: 4601)
  new Bolsin(7, 4601, new Date(Date.now() - 300000), 2.5, cmVillaMaria, cmCordoba, [
    new CambioDeEstadoBolsin(
      estadoCreado,
      new Date(Date.now() - 300000),
      new Date(Date.now() - 250000),
      empleadoVillaMaria
    ),
    new CambioDeEstadoBolsin(
      estadoEnviado,
      new Date(Date.now() - 250000),
      new Date(Date.now() - 50000),
      empleadoVillaMaria
    ),
    new CambioDeEstadoBolsin(estadoEntregado, new Date(Date.now() - 50000), null, empleadoVillaMaria),
  ]),

  // 8. BOL-4602 -> Destino Río Cuarto (Entregado) (Precinto: 4602)
  new Bolsin(8, 4602, new Date(Date.now() - 400000), 2.5, cmVillaMaria, cmRioCuarto, [
    new CambioDeEstadoBolsin(
      estadoCreado,
      new Date(Date.now() - 400000),
      new Date(Date.now() - 350000),
      empleadoVillaMaria
    ),
    new CambioDeEstadoBolsin(
      estadoEnviado,
      new Date(Date.now() - 350000),
      new Date(Date.now() - 60000),
      empleadoVillaMaria
    ),
    new CambioDeEstadoBolsin(estadoEntregado, new Date(Date.now() - 60000), null, empleadoVillaMaria),
  ]),

  // 9. BOL-4603 -> Destino Córdoba (Recibido) (Precinto: 4603)
  new Bolsin(9, 4603, new Date(Date.now() - 500000), 2.5, cmVillaMaria, cmCordoba, [
    new CambioDeEstadoBolsin(
      estadoCreado,
      new Date(Date.now() - 500000),
      new Date(Date.now() - 450000),
      empleadoVillaMaria
    ),
    new CambioDeEstadoBolsin(
      estadoEnviado,
      new Date(Date.now() - 450000),
      new Date(Date.now() - 100000),
      empleadoVillaMaria
    ),
    new CambioDeEstadoBolsin(estadoRecibido, new Date(Date.now() - 100000), null, empleadoVillaMaria),
  ]),

  // B.3: 2 Bolsines en estado 'Enviado' pero cuyo origen sea otra comisión
  // 10. BOL-4701 -> Origen San Francisco, Destino Córdoba (Enviado) (Precinto: 4701)
  new Bolsin(10, 4701, new Date(Date.now() - 100000), 2.5, cmSanFrancisco, cmCordoba, [
    new CambioDeEstadoBolsin(
      estadoCreado,
      new Date(Date.now() - 100000),
      new Date(Date.now() - 80000),
      empleadoSanFranciscoAdmin
    ),
    new CambioDeEstadoBolsin(estadoEnviado, new Date(Date.now() - 80000), null, empleadoSanFranciscoAdmin),
  ]),

  // 11. BOL-4702 -> Origen San Francisco, Destino Córdoba (Enviado) (Precinto: 4702)
  new Bolsin(11, 4702, new Date(Date.now() - 120000), 2.5, cmSanFrancisco, cmCordoba, [
    new CambioDeEstadoBolsin(
      estadoCreado,
      new Date(Date.now() - 120000),
      new Date(Date.now() - 90000),
      empleadoSanFranciscoAdmin
    ),
    new CambioDeEstadoBolsin(estadoEnviado, new Date(Date.now() - 90000), null, empleadoSanFranciscoAdmin),
  ]),

  // ==========================================
  // GRUPO C: 3 Bolsines en estado 'Enviado' con origen 'Córdoba' (CM-CBA)
  // [Aparecen en el mapa cuando se loguea lmartinez]
  // Cada uno con un modelo de GPS distinto
  // ==========================================

  // 12. BOL-4801 -> Destino Villa María (GPS: NavTrack QX-7A) (Precinto: 4801)
  new Bolsin(
    12,
    4801,
    new Date(Date.now() - 200000),
    2.5,
    cmCordoba,
    cmVillaMaria,
    [
      new CambioDeEstadoBolsin(
        estadoCreado,
        new Date(Date.now() - 200000),
        new Date(Date.now() - 160000),
        empleadoCordobaAdmin
      ),
      new CambioDeEstadoBolsin(estadoEnviado, new Date(Date.now() - 160000), null, empleadoCordobaAdmin),
    ],
    gpsNavTrack
  ),

  // 13. BOL-4802 -> Destino Río Cuarto (GPS: GeoPulse MTR-900) (Precinto: 4802)
  new Bolsin(
    13,
    4802,
    new Date(Date.now() - 210000),
    2.5,
    cmCordoba,
    cmRioCuarto,
    [
      new CambioDeEstadoBolsin(
        estadoCreado,
        new Date(Date.now() - 210000),
        new Date(Date.now() - 170000),
        empleadoCordobaAdmin
      ),
      new CambioDeEstadoBolsin(estadoEnviado, new Date(Date.now() - 170000), null, empleadoCordobaAdmin),
    ],
    gpsGeoPulse
  ),

  // 14. BOL-4803 -> Destino San Francisco (GPS: XTR-4500L) (Precinto: 4803)
  new Bolsin(
    14,
    4803,
    new Date(Date.now() - 220000),
    2.5,
    cmCordoba,
    cmSanFrancisco,
    [
      new CambioDeEstadoBolsin(
        estadoCreado,
        new Date(Date.now() - 220000),
        new Date(Date.now() - 180000),
        empleadoCordobaAdmin
      ),
      new CambioDeEstadoBolsin(estadoEnviado, new Date(Date.now() - 180000), null, empleadoCordobaAdmin),
    ],
    gpsXTR
  ),
];
