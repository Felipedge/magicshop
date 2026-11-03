// Configuración del entorno de pruebas: Karma ejecuta las pruebas Jasmine en Chrome Headless.
// webpack + babel transforman el JSX, y babel-plugin-istanbul mide la cobertura.
process.env.BABEL_ENV = 'test';

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'webpack'],

    files: [
      'src/test/setup.js',
      { pattern: 'src/**/*.spec.js', watched: false },
      { pattern: 'src/**/*.spec.jsx', watched: false },
      // Imágenes públicas (logo, carrusel) servidas igual que en Vite
      { pattern: 'public/img/**', included: false, served: true, watched: false },
    ],

    proxies: {
      '/img/': '/base/public/img/',
    },

    preprocessors: {
      'src/test/setup.js': ['webpack'],
      'src/**/*.spec.js': ['webpack'],
      'src/**/*.spec.jsx': ['webpack'],
    },

    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: { extensions: ['.js', '.jsx'] },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: 'babel-loader',
            // package.json usa "type": "module"; permite imports sin extensión (igual que Vite)
            resolve: { fullySpecified: false },
          },
        ],
      },
    },

    reporters: ['spec', 'kjhtml', 'coverage'],

    coverageReporter: {
      dir: 'coverage',
      subdir: '.',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'lcovonly', subdir: '.' },
        { type: 'text-summary' },
        { type: 'text', file: 'coverage.txt' },
      ],
    },

    client: {
      jasmine: { random: false },
      clearContext: false, // deja visible el reporte HTML de Jasmine en el navegador
    },

    browsers: ['ChromeHeadless'],
    singleRun: false,
  });
};
