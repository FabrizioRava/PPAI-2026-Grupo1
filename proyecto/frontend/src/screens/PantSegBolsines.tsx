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
    <div className="min-h-screen bg-[#f4f5f8] text-slate-800 flex flex-col font-sans antialiased selection:bg-brand-primary selection:text-white relative">
      
      {/* Sistema de Notificaciones Flotantes (Toast) */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-5 py-3.5 rounded-xl border shadow-2xl transition-all duration-300 transform translate-y-0 z-[100] flex items-center gap-3 max-w-md ${
          toast.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
          }`}>
            {toast.type === 'success' ? '✓' : '✗'}
          </div>
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* HEADER con el nombre de la CM del usuario */}
      <header className="bg-brand-bgMain text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Seguimiento de Bolsines
              </h1>
              <p className="text-xs text-brand-bgContainer/80 font-mono">PPAI 2026 • SEGUIMIENTO EN TIEMPO REAL</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-pulse"></span>
            <span className="text-xs text-brand-bgContainer/90 font-medium">Comisión Médica de Origen:</span>
            <span className="text-xs font-bold text-white bg-brand-secondary px-2.5 py-1.5 rounded-lg shadow-sm">
              {nombreCM || 'Villa María'}
            </span>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* BARRA DE BÚSQUEDA Y FILTRADO */}
        <section className="bg-brand-bgContainer border border-brand-bgMain/20 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:w-1/2 flex flex-col gap-1.5">
            <label htmlFor="search-input" className="text-xs font-bold text-brand-bgMain uppercase tracking-wider">
              Filtrar por Número de Precinto
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-bgMain/60">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search-input"
                type="text"
                placeholder="Ingresa número de precinto (ej. 001 o BOL-001)"
                value={filtroNumeroPrecinto}
                onChange={(e) => setFiltroNumeroPrecinto(e.target.value)}
                className="w-full bg-white border border-brand-bgMain/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-brand-bgMain placeholder-slate-400 focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary/50 transition-all"
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex items-center justify-end gap-3 self-end h-10 text-xs text-brand-bgMain">
            <span>
              Encontrados: <strong className="text-white bg-brand-bgMain px-2.5 py-0.5 rounded font-bold text-xs">{bolsinesFiltrados.length}</strong> / {bolsinesLocalizados.length}
            </span>
            {filtroNumeroPrecinto && (
              <button
                onClick={() => setFiltroNumeroPrecinto('')}
                className="text-brand-primary hover:text-brand-primary/80 font-bold underline transition-colors"
              >
                Limpiar filtro
              </button>
            )}
          </div>
        </section>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-brand-primary animate-spin"></div>
            <p className="text-slate-500 text-xs font-bold tracking-wider animate-pulse">ESTABLECIENDO ENLACE SATELITAL...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-md mx-auto my-12 shadow-sm">
            <h3 className="text-base font-bold text-rose-800">Fallo de Enlace</h3>
            <p className="text-xs text-rose-600 mt-1.5">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
            
            {/* RENDERIZADO DEL MAPA (Radar Táctico Corporativo) */}
            <div className="lg:col-span-2 bg-brand-bgContainer border border-brand-bgMain/20 rounded-2xl overflow-hidden flex flex-col shadow-sm relative min-h-[420px] lg:min-h-[500px]">
              
              {/* Encabezado del radar */}
              <div className="p-3.5 bg-brand-bgMain text-white border-b border-brand-bgContainer/30 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-pulse"></span>
                  <span className="text-xs font-bold tracking-wider text-slate-100 uppercase">Mapa Satelital de Seguimiento</span>
                </div>
                <div className="text-xs text-brand-bgContainer/80 font-mono">COBERTURA: CM {nombreCM}</div>
              </div>

              {/* Contenedor del Radar */}
              <div className="flex-1 relative bg-slate-50 overflow-hidden flex items-center justify-center">
                {/* Cuadrícula táctica */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8082A6_1px,transparent_1px),linear-gradient(to_bottom,#8082A6_1px,transparent_1px)] bg-[size:35px_35px] opacity-[0.08]"></div>
                
                {/* Anillos concéntricos de radar */}
                <div className="absolute w-[300px] h-[300px] rounded-full border border-brand-bgContainer/20 pointer-events-none"></div>
                <div className="absolute w-[500px] h-[500px] rounded-full border border-brand-bgContainer/15 pointer-events-none"></div>
                <div className="absolute w-[700px] h-[700px] rounded-full border border-brand-bgContainer/10 pointer-events-none"></div>

                {/* Ciudades simuladas de fondo */}
                <div className="absolute left-[30%] top-[40%] text-brand-bgMain/60 font-sans font-bold text-xs pointer-events-none select-none flex flex-col items-center">
                  <span className="w-2 h-2 rounded-full bg-brand-secondary"></span>
                  <span>Córdoba Capital</span>
                </div>
                <div className="absolute left-[70%] top-[70%] text-brand-bgMain/60 font-sans font-bold text-xs pointer-events-none select-none flex flex-col items-center">
                  <span className="w-2 h-2 rounded-full bg-brand-secondary"></span>
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
                          ? 'bg-brand-primary/25 animate-ping' 
                          : 'bg-brand-accent/20 group-hover:bg-brand-accent/40 group-hover:animate-ping'
                      }`}></span>

                      {/* Marcador Táctico */}
                      <div className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg transition-all transform ${
                        seleccionado
                          ? 'bg-brand-primary border-white text-white scale-125 z-30 shadow-brand-primary/45'
                          : 'bg-brand-accent border-white text-brand-bgMain font-bold group-hover:scale-115 group-hover:bg-brand-secondary group-hover:text-white'
                      }`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>

                      {/* Tooltip con número de precinto */}
                      <span className={`absolute left-1/2 -translate-x-1/2 bottom-9 px-2 py-0.5 rounded text-xs font-bold font-sans border whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-40 ${
                        seleccionado
                          ? 'bg-brand-bgMain border-brand-primary text-white'
                          : 'bg-white border-brand-bgContainer/40 text-brand-bgMain shadow-md'
                      }`}>
                        {codigoStr}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Leyenda y notas */}
              <div className="p-3.5 bg-slate-50 border-t border-brand-bgContainer/25 text-xs text-brand-bgMain/70 flex justify-between items-center z-10 font-medium">
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
              <div className="bg-brand-bgContainer border border-brand-bgMain/20 rounded-2xl p-5 shadow-sm flex flex-col min-h-[240px] justify-between">
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
                          <span className="text-brand-bgMain/80 font-semibold">Comisión Origen:</span>
                          <span className="text-brand-bgMain font-bold">{nombreCM}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-brand-bgMain/10 py-1.5">
                          <span className="text-brand-bgMain/80 font-semibold">Destino Est.:</span>
                          <span className="text-brand-bgMain font-bold">
                            {bolsinSeleccionado.numeroPrecinto === 4 || bolsinSeleccionado.numeroPrecinto === 5 ? 'Río Cuarto' : 'Córdoba'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-brand-bgMain/10 py-1.5">
                          <span className="text-brand-bgMain/80 font-semibold">Coordenadas GPS:</span>
                          <span className="text-brand-bgMain font-mono font-bold">{bolsinSeleccionado.latitud}, {bolsinSeleccionado.longitud}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-brand-bgMain/80 font-semibold">Última Lectura:</span>
                          <span className="text-brand-bgMain font-mono font-bold">{formatearFecha(bolsinSeleccionado.fechaHoraActualizacion)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-2">
                      <button
                        onClick={() => setShowModal(true)}
                        className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Notificar Ubicación
                      </button>

                      <a
                        href={`https://www.google.com/maps?q=${bolsinSeleccionado.latitud},${bolsinSeleccionado.longitud}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 bg-brand-bgMain hover:bg-brand-bgMain/90 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Ver en Google Maps
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <div className="w-12 h-12 rounded-2xl bg-brand-bgMain/10 flex items-center justify-center text-brand-bgMain mb-3">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-brand-bgMain">Ningún Bolsín Seleccionado</p>
                    <p className="text-xs text-brand-bgMain/70 mt-1 max-w-[200px] leading-relaxed">
                      Haz clic sobre un pin del mapa satelital para visualizar sus datos de seguimiento.
                    </p>
                  </div>
                )}
              </div>

              {/* LISTADO DE BOLSINES FILTRADOS */}
              <div className="bg-brand-bgContainer border border-brand-bgMain/20 rounded-2xl overflow-hidden flex flex-col flex-1 shadow-sm">
                <div className="p-3.5 bg-brand-bgMain text-white border-b border-brand-bgMain/20">
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Bolsines Localizados ({bolsinesFiltrados.length})
                  </h3>
                </div>

                <div className="overflow-y-auto max-h-[220px] lg:max-h-none flex-1 divide-y divide-brand-bgMain/10">
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
                          className={`w-full p-3.5 text-left flex items-center justify-between transition-colors outline-none focus:outline-none ${
                            seleccionado
                              ? 'bg-brand-bgMain text-white border-l-4 border-brand-primary pl-2.5 shadow-inner'
                              : 'hover:bg-white/10 text-brand-bgMain'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full ${seleccionado ? 'bg-brand-accent animate-pulse' : 'bg-brand-bgMain/40'}`}></span>
                            <div>
                              <span className={`font-sans font-bold text-xs ${seleccionado ? 'text-white' : 'text-brand-bgMain'}`}>
                                {codigoStr}
                              </span>
                              <div className={`text-xs mt-0.5 flex gap-1 ${seleccionado ? 'text-white/75' : 'text-brand-bgMain/70'}`}>
                                <span>Orig: {nombreCM}</span>
                                <span>•</span>
                                <span>Dest: {destinoSimulado}</span>
                              </div>
                            </div>
                          </div>

                          <svg className={`w-4 h-4 transition-transform ${seleccionado ? 'text-white translate-x-0.5' : 'text-brand-bgMain/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-brand-bgMain/60 text-xs">
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
            className="absolute inset-0 bg-brand-bgMain/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)}
          ></div>

          <div className="bg-brand-bgContainer border border-brand-bgMain/20 rounded-3xl p-6 max-w-md w-full relative z-90 shadow-2xl transform scale-100 transition-all">
            
            <div className="flex items-center gap-3 border-b border-brand-bgMain/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-bgMain/10 flex items-center justify-center text-brand-primary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-sm text-brand-bgMain">Confirmar Envío de Correo</h4>
            </div>

            <div className="my-5 text-xs text-brand-bgMain/90 leading-relaxed">
              <p>
                ¿Desea enviar un correo electrónico al Gerente de la Comisión Médica destino para informar la ubicación del Bolsín Nº{' '}
                <strong className="text-brand-primary font-bold text-xs bg-brand-bgMain/10 border border-brand-primary/20 px-1.5 py-0.5 rounded">
                  BOL-{String(bolsinSeleccionado.numeroPrecinto).padStart(3, '0')}
                </strong>?
              </p>
              
              {/* Atributo de fecha/hora de la última actualización visualizado textualmente (DD/MM/AAAA HH:MM) */}
              <div className="mt-4 bg-slate-50 border border-brand-bgMain/15 rounded-xl p-3 flex items-center justify-between text-brand-bgMain/80 font-medium">
                <span>Última actualización:</span>
                <span className="text-brand-bgMain font-mono font-bold">{formatearFecha(bolsinSeleccionado.fechaHoraActualizacion)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-bgMain/10">
              <button
                disabled={sendingMail}
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-brand-bgMain hover:bg-brand-bgMain/90 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <button
                disabled={sendingMail}
                onClick={tomarConfirmacionEnvioMail}
                className="px-5 py-2 bg-brand-primary hover:bg-brand-primary/90 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {sendingMail ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
