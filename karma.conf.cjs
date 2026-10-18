module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', 'webpack'],

    files: [
      { pattern: 'src/**/*.spec.@(js|jsx)', watched: false }
    ],

    preprocessors: {
      'src/**/*.spec.@(js|jsx)': ['webpack']
    },

    // Webpack solo corre dentro de Karma; la app se sigue ejecutando con Vite
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: 'babel-loader'
          }
        ]
      },
      resolve: {
        extensions: ['.js', '.jsx']
      }
    },

    reporters: ['progress', 'coverage'],

    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'text-summary' }
      ]
    },

    browsers: ['ChromeHeadless'],
    singleRun: true
  })
}
