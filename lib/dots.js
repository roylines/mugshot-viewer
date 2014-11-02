var through2 = require('through2');

module.export = through2(function(c, e, done) {
  return done(null, '.');
});
