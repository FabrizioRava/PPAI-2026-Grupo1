import React, { useState, useEffect } from 'react';

// Interfaz para la entidad Bolsín con los datos localizados
export interface Bolsin {
  numeroPrecinto: number;
  latitud: number;
  longitud: number;
  estado: string;
  fechaHoraActualizacion: string; // Atributo de fecha/hora de la última actualización GPS
}

export interface ApiResponse {
  nombreCM: string;
  bolsines: Bolsin[];
}

export const PantSegBolsines: React.FC = () => {
  // Estados requeridos por el diseño y el diagrama de secuencia
  const [nombreCM, setNombreCM] = useState<string>('');
  const [bolsinesLocalizados, setBolsinesLocalizados] = useState<Bolsin[]>([]);
  const [filtroNumeroPrecinto, setFiltroNumeroPrecinto] = useState<string>('');
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
        const response = await fetch('http://localhost:3000/api/bolsines/activos');
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
        setError('No se pudo establecer conexión con el servidor satelital.');
      } finally {
        setLoading(false);
      }
    };

    obtenerBolsinesActivos();
  }, []);

  // Método: tomarSeleccionBolsin(bolsin) - Paso 7 del diagrama de secuencia
  // Abre el Modal de confirmación al hacer clic en un bolsín del mapa
  const tomarSeleccionBolsin = (bolsin: Bolsin) => {
    setBolsinSeleccionado(bolsin);
    setShowModal(true);
  };

  // Método: tomarConfirmacionEnvioMail() - Paso 9 del diagrama de secuencia
  // Hace el POST al endpoint de notificación
  const tomarConfirmacionEnvioMail = async () => {
    if (!bolsinSeleccionado) return;

    try {
      setSendingMail(true);
      const response = await fetch('http://localhost:3000/api/bolsines/notificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numeroPrecinto: bolsinSeleccionado.numeroPrecinto
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar la notificación. Inténtalo nuevamente.');
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

  // Filtrado de bolsines en memoria basado en filtroNumeroPrecinto
  const bolsinesFiltrados = bolsinesLocalizados.filter(b => {
    const precintoStr = String(b.numeroPrecinto);
    const codigoFormateado = `BOL-${precintoStr.padStart(3, '0')}`;
    const busqueda = filtroNumeroPrecinto.trim().toLowerCase();
    
    return precintoStr.includes(busqueda) || codigoFormateado.toLowerCase().includes(busqueda);
  });

  // Mapear coordenadas geográficas al área visible de la pantalla (Córdoba / Villa María)
  const obtenerPosicionRadar = (lat: number, lng: number) => {
    const latMin = -32.4;
    const latMax = -31.4;
    const lngMin = -64.2;
    const lngMax = -63.2;

    const y = 100 - ((lat - latMin) / (latMax - latMin)) * 100;
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;

    return {
      left: `${Math.min(Math.max(x, 8), 92)}%`,
      top: `${Math.min(Math.max(y, 8), 92)}%`
    };
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-slate-900 relative">
      
      {/* Sistema de Notificaciones Flotantes (Toast) */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-5 py-3.5 rounded-xl border shadow-2xl transition-all duration-300 transform translate-y-0 z-[100] flex items-center gap-3 max-w-md ${
          toast.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            {toast.type === 'success' ? '✓' : '✗'}
          </div>
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* HEADER con el nombre de la CM del usuario */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/15">
              <svg className="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Seguimiento de Bolsines
              </h1>
              <p className="text-[10px] text-slate-500 font-mono">PPAI 2026 • SEGUIMIENTO EN TIEMPO REAL</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-400">Comisión Médica de Origen:</span>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded-lg">
              {nombreCM || 'Villa María'}
            </span>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* BARRA DE BÚSQUEDA Y FILTRADO */}
        <section className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-4 backdrop-blur-sm shadow-xl flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:w-1/2 flex flex-col gap-1.5">
            <label htmlFor="search-input" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Filtrar por Número de Precinto
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search-input"
                type="text"
                placeholder="Ingresa número de precinto (ej. 001 o BOL-001)"
                value={filtroNumeroPrecinto}
                onChange={(e) => setFiltroNumeroPrecinto(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex items-center justify-end gap-3 self-end h-10 text-xs text-slate-400">
            <span>
              Encontrados: <strong className="text-cyan-400">{bolsinesFiltrados.length}</strong> / {bolsinesLocalizados.length}
            </span>
            {filtroNumeroPrecinto && (
              <button
                onClick={() => setFiltroNumeroPrecinto('')}
                className="text-rose-400 hover:text-rose-300 font-medium underline transition-colors"
              >
                Limpiar filtro
              </button>
            )}
          </div>
        </section>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-slate-800 border-t-cyan-500 animate-spin"></div>
            <p className="text-slate-400 text-xs tracking-wider animate-pulse">ESTABLECIENDO ENLACE SATELITAL...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-950/20 border border-rose-900/60 rounded-2xl p-6 text-center max-w-md mx-auto my-12">
            <h3 className="text-base font-semibold text-rose-300">Fallo de Enlace</h3>
            <p className="text-xs text-rose-400/80 mt-1.5">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-1.5 bg-rose-600/80 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
            
            {/* RENDERIZADO DEL MAPA (Radar Táctico Oscuro) */}
            <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative min-h-[420px] lg:min-h-[500px]">
              
              {/* Encabezado del radar */}
              <div className="p-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">Pantalla de Radar Satelital</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">COBERTURA: CM {nombreCM}</div>
              </div>

              {/* Contenedor del Radar */}
              <div className="flex-1 relative bg-slate-950 overflow-hidden flex items-center justify-center">
                {/* Cuadrícula táctica */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0b1329_1px,transparent_1px),linear-gradient(to_bottom,#0b1329_1px,transparent_1px)] bg-[size:35px_35px]"></div>
                
                {/* Anillos concéntricos de radar */}
                <div className="absolute w-[300px] h-[300px] rounded-full border border-cyan-500/5 pointer-events-none"></div>
                <div className="absolute w-[500px] h-[500px] rounded-full border border-cyan-500/5 pointer-events-none"></div>
                <div className="absolute w-[700px] h-[700px] rounded-full border border-cyan-500/3 pointer-events-none"></div>

                {/* Ciudades simuladas de fondo */}
                <div className="absolute left-[30%] top-[40%] text-slate-700 font-mono text-[9px] pointer-events-none select-none flex flex-col items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-850"></span>
                  <span>Córdoba Capital</span>
                </div>
                <div className="absolute left-[70%] top-[70%] text-slate-700 font-mono text-[9px] pointer-events-none select-none flex flex-col items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-850"></span>
                  <span>Villa María</span>
                </div>

                {/* Renderizar Marcadores de Bolsines */}
                {bolsinesFiltrados.map((bolsin) => {
                  const pos = obtenerPosicionRadar(bolsin.latitud, bolsin.longitud);
                  const seleccionado = bolsinSeleccionado?.numeroPrecinto === bolsin.numeroPrecinto;
                  const codigoStr = `BOL-${String(bolsin.numeroPrecinto).padStart(3, '0')}`;

                  return (
                    <button
                      key={bolsin.numeroPrecinto}
                      onClick={() => tomarSeleccionBolsin(bolsin)}
                      style={{ left: pos.left, top: pos.top }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
                    >
                      {/* Efecto Glow Satélite */}
                      <span className={`absolute -inset-2.5 rounded-full transition-all duration-300 ${
                        seleccionado 
                          ? 'bg-cyan-500/25 animate-ping' 
                          : 'bg-emerald-500/10 group-hover:bg-emerald-500/35 group-hover:animate-ping'
                      }`}></span>

                      {/* Marcador Táctico */}
                      <div className={`relative w-7 h-7 rounded-full flex items-center justify-center border shadow-xl transition-all transform ${
                        seleccionado
                          ? 'bg-cyan-500 border-white text-slate-955 scale-125 z-30 shadow-cyan-500/30'
                          : 'bg-slate-900 border-emerald-500 text-emerald-400 group-hover:scale-115 group-hover:bg-emerald-950 group-hover:border-emerald-300'
                      }`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>

                      {/* Tooltip con número de precinto */}
                      <span className={`absolute left-1/2 -translate-x-1/2 bottom-8 px-2 py-0.5 rounded text-[9px] font-bold font-mono border whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-40 ${
                        seleccionado
                          ? 'bg-slate-955 border-cyan-500/40 text-cyan-400'
                          : 'bg-slate-955 border-slate-800 text-slate-300'
                      }`}>
                        {codigoStr}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Leyenda y notas */}
              <div className="p-3 bg-slate-955/80 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 border border-emerald-400"></span>
                    En Tránsito (Enviado)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 border border-cyan-300"></span>
                    Bolsín Seleccionado
                  </span>
                </div>
                <span>Haz clic en un marcador para rastrear</span>
              </div>
            </div>

            {/* PANEL LATERAL: DETALLES Y LISTADO */}
            <div className="flex flex-col gap-6">
              
              {/* DETALLES DEL BOLSÍN SELECCIONADO */}
              <div className="bg-slate-900/10 border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-sm flex flex-col min-h-[220px] justify-between">
                {bolsinSeleccionado ? (
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-[10px] font-semibold tracking-wider uppercase">
                          {bolsinSeleccionado.estado}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">ID Precinto: #{bolsinSeleccionado.numeroPrecinto}</span>
                      </div>

                      <h3 className="text-xl font-black font-mono tracking-wider mt-2.5 text-white">
                        BOL-{String(bolsinSeleccionado.numeroPrecinto).padStart(3, '0')}
                      </h3>

                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex justify-between items-center border-b border-slate-900 py-1">
                          <span className="text-slate-500 font-medium">Comisión Origen:</span>
                          <span className="text-slate-300 font-semibold">{nombreCM}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-900 py-1">
                          <span className="text-slate-500 font-medium">Destino Est.:</span>
                          <span className="text-slate-300 font-semibold">
                            {bolsinSeleccionado.numeroPrecinto === 4 || bolsinSeleccionado.numeroPrecinto === 5 ? 'Río Cuarto' : 'Córdoba'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-900 py-1">
                          <span className="text-slate-500 font-medium">Coordenadas GPS:</span>
                          <span className="text-slate-300 font-mono">{bolsinSeleccionado.latitud}, {bolsinSeleccionado.longitud}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-500 font-medium">Última Lectura:</span>
                          <span className="text-slate-300 font-mono">{formatearFecha(bolsinSeleccionado.fechaHoraActualizacion)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      <button
                        onClick={() => setShowModal(true)}
                        className="w-full py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/10"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Notificar Ubicación
                      </button>

                      <a
                        href={`https://www.google.com/maps?q=${bolsinSeleccionado.latitud},${bolsinSeleccionado.longitud}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 bg-slate-955 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Ver en Google Maps
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <div className="w-10 h-10 rounded-xl bg-slate-955 flex items-center justify-center border border-slate-900 text-slate-600 mb-3">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-slate-400">Ningún Bolsín Seleccionado</p>
                    <p className="text-[10px] text-slate-650 mt-1 max-w-[200px] leading-relaxed">
                      Haz clic sobre un pin del mapa táctico para visualizar sus datos de seguimiento satelital.
                    </p>
                  </div>
                )}
              </div>

              {/* LISTADO DE BOLSINES FILTRADOS */}
              <div className="bg-slate-900/10 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col flex-1 shadow-2xl">
                <div className="p-3 bg-slate-955/60 border-b border-slate-800/80">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Bolsines Localizados ({bolsinesFiltrados.length})
                  </h3>
                </div>

                <div className="overflow-y-auto max-h-[200px] lg:max-h-none flex-1 divide-y divide-slate-900/60">
                  {bolsinesFiltrados.length > 0 ? (
                    bolsinesFiltrados.map((bolsin) => {
                      const seleccionado = bolsinSeleccionado?.numeroPrecinto === bolsin.numeroPrecinto;
                      const codigoStr = `BOL-${String(bolsin.numeroPrecinto).padStart(3, '0')}`;
                      const destinoSimulado = bolsin.numeroPrecinto === 4 || bolsin.numeroPrecinto === 5 ? 'Río Cuarto' : 'Córdoba';
                      
                      return (
                        <button
                          key={bolsin.numeroPrecinto}
                          onClick={() => {
                            setBolsinSeleccionado(bolsin);
                          }}
                          className={`w-full p-3 text-left flex items-center justify-between transition-colors outline-none focus:outline-none ${
                            seleccionado
                              ? 'bg-cyan-500/10 text-cyan-400'
                              : 'hover:bg-slate-900/40 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${seleccionado ? 'bg-cyan-400' : 'bg-emerald-500'}`}></span>
                            <div>
                              <span className="font-mono font-bold text-xs text-slate-200">
                                {codigoStr}
                              </span>
                              <div className="text-[9px] text-slate-500 mt-0.5 flex gap-1">
                                <span>Origen: {nombreCM}</span>
                                <span>•</span>
                                <span>Destino: {destinoSimulado}</span>
                              </div>
                            </div>
                          </div>

                          <svg className="w-3.5 h-3.5 text-slate-650" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-slate-605 text-xs">
                      Sin coincidencias para la búsqueda.
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
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)}
          ></div>

          <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-6 max-w-md w-full relative z-90 shadow-2xl transform scale-100 transition-all">
            
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-9 h-9 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-sm text-slate-200">Confirmar Envío de Correo</h4>
            </div>

            <div className="my-5 text-xs text-slate-400 leading-relaxed">
              <p>¿Desea enviar un correo electrónico al Gerente de la Comisión Médica destino para informar la ubicación del Bolsín Nº <strong className="text-cyan-400 font-mono text-[13px] bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded">{bolsinSeleccionado.numeroPrecinto}</strong>?</p>
              
              {/* Atributo de fecha/hora de la última actualización visualizado textualmente (DD/MM/AAAA HH:MM) */}
              <div className="mt-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-slate-500 font-medium">
                <span>Última actualización:</span>
                <span className="text-slate-350 font-mono">{formatearFecha(bolsinSeleccionado.fechaHoraActualizacion)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                disabled={sendingMail}
                onClick={() => setShowModal(false)}
                className="px-4 py-2 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <button
                disabled={sendingMail}
                onClick={tomarConfirmacionEnvioMail}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow shadow-cyan-500/10"
              >
                {sendingMail ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
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
