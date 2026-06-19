/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#F24F13',     // Color Primario (Énfasis/Alertas): Naranja rojizo potente
          secondary: '#F2921D',   // Color Secundario (Acciones/Destacados): Naranja
          accent: '#F2C230',      // Color de Acento: Amarillo vibrante (pines de bolsines en estado enviado)
          bgContainer: '#ffffff', // Color de Fondo Claro/Contenedores: Azul/Grisáceo suave
          bgMain: '#44334F',      // Color de Fondo Principal/Textos Fuertes: Berenjena oscuro
        }
      },
      fontFamily: {
        sans: ['Neutiva', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
