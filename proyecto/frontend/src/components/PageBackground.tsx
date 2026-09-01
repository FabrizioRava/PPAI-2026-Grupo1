// Lenguaje glassmorphism compartido por las pantallas de la app (panel de vidrio esmerilado).
export const glassPanel =
  'bg-white/55 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(68,51,79,0.12)] ring-1 ring-brand-bgMain/5';

// Fondo compartido: gradiente base + blobs de color difuminados, usado en Login, MenuPrincipal y PantSegBolsines.
export const PageBackground = () => (
  <>
    <div
      className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-[#fbe7df] via-[#f4eef3] to-[#efe7f0]"
      aria-hidden="true"
    />
    <div
      className="pointer-events-none fixed -top-32 -left-24 -z-10 w-[28rem] h-[28rem] rounded-full bg-brand-primary/25 blur-3xl"
      aria-hidden="true"
    />
    <div
      className="pointer-events-none fixed top-1/3 -right-28 -z-10 w-[30rem] h-[30rem] rounded-full bg-brand-secondary/20 blur-3xl"
      aria-hidden="true"
    />
    <div
      className="pointer-events-none fixed -bottom-40 left-1/3 -z-10 w-[26rem] h-[26rem] rounded-full bg-brand-bgMain/15 blur-3xl"
      aria-hidden="true"
    />
  </>
);
