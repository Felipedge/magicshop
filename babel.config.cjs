// Babel solo se usa para las pruebas (Karma + webpack). Vite compila la app por su cuenta.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { chrome: '120' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  env: {
    test: {
      // Instrumenta el código fuente (no las pruebas) para medir la cobertura.
      plugins: [['istanbul', { exclude: ['**/*.spec.js', '**/*.spec.jsx', 'src/test/**'] }]],
    },
  },
};
