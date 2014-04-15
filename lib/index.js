
var basename = require('path').basename;
var debug = require('debug')('metalsmith-encode-html');
var dirname = require('path').dirname;
var extname = require('path').extname;
var ent = require('ent');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Metalsmith plugin to encode html entities in html files.
 *
 * @param {Object} options (optional)
 *   @property {Array} keys
 * @return {Function}
 */

function plugin(options){
  options = options || {};
  var keys = options.keys || [];

  return function(files, metalsmith, done){
    setImmediate(done);
    Object.keys(files).forEach(function(file){
      debug('checking file: %s', file);
      if (!isHtml(file)) return;
      var data = files[file];
      var dir = dirname(file);
      var html = basename(file, extname(file)) + '.html';
      if ('.' != dir) html = dir + '/' + html;

      debug('Encoding html entities in file: %s', file);
      
      var reg = /\`\`\`([\s\S]+?)\`\`\`/gi;
      var rep = function(match, group) {
        if (group) {
          return ent.encode(group, {named: true});
        }
        else {
          return "";
        }
      };
      var encoded = data.contents.toString().replace(reg, rep);
      data.contents = new Buffer(encoded);
      
      keys.forEach(function(key) {
        data[key] = data[key].replace(reg, rep);
      });

      delete files[file];
      files[html] = data;
    });
  };
}

/**
 * Check if a `file` is html.
 *
 * @param {String} file
 * @return {Boolean}
 */

function isHtml(file){
  return /\.html|\.htm/.test(extname(file));
}