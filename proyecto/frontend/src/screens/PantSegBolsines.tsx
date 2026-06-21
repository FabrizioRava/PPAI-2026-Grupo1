import React, { useState, useEffect } from 'react';
import { MapaBolsines } from '../components/MapaBolsines';
import { UsuarioDTO, obtenerBolsinesActivos, notificarUbicacionBolsin } from '../api';

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

  // 1. Al montarse, llamamos al método centralizado de api.ts
  useEffect(() => {
    const cargarBolsines = async () => {
      try {
        setLoading(true);
        // 🛠️ Cambiado: Ahora usa la función protegida con authHeaders integrados
        const data = await obtenerBolsinesActivos();

        setNombreCM(data.nombreCM);
        setBolsinesLocalizados(data.bolsines);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'No se pudo establecer conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    cargarBolsines();
  }, []);

  // Método: tomarSeleccionBolsin(bolsin) - Paso 7 del diagrama de secuencia
  const tomarSeleccionBolsin = (bolsin: Bolsin) => {
    setBolsinSeleccionado(bolsin);
  };

  // Método: tomarConfirmacionEnvioMail() - Paso 9 del diagrama de secuencia
  const tomarConfirmacionEnvioMail = async () => {
    if (!bolsinSeleccionado) return;

    try {
      setSendingMail(true);
      
      // 🛠️ Cambiado: Usa el POST tipado y encapsulado de tu capa API
      const data = await notificarUbicacionBolsin(bolsinSeleccionado.numeroPrecinto);

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

  const cmDestinosDisponibles = Array.from(
    new Set(bolsinesLocalizados.map((b) => b.cmDestinoNombre))
  ).sort((a, b) => a.localeCompare(b));

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
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-[#fbe7df] via-[#f4eef3] to-[#efe7f0]" aria-hidden="true" />
      <div className="pointer-events-none fixed -top-32 -left-24 -z-10 w-[28rem] h-[28rem] rounded-full bg-brand-primary/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none fixed top-1/3 -right-28 -z-10 w-[30rem] h-[30rem] rounded-full bg-brand-secondary/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none fixed -bottom-40 left-1/3 -z-10 w-[26rem] h-[26rem] rounded-full bg-brand-bgMain/15 blur-3xl" aria-hidden="true" />

      {toast && (
        <div role="status" aria-live="polite" className={`fixed bottom-5 right-5 px-5 py-3.5 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all duration-300 z-[100] flex items-center gap-3 max-w-md ${toast.type === 'success' ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900' : 'bg-rose-50/80 border-rose-200/80 text-rose-900'}`}>
          <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
            {toast.type === 'success' ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      <header className={`sticky top-0 z-50 ${glassPanel} border-x-0 border-t-0 rounded-none`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onVolver && (
              <button onClick={onVolver} aria-label="Volver al menú principal" className="w-9 h-9 -ml-1 shrink-0 rounded-xl flex items-center justify-center text-brand-bgMain hover:bg-brand-bgMain/10 transition-colors focus:outline-none">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-brand-bgMain">Seguimiento de Bolsines</h1>
              <p className="text-xs text-brand-bgMain/60 font-mono">PPAI 2026 • SEGUIMIENTO EN TIEMPO REAL</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 motion-safe:animate-pulse"></span>
            <span className="text-xs font-bold text-white bg-gradient-to-tr from-brand-primary to-brand-secondary px-2.5 py-1.5 rounded-lg shadow-sm">{nombreCM}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <section className={`${glassPanel} rounded-2xl p-5 flex flex-col gap-4`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2 flex flex-col gap-1.5">
              <label htmlFor="search-input" className="text-xs font-bold text-brand-bgMain uppercase tracking-wider">Filtrar por Número de Precinto</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-bgMain/50"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                <input id="search-input" type="text" placeholder="Ingresa número de precinto (ej. 4501)" value={filtroNumeroPrecinto} onChange={(e) => setFiltroNumeroPrecinto(e.target.value)} className="w-full bg-white/70 border border-white/70 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary/40" />
              </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col gap-1.5">
              <label htmlFor="filtro-destino" className="text-xs font-bold text-brand-bgMain uppercase tracking-wider">Filtrar por CM Destino</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-bgMain/50"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg></div>
                <select id="filtro-destino" value={filtroCMDestino} onChange={(e) => setFiltroCMDestino(e.target.value)} className="w-full appearance-none bg-white/70 border border-white/70 rounded-xl py-2.5 pl-10 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 cursor-pointer">
                  <option value="">Todas las comisiones destino</option>
                  {cmDestinosDisponibles.map((cm) => <option key={cm} value={cm}>{cm}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 text-xs text-brand-bgMain">
            <span>Encontrados: <strong className="text-white bg-brand-bgMain px-2.5 py-0.5 rounded font-bold">{bolsinesFiltrados.length}</strong> / {bolsinesLocalizados.length}</span>
            {hayFiltroActivo && <button onClick={limpiarFiltros} className="text-brand-primary font-bold underline">Limpiar filtros</button>}
          </div>
        </section>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-brand-bgMain/15 border-t-brand-primary motion-safe:animate-spin"></div>
            <p className="text-brand-bgMain/60 text-xs font-bold tracking-wider">CARGANDO UBICACIONES...</p>
          </div>
        ) : error ? (
          <div className={`${glassPanel} rounded-2xl p-6 text-center max-w-md mx-auto my-12`}>
            <h3 className="text-base font-bold text-rose-800">Error de Conexión</h3>
            <p className="text-xs text-rose-600 mt-1.5">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg text-xs font-bold">Reintentar</button>
          </div>
        ) : bolsinesLocalizados.length === 0 ? (
          <div className={`${glassPanel} rounded-2xl p-8 text-center max-w-md mx-auto my-12`}>
            <h3 className="text-base font-bold text-brand-bgMain">Sin bolsines en tránsito</h3>
            <p className="text-xs text-brand-bgMain/70 mt-2">No se encontraron bolsines en estado <strong>Enviado</strong> para la Comisión Médica <strong>{nombreCM}</strong>.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
            <div className={`lg:col-span-2 ${glassPanel} rounded-2xl overflow-hidden flex flex-col relative min-h-[420px]`}>
              <div className="flex-1 relative overflow-hidden">
                <MapaBolsines bolsines={bolsinesFiltrados} bolsinSeleccionado={bolsinSeleccionado} onSeleccionarBolsin={tomarSeleccionBolsin} />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className={`${glassPanel} rounded-2xl p-5 flex flex-col min-h-[240px] justify-between`}>
                {bolsinSeleccionado ? (
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded bg-brand-accent text-brand-bgMain text-xs font-bold tracking-wider uppercase shadow-sm">{bolsinSeleccionado.estado}</span>
                        <span className="text-xs font-bold text-brand-bgMain">ID: #{bolsinSeleccionado.numeroPrecinto}</span>
                      </div>
                      <h3 className="text-xl font-bold tracking-wider mt-2.5 text-brand-bgMain">BOL-{String(bolsinSeleccionado.numeroPrecinto).padStart(3, '0')}</h3>
                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex justify-between items-center border-b border-brand-bgMain/10 py-1.5"><span className="text-brand-bgMain/70 font-semibold">CM Destino:</span><span className="text-brand-bgMain font-bold">{bolsinSeleccionado.cmDestinoNombre}</span></div>
                        <div className="flex justify-between items-center py-1.5"><span className="text-brand-bgMain/70 font-semibold">Última Lectura:</span><span className="text-brand-bgMain font-mono font-bold">{formatearFecha(bolsinSeleccionado.fechaHoraActualizacion)}</span></div>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-col gap-2">
                      <button onClick={() => setShowModal(true)} className="w-full py-2.5 bg-brand-primary text-white font-bold rounded-xl text-xs shadow-md">Notificar Ubicación</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <p className="text-xs font-bold text-brand-bgMain">Ningún Bolsín Seleccionado</p>
                    <p className="text-xs text-brand-bgMain/70 mt-1 max-w-[200px]">Haz clic sobre un pin del mapa para ver los datos.</p>
                  </div>
                )}
              </div>

              <div className={`${glassPanel} rounded-2xl overflow-hidden flex flex-col flex-1`}>
                <div className="p-3.5 border-b border-white/50"><h3 className="text-xs font-bold uppercase tracking-wider text-brand-bgMain">Bolsines Localizados ({bolsinesFiltrados.length})</h3></div>
                <div className="overflow-y-auto max-h-[220px] lg:max-h-none flex-1 divide-y divide-brand-bgMain/10">
                  {bolsinesFiltrados.length > 0 ? (
                    bolsinesFiltrados.map((bolsin) => {
                      const seleccionado = bolsinSeleccionado?.numeroPrecinto === bolsin.numeroPrecinto;
                      return (
                        <button key={bolsin.numeroPrecinto} onClick={() => setBolsinSeleccionado(bolsin)} className={`w-full p-3.5 text-left flex items-center justify-between outline-none ${seleccionado ? 'bg-brand-bgMain text-white border-l-4 border-brand-primary pl-2.5' : 'hover:bg-white/40 text-brand-bgMain'}`}>
                          <div>
                            <span className="font-bold text-xs">BOL-{String(bolsin.numeroPrecinto).padStart(3, '0')}</span>
                            <div className="text-xs mt-0.5 text-brand-bgMain/65">Dest: {bolsin.cmDestinoNombre}</div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-brand-bgMain/55 text-xs">No se encontraron bolsines.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE CONFIRMACIÓN (Pasos 8 y 9) */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className={`${glassPanel} w-full max-w-sm rounded-2xl p-6 shadow-2xl`}>
            <h3 className="text-lg font-bold text-brand-bgMain">¿Confirmar Notificación?</h3>
            <p className="text-xs text-brand-bgMain/70 mt-2 leading-relaxed">
              Se registrará la ubicación actual del bolsín y se enviará una alerta automática al Gerente de la Comisión Médica Destino.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button onClick={() => setShowModal(false)} disabled={sendingMail} className="px-3.5 py-2 bg-brand-bgMain/10 text-brand-bgMain rounded-xl text-xs font-bold hover:bg-brand-bgMain/20">
                Cancelar
              </button>
              <button onClick={tomarConfirmacionEnvioMail} disabled={sendingMail} className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-primary/90 flex items-center gap-1.5 shadow-sm">
                {sendingMail ? 'Enviando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};