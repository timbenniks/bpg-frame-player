var webpack = require( 'webpack' ),
    path = require( 'path' ),
    UglifyJsPlugin = webpack.optimize.UglifyJsPlugin,
    CopyWebpackPlugin = require( 'copy-webpack-plugin' ),
    env = process.env.WEBPACK_ENV,
    libraryName = 'BPGFramePlayer',
    plugins = [ new CopyWebpackPlugin( [ { from: __dirname + '/src/bpgdecoder.js' } ] ) ],
    outputFile;

if( env === 'build' ){
  plugins.push( new UglifyJsPlugin( { minimize: true } ) );
  outputFile = libraryName + '.min.js';
}
else {
  outputFile = libraryName + '.js';
}

var config = {
  entry: __dirname + '/src/index.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/lib',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [{
      test: /(\.jsx|\.js)$/,
      loader: 'babel',
      exclude: /(node_modules|bower_components)/
    }/*,{
      test: /(\.jsx|\.js)$/,
      loader: "eslint-loader",
      exclude: /node_modules/
    }*/]
  },
  resolve: {
    root: path.resolve('./src'),
    extensions: ['', '.js']
  },
  plugins: plugins
};

module.exports = config;
