var path = require('path'),
  fs = require('fs');

module.exports = function(page) {
  return fs
    .createReadStream(path.join(__dirname,'..', 'static', page))
}
