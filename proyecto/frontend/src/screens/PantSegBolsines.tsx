import React, { useState, useEffect } from 'react';
import { MapaBolsines } from '../components/MapaBolsines';
import { API_BASE, authHeaders, UsuarioDTO } from '../api';

// Interfaz para la entidad Bolsín con los datos localizados
export interface Bolsin {
  numeroPrecinto: number;
  latitud: number;
  longitud: number;
  estado: string;
  fechaHoraActualizacion: string; // Atributo de fecha/hora de la última actualización GPS
  cmDestinoNombre: string; // Nombre de la Comisión Médica destino (paso 3 del diagrama)
  cmDestinoCodigo: string; // Código de la Comisión Médica destino
}

export interface ApiResponse {
  nombreCM: string;
  bolsines: Bolsin[];
}

export interface PantSegBolsinesProps {
  // Empleado logueado en la sesión actual (determina la CM de origen).
  usuario: UsuarioDTO;
  // Permite volver a la pantalla de menú (Paso 1: opConsultarUbicBolsines abre/cierra esta ventana)
  onVolver?: () => void;
}

// Clases reutilizables del lenguaje glassmorphism (panel de vidrio esmerilado)
const glassPanel =
  'bg-white/55 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(68,51,79,0.12)] ring-1 ring-brand-bgMain/5';

