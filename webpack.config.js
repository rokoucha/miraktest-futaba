const { createHash } = require('crypto')
const { ESBuildMinifyPlugin } = require('esbuild-loader')
const { LicenseWebpackPlugin } = require('license-webpack-plugin')
const { resolve } = require('path')
const esm = require('@purtuga/esm-webpack-plugin')

const isProduction = false

module.exports = {
  entry: {
    'miraktest-futaba.plugin': './src',
  },
  mode: isProduction ? 'production' : 'development',
  output: {
    path: resolve(__dirname, 'dist'),
    library: `P${createHash('sha1').update('./src').digest('hex')}`,
    libraryTarget: 'var',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx',
          target: 'es2018',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  plugins: [
    new esm(),
    new LicenseWebpackPlugin({
      addBanner: true,
      renderBanner: (_, modules) => {
        return `/* miraktest-futaba\n${modules.map(
          (module) => `\n${module.name}\n${module.licenseText}\n`,
        )} */\n`
      },
    }),
  ],
  optimization: {
    splitChunks: false,
    minimizer: [new ESBuildMinifyPlugin({ target: 'es2018' })],
  },
  // ホストがグローバルに露出しているRecoil/Reactを用いる
  externals: {
    react: 'root React',
    recoil: 'root Recoil',
  },
}
