const config = require('flarum-webpack-config');

module.exports = config({
  entries: {
    admin: './js/src/admin/index.js',
    forum: './js/src/forum/index.js',
  }
});