export const PantSegBolsines: React.FC<PantSegBolsinesProps> = ({ usuario, onVolver }) => {
  // Estados requeridos por el diseño y el diagrama de secuencia
  // Inicializa con la CM del usuario logueado; el server confirma el valor al responder.
  const [nombreCM, setNombreCM] = useState<string>(usuario.comisionMedica.nombre);
  const [bolsinesLocalizados, setBolsinesLocalizados] = useState<Bolsin[]>([]);
  const [filtroNumeroPrecinto, setFiltroNumeroPrecinto] = useState<string>('');
  const [filtroCMDestino, setFiltroCMDestino] = useState<string>(''); // '' = todas las CM destino
  const [bolsinSeleccionado, setBolsinSeleccionado] = useState<Bolsin | null>(null);

  // Estado para controlar la visualización del Modal (Pasos 8 y 9)
  const [showModal, setShowModal] = useState<boolean>(false);
  const [sendingMail, setSendingMail] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Al montarse (useEffect), hacer un fetch a la API para obtener los datos
  useEffect(() => {
    const obtenerBolsinesActivos = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/bolsines/activos`, {
          headers: { ...authHeaders() },
        });
        if (!response.ok) {
          throw new Error(`Error en el servidor: ${response.statusText}`);
        }
        const data: ApiResponse = await response.json();

        // Guardar en estados de React
        setNombreCM(data.nombreCM);
        setBolsinesLocalizados(data.bolsines);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError('No se pudo establecer conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    obtenerBolsinesActivos();
  }, []);

  // Método: tomarSeleccionBolsin(bolsin) - Paso 7 del diagrama de secuencia
  // Selecciona el bolsín al hacer clic en un bolsín del mapa
  const tomarSeleccionBolsin = (bolsin: Bolsin) => {
    setBolsinSeleccionado(bolsin);
  };

  // Método: tomarConfirmacionEnvioMail() - Paso 9 del diagrama de secuencia
  // Hace el POST al endpoint de notificación
  const tomarConfirmacionEnvioMail = async () => {
    if (!bolsinSeleccionado) return;

    try {
      setSendingMail(true);
      const response = await fetch(`${API_BASE}/api/bolsines/notificar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          numeroPrecinto: bolsinSeleccionado.numeroPrecinto,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la notificación. Inténtalo nuevamente.');
      }

      // Refrescar el horario (y coords) del bolsín con la lectura fresca devuelta por el server
      if (data.fechaHoraActualizacion) {
        const actualizado: Bolsin = {
          ...bolsinSeleccionado,
          fechaHoraActualizacion: data.fechaHoraActualizacion,
          latitud: data.latitud ?? bolsinSeleccionado.latitud,
          longitud: data.longitud ?? bolsinSeleccionado.longitud,
        };
        setBolsinSeleccionado(actualizado);
        setBolsinesLocalizados((prev) =>
          prev.map((b) => (b.numeroPrecinto === actualizado.numeroPrecinto ? actualizado : b))
        );
      }

      // Si fue exitoso, mostramos un aviso de éxito
      lanzarToast(`Notificación enviada con éxito para el Bolsín Nº ${bolsinSeleccionado.numeroPrecinto}`, 'success');
      setShowModal(false);
    } catch (err: any) {
      console.error(err);
      lanzarToast(err.message || 'Fallo al despachar el correo electrónico.', 'error');
    } finally {
      setSendingMail(false);
    }
  };

  const lanzarToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Función formateadora de fecha para cumplir estrictamente con el formato: DD/MM/AAAA HH:MM
  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return '';
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${anio} ${hora}:${min}`;
  };

  // Lista de CM destino únicas presentes en los bolsines localizados (para el selector de filtro)
  const cmDestinosDisponibles = Array.from(
    new Set(bolsinesLocalizados.map((b) => b.cmDestinoNombre))
  ).sort((a, b) => a.localeCompare(b));

  // Paso 6 del diagrama: filtrar por número de precinto Y/O por CM destino (se combinan)
  const bolsinesFiltrados = bolsinesLocalizados.filter((b) => {
    const precintoStr = String(b.numeroPrecinto);
    const codigoFormateado = `BOL-${precintoStr.padStart(3, '0')}`;
    const busqueda = filtroNumeroPrecinto.trim().toLowerCase();

    const coincidePrecinto =
      precintoStr.includes(busqueda) || codigoFormateado.toLowerCase().includes(busqueda);
    const coincideDestino = filtroCMDestino === '' || b.cmDestinoNombre === filtroCMDestino;

    return coincidePrecinto && coincideDestino;
  });

  const hayFiltroActivo = filtroNumeroPrecinto !== '' || filtroCMDestino !== '';

  const limpiarFiltros = () => {
    setFiltroNumeroPrecinto('');
    setFiltroCMDestino('');
  };

  return (
    <div className="relative min-h-dvh flex flex-col font-sans antialiased text-brand-bgMain selection:bg-brand-primary selection:text-white overflow-hidden">

      {/* FONDO: gradiente base + blobs de color difuminados que dan vida al vidrio */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-[#fbe7df] via-[#f4eef3] to-[#efe7f0]" aria-hidden="true" />
      <div className="pointer-events-none fixed -top-32 -left-24 -z-10 w-[28rem] h-[28rem] rounded-full bg-brand-primary/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none fixed top-1/3 -right-28 -z-10 w-[30rem] h-[30rem] rounded-full bg-brand-secondary/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none fixed -bottom-40 left-1/3 -z-10 w-[26rem] h-[26rem] rounded-full bg-brand-bgMain/15 blur-3xl" aria-hidden="true" />

      {/* Sistema de Notificaciones Flotantes (Toast) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 px-5 py-3.5 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all duration-300 z-[100] flex items-center gap-3 max-w-md ${
            toast.type === 'success'
              ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900'
              : 'bg-rose-50/80 border-rose-200/80 text-rose-900'
          }`}
        >
          <div
            className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center ${
              toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* HEADER con el nombre de la CM del usuario */}
      <header className={`sticky top-0 z-50 ${glassPanel} border-x-0 border-t-0 rounded-none`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Flujo alternativo A4: el EB cancela la ejecución del caso de uso y vuelve al menú principal */}
            {onVolver && (
              <button
                onClick={onVolver}
                aria-label="Volver al menú principal (cancelar caso de uso)"
                className="w-9 h-9 -ml-1 shrink-0 rounded-xl flex items-center justify-center text-brand-bgMain hover:bg-brand-bgMain/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-brand-bgMain">Seguimiento de Bolsines</h1>
              <p className="text-xs text-brand-bgMain/60 font-mono">PPAI 2026 • SEGUIMIENTO EN TIEMPO REAL</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 motion-safe:animate-pulse shadow-sm shadow-emerald-500/50"></span>
            <span className="hidden sm:inline text-xs text-brand-bgMain/70 font-medium">Comisión Médica de Origen:</span>
            <span className="text-xs font-bold text-white bg-gradient-to-tr from-brand-primary to-brand-secondary px-2.5 py-1.5 rounded-lg shadow-sm">
              {nombreCM}
            </span>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

        {/* BARRA DE BÚSQUEDA Y FILTRADO (Paso 6: filtrar por número de precinto o CM destino) */}
        <section className={`${glassPanel} rounded-2xl p-5 flex flex-col gap-4`}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filtro por número de precinto */}
            <div className="w-full md:w-1/2 flex flex-col gap-1.5">
              <label htmlFor="search-input" className="text-xs font-bold text-brand-bgMain uppercase tracking-wider">
                Filtrar por Número de Precinto
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-bgMain/50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="search-input"
                  type="text"
                  inputMode="text"
                  placeholder="Ingresa número de precinto (ej. 4501 o BOL-4501)"
                  value={filtroNumeroPrecinto}
                  onChange={(e) => setFiltroNumeroPrecinto(e.target.value)}
                  className="w-full bg-white/70 border border-white/70 rounded-xl py-2.5 pl-10 pr-4 text-sm text-brand-bgMain placeholder-brand-bgMain/40 focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/40 transition-all"
                />
              </div>
            </div>

            {/* Filtro por Comisión Médica destino */}
            <div className="w-full md:w-1/2 flex flex-col gap-1.5">
              <label htmlFor="filtro-destino" className="text-xs font-bold text-brand-bgMain uppercase tracking-wider">
                Filtrar por CM Destino
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-bgMain/50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <select
                  id="filtro-destino"
                  value={filtroCMDestino}
                  onChange={(e) => setFiltroCMDestino(e.target.value)}
                  className="w-full appearance-none bg-white/70 border border-white/70 rounded-xl py-2.5 pl-10 pr-9 text-sm text-brand-bgMain focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/40 transition-all cursor-pointer"
                >
                  <option value="">Todas las comisiones destino</option>
                  {cmDestinosDisponibles.map((cm) => (
                    <option key={cm} value={cm}>
                      {cm}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-brand-bgMain/50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Contador y limpieza */}
          <div className="flex items-center justify-end gap-3 text-xs text-brand-bgMain">
            <span>
              Encontrados:{' '}
              <strong className="text-white bg-brand-bgMain px-2.5 py-0.5 rounded font-bold text-xs">
                {bolsinesFiltrados.length}
              </strong>{' '}
              / {bolsinesLocalizados.length}
            </span>
            {hayFiltroActivo && (
              <button
                onClick={limpiarFiltros}
                className="text-brand-primary hover:text-brand-primary/80 font-bold underline rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </section>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-brand-bgMain/15 border-t-brand-primary motion-safe:animate-spin"></div>
            <p className="text-brand-bgMain/60 text-xs font-bold tracking-wider motion-safe:animate-pulse">
              CARGANDO UBICACIONES...
            </p>
          </div>
        ) : error ? (
          <div className={`${glassPanel} rounded-2xl p-6 text-center max-w-md mx-auto my-12`}>
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-2.99l-6.93-12a2 2 0 00-3.48 0l-6.93 12A2 2 0 005.07 19z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-rose-800">Error de Conexión</h3>
            <p className="text-xs text-rose-600 mt-1.5">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg text-xs font-bold transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
            >
              Reintentar
            </button>
          </div>
        ) : bolsinesLocalizados.length === 0 ? (
          /* Flujo alternativo A1: no se encontraron bolsines en estado Enviado para la CM del usuario */
          <div className={`${glassPanel} rounded-2xl p-8 text-center max-w-md mx-auto my-12`}>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-bgMain/10 text-brand-bgMain flex items-center justify-center mb-4">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-brand-bgMain">Sin bolsines en tránsito</h3>
            <p className="text-xs text-brand-bgMain/70 mt-2 leading-relaxed">
              No se encontraron bolsines en estado <strong>Enviado</strong> para la Comisión Médica{' '}
              <strong>{nombreCM}</strong>. No hay ubicaciones que mostrar en este momento.
            </p>
            {onVolver && (
              <button
                onClick={onVolver}
                className="mt-5 px-4 py-2 bg-brand-bgMain/90 hover:bg-brand-bgMain text-white rounded-lg text-xs font-bold transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-bgMain/50"
              >
                Volver al menú
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">

            {/* RENDERIZADO DEL MAPA (Radar Táctico sobre vidrio) */}
            <div className={`lg:col-span-2 ${glassPanel} rounded-2xl overflow-hidden flex flex-col relative min-h-[420px] lg:min-h-[500px]`}>

              {/* Encabezado del radar */}
              <div className="p-3.5 border-b border-white/50 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-accent motion-safe:animate-pulse shadow-sm shadow-brand-accent/60"></span>
                  <span className="text-xs font-bold tracking-wider text-brand-bgMain uppercase">Mapa de Seguimiento</span>
                </div>
                <div className="hidden sm:block text-xs text-brand-bgMain/60 font-mono">CM {nombreCM}</div>
              </div>

              {/* Mapa funcional (Leaflet + OpenStreetMap) con la posición real de cada bolsín */}
              <div className="flex-1 relative overflow-hidden">
                <MapaBolsines
                  bolsines={bolsinesFiltrados}
                  bolsinSeleccionado={bolsinSeleccionado}
                  onSeleccionarBolsin={tomarSeleccionBolsin}
                />
              </div>

              {/* Leyenda y notas */}
              <div className="p-3.5 border-t border-white/50 text-xs text-brand-bgMain/70 flex flex-wrap gap-2 justify-between items-center z-10 font-medium">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-accent border border-white shadow-sm"></span>
                    Bolsín en Tránsito
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-primary border border-white shadow-sm"></span>
                    Bolsín Seleccionado
                  </span>
                </div>
                <span>Haz clic en un marcador para ver opciones</span>
              </div>
            </div>

            {/* PANEL LATERAL: DETALLES Y LISTADO */}
            <div className="flex flex-col gap-6">

              {/* DETALLES DEL BOLSÍN SELECCIONADO */}
              <div className={`${glassPanel} rounded-2xl p-5 flex flex-col min-h-[240px] justify-between`}>
                {bolsinSeleccionado ? (
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded bg-brand-accent text-brand-bgMain text-xs font-bold tracking-wider uppercase shadow-sm">
                          {bolsinSeleccionado.estado}
                        </span>
                        <span className="text-xs font-bold text-brand-bgMain">ID Precinto: #{bolsinSeleccionado.numeroPrecinto}</span>
                      </div>

                      <h3 className="text-xl font-bold tracking-wider mt-2.5 text-brand-bgMain">
                        BOL-{String(bolsinSeleccionado.numeroPrecinto).padStart(3, '0')}
                      </h3>

                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex justify-between items-center border-b border-brand-bgMain/10 py-1.5">
                          <span className="text-brand-bgMain/70 font-semibold">Comisión Origen:</span>
                          <span className="text-brand-bgMain font-bold">{nombreCM}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-brand-bgMain/10 py-1.5">
                          <span className="text-brand-bgMain/70 font-semibold">CM Destino:</span>
                          <span className="text-brand-bgMain font-bold">{bolsinSeleccionado.cmDestinoNombre}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-brand-bgMain/10 py-1.5">
                          <span className="text-brand-bgMain/70 font-semibold">Coordenadas GPS:</span>
                          <span className="text-brand-bgMain font-mono font-bold tabular-nums">
                            {bolsinSeleccionado.latitud}, {bolsinSeleccionado.longitud}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-brand-bgMain/70 font-semibold">Última Lectura:</span>
                          <span className="text-brand-bgMain font-mono font-bold tabular-nums">
                            {formatearFecha(bolsinSeleccionado.fechaHoraActualizacion)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-2">
                      <button
                        onClick={() => setShowModal(true)}
                        className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/90 active:scale-[0.98] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Notificar Ubicación
                      </button>

                      <a
                        href={`https://www.google.com/maps?q=${bolsinSeleccionado.latitud},${bolsinSeleccionado.longitud}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 bg-brand-bgMain/90 hover:bg-brand-bgMain active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-bgMain/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Ver en Google Maps
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <div className="w-12 h-12 rounded-2xl bg-brand-bgMain/10 flex items-center justify-center text-brand-bgMain mb-3">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-brand-bgMain">Ningún Bolsín Seleccionado</p>
                    <p className="text-xs text-brand-bgMain/70 mt-1 max-w-[200px] leading-relaxed">
                      Haz clic sobre un pin del mapa para visualizar sus datos de seguimiento.
                    </p>
                  </div>
                )}
              </div>

              {/* LISTADO DE BOLSINES FILTRADOS */}
              <div className={`${glassPanel} rounded-2xl overflow-hidden flex flex-col flex-1`}>
                <div className="p-3.5 border-b border-white/50">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-bgMain">
                    Bolsines Localizados ({bolsinesFiltrados.length})
                  </h3>
                </div>

                <div className="overflow-y-auto max-h-[220px] lg:max-h-none flex-1 divide-y divide-brand-bgMain/10">
                  {bolsinesFiltrados.length > 0 ? (
                    bolsinesFiltrados.map((bolsin) => {
                      const seleccionado = bolsinSeleccionado?.numeroPrecinto === bolsin.numeroPrecinto;
                      const codigoStr = `BOL-${String(bolsin.numeroPrecinto).padStart(3, '0')}`;

                      return (
                        <button
                          key={bolsin.numeroPrecinto}
                          onClick={() => {
                            setBolsinSeleccionado(bolsin);
                          }}
                          aria-pressed={seleccionado}
                          className={`w-full p-3.5 text-left flex items-center justify-between transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary ${
                            seleccionado
                              ? 'bg-brand-bgMain text-white border-l-4 border-brand-primary pl-2.5'
                              : 'hover:bg-white/40 text-brand-bgMain'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full ${seleccionado ? 'bg-brand-accent motion-safe:animate-pulse' : 'bg-brand-bgMain/40'}`}></span>
                            <div>
                              <span className={`font-sans font-bold text-xs ${seleccionado ? 'text-white' : 'text-brand-bgMain'}`}>
                                {codigoStr}
                              </span>
                              <div className={`text-xs mt-0.5 flex gap-1 ${seleccionado ? 'text-white/75' : 'text-brand-bgMain/65'}`}>
                                <span>Orig: {nombreCM}</span>
                                <span>•</span>
                                <span>Dest: {bolsin.cmDestinoNombre}</span>
                              </div>
                              <div className={`text-xs mt-0.5 font-mono tabular-nums flex items-center gap-1 ${seleccionado ? 'text-white/75' : 'text-brand-bgMain/55'}`}>
                                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{formatearFecha(bolsin.fechaHoraActualizacion)}</span>
                              </div>
                            </div>
                          </div>

                          <svg
                            className={`w-4 h-4 transition-transform ${seleccionado ? 'text-white translate-x-0.5' : 'text-brand-bgMain/50'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      );
                    })
                  ) : (
                    /* Flujo alternativo A2: no se encontró ningún bolsín con el precinto / CM destino ingresados */
                    <div className="py-8 text-center text-brand-bgMain/55 text-xs">
                      No se encontró ningún bolsín con el número de precinto ingresado.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DIÁLOGO FLOTANTE (MODAL DE CONFIRMACIÓN DE ENVÍO DE MAIL - Pasos 8 y 9) */}
      {showModal && bolsinSeleccionado && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="absolute inset-0 bg-brand-bgMain/50 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>

          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-3xl p-6 max-w-md w-full relative z-90 shadow-[0_20px_60px_rgba(68,51,79,0.35)] ring-1 ring-brand-bgMain/5 motion-safe:animate-[fadeIn_200ms_ease-out]">

            <div className="flex items-center gap-3 border-b border-brand-bgMain/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 id="modal-title" className="font-bold text-sm text-brand-bgMain">Confirmar Envío de Correo</h4>
            </div>

            <div className="my-5 text-xs text-brand-bgMain/90 leading-relaxed">
              <p>
                ¿Desea enviar un correo electrónico al Gerente de la Comisión Médica destino para informar la ubicación del Bolsín Nº{' '}
                <strong className="text-brand-primary font-bold text-xs bg-brand-primary/10 border border-brand-primary/20 px-1.5 py-0.5 rounded">
                  BOL-{String(bolsinSeleccionado.numeroPrecinto).padStart(3, '0')}
                </strong>
                ?
              </p>

              {/* Atributo de fecha/hora de la última actualización visualizado textualmente (DD/MM/AAAA HH:MM) */}
              <div className="mt-4 bg-white/60 border border-white/70 rounded-xl p-3 flex items-center justify-between text-brand-bgMain/80 font-medium">
                <span>Última actualización:</span>
                <span className="text-brand-bgMain font-mono font-bold tabular-nums">{formatearFecha(bolsinSeleccionado.fechaHoraActualizacion)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-bgMain/10">
              {/* Flujo alternativo A5: el EB no selecciona la opción de enviar el correo (cierra sin notificar) */}
              <button
                disabled={sendingMail}
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-brand-bgMain/90 hover:bg-brand-bgMain text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-bgMain/50"
              >
                Cancelar
              </button>

              <button
                disabled={sendingMail}
                onClick={tomarConfirmacionEnvioMail}
                className="px-5 py-2 bg-brand-primary hover:bg-brand-primary/90 disabled:bg-brand-bgMain/30 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
              >
                {sendingMail ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full motion-safe:animate-spin"></span>
                    Despachando...
                  </>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
