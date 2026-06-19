import React from 'react';

// Lenguaje glassmorphism compartido con el resto de la app (panel de vidrio esmerilado)
const glassPanel =
  'bg-white/55 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(68,51,79,0.12)] ring-1 ring-brand-bgMain/5';

export interface MenuPrincipalProps {
  // Paso 1 del diagrama: EB selecciona la opción "Consultar ubicación de bolsines"
  // -> dispara opConsultarUbicBolsines() y habilita la ventana de seguimiento.
  onConsultarUbicacionBolsines: () => void;
}

interface OpcionMenu {
  titulo: string;
  descripcion: string;
  disponible: boolean;
  onClick?: () => void;
  icono: React.ReactNode;
}

export const MenuPrincipal: React.FC<MenuPrincipalProps> = ({ onConsultarUbicacionBolsines }) => {
  const opciones: OpcionMenu[] = [
    {
      titulo: 'Consultar ubicación de bolsines',
      descripcion: 'Visualizá sobre el mapa la posición en tiempo real de los bolsines enviados desde tu Comisión Médica.',
      disponible: true,
      onClick: onConsultarUbicacionBolsines,
      icono: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      titulo: 'Registrar cambio de estado',
      descripcion: 'Actualizá el estado de un bolsín (Enviado, Entregado, Recibido).',
      disponible: false,
      icono: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      titulo: 'Reportes de seguimiento',
      descripcion: 'Generá reportes históricos de envíos y entregas.',
      disponible: false,
      icono: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative min-h-dvh flex flex-col font-sans antialiased text-brand-bgMain selection:bg-brand-primary selection:text-white overflow-hidden">

      {/* FONDO: gradiente base + blobs de color difuminados (consistente con el seguimiento) */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-[#fbe7df] via-[#f4eef3] to-[#efe7f0]" aria-hidden="true" />
      <div className="pointer-events-none fixed -top-32 -left-24 -z-10 w-[28rem] h-[28rem] rounded-full bg-brand-primary/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none fixed top-1/3 -right-28 -z-10 w-[30rem] h-[30rem] rounded-full bg-brand-secondary/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none fixed -bottom-40 left-1/3 -z-10 w-[26rem] h-[26rem] rounded-full bg-brand-bgMain/15 blur-3xl" aria-hidden="true" />

      {/* HEADER */}
      <header className={`sticky top-0 z-50 ${glassPanel} border-x-0 border-t-0 rounded-none`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-brand-bgMain">Gestión de Bolsines</h1>
              <p className="text-xs text-brand-bgMain/60 font-mono">PPAI 2026 • MENÚ PRINCIPAL</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 motion-safe:animate-pulse shadow-sm shadow-emerald-500/50"></span>
            <span className="hidden sm:inline text-xs text-brand-bgMain/70 font-medium">Sesión activa</span>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">

        <section className="mt-4">
          <h2 className="text-2xl font-bold tracking-tight text-brand-bgMain">¿Qué querés hacer?</h2>
          <p className="text-sm text-brand-bgMain/65 mt-1">Seleccioná una opción para comenzar.</p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {opciones.map((opcion) => {
            const contenido = (
              <>
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
                    opcion.disponible
                      ? 'bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-brand-primary/30'
                      : 'bg-brand-bgMain/10 text-brand-bgMain/50'
                  }`}
                >
                  {opcion.icono}
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-brand-bgMain">{opcion.titulo}</h3>
                    {!opcion.disponible && (
                      <span className="text-[0.625rem] font-bold uppercase tracking-wider bg-brand-bgMain/10 text-brand-bgMain/60 px-2 py-0.5 rounded-full">
                        Próximamente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-bgMain/65 mt-1.5 leading-relaxed">{opcion.descripcion}</p>
                </div>
                {opcion.disponible && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                    Ingresar
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </>
            );

            if (!opcion.disponible) {
              return (
                <div
                  key={opcion.titulo}
                  aria-disabled="true"
                  className={`${glassPanel} rounded-2xl p-5 flex flex-col opacity-60 cursor-not-allowed select-none`}
                >
                  {contenido}
                </div>
              );
            }

            return (
              <button
                key={opcion.titulo}
                onClick={opcion.onClick}
                className={`${glassPanel} group rounded-2xl p-5 flex flex-col text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(242,79,19,0.18)] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white/40`}
              >
                {contenido}
              </button>
            );
          })}
        </section>
      </main>

      <footer className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs text-brand-bgMain/45">
        PPAI 2026 · Grupo 1 · CU36 Seguimiento de Bolsines
      </footer>
    </div>
  );
};
