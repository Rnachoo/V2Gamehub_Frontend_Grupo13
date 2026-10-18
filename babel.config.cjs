// Solo lo usa babel-loader dentro de Karma; istanbul instrumenta el código para la cobertura
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: 'defaults' }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ],
  plugins: ['istanbul']
}
