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
      }
    },
    container: {
      center: true,
    }
  }
};
