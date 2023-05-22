module.exports = {
  content: ['./src/routes/**/*.{svelte,js,ts}'],
  plugins: [require('daisyui')],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    }
  }
};
