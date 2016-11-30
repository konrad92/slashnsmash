
let path = require('path');

module.exports = {
  entry: "./src/entry",
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/build/",
    filename: "bundle.js"
  },
  resolve: {
    modules: [
      "node_modules",
      path.resolve(__dirname, "src")
    ]
  },
  devtool: "inline-source-map",
  devServer: {
    contentBase: path.resolve(__dirname, "public"),
    compress: true,
    host: "0.0.0.0",
    port: 8080
  }
};
