/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // Include all your JSX and TSX files
    "./public/index.html",          // Include the HTML file for production builds
  ],
  theme: {
    extend: {
      colors: {
        ecoGreen: '#2d6a4f',       // Deep, natural green
        ecoLightGreen: '#95d5b2',  // Light green
        ecoBlue: '#118ab2',        // Crisp blue
        ecoLightBlue: '#a8dadc',   // Pale blue
        ecoBrown: '#bc6c25',       // Warm brown accent
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],  // Add Roboto as the primary font
      },
    },
  },
  plugins: [],
}
