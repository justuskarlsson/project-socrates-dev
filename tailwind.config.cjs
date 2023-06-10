const colors = require('tailwindcss/colors')
module.exports = {
  content: [
    './src/routes/**/*.{svelte, js, ts}',
    './src/lib/**/*.{svelte, js, ts}',
  ],
  plugins: [require('daisyui')],
  theme: {
    extend: {
      colors: {
        primary: colors.amber[100],
        parchment: "#fefcaf"
      },
      animation: {
        'spin-slow': 'spin 3s ease-in-out infinite',
        'spin': 'spin 2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite',
      },
    },
    container: {
      center: true,
    }
  }
};
