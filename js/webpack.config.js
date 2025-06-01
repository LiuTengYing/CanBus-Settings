const config = require('flarum-webpack-config');

module.exports = config({
  entries: {
    admin: './src/admin/index.js',
    forum: './src/forum/index.js',
  }
});