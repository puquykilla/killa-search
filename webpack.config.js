var path = require('path');
var combineLoaders = require('webpack-combine-loaders');
var entryPath = path.join(__dirname, 'src'),
    outPath = path.join(__dirname, 'dist');

module.exports = {
  entry: [ path.join(entryPath, 'app.js') ],
  output: {
    path: outPath,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: entryPath,
        exclude: /node_modules/,
        loaders: ['babel']
      },
      {
        test: /\.css$/,
        loader: combineLoaders([
          {
            loader: 'style-loader'
          }, {
            loader: 'css-loader',
            query: {
              modules: true,
              localIdentName: '[name]__[local]___[hash:base64:5]'
            }
          }
        ])
      }
    ]
  },
  devServer: {
    contentBase: outPath,
    port: 3000
  }
}
