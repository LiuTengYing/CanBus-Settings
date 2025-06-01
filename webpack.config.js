const config = require('flarum-webpack-config');

module.exports = config({
  entries: {
    admin: './js/admin.js',
    forum: './js/forum.js',
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
        ],
      },
    ],
  },
});