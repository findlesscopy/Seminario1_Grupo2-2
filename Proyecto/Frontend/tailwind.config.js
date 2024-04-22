/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary100': '#0D6E6E',
        'primary200': '#4a9d9c',
        'primary300': '#afffff',
        'accent100': '#FF3D3D',
        'accent200': '#ffe0c8',
        'text100': '#FFFFFF',
        'text200': '#e0e0e0',
        'bg100': '#0D1F2D',
        'bg200': '#1d2e3d',
        'bg300': '#354656',
      }
    },
  },
  plugins: [],
}
