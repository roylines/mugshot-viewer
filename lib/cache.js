var s3 = require('./s3'),
  gm = require('gm').subClass({
    imageMagick: true
  }),
  reverse = require('fs-reverse'),
  es = require('event-stream'),
  path = require('path'),
  fs = require('fs');

var cache = {}

function fileLocation(name) {
  return path.join(__dirname, '..', 'cache', name);
}

function stream(name) {
  if (!fs.existsSync(name)) {
    return null;
  }

  console.log('using cache');
  return fs.createReadStream(name);
}

var keysFile = fileLocation('keys.csv');

cache.refresh = function() {
  var ws = fs.createWriteStream(keysFile);
  s3.keys()
    .pipe(es.split(','))
    .pipe(es.join('\n'))
    .pipe(ws);
}

cache.keys = function() {
  return reverse(keysFile);
};

cache.get = function(year, month, image, width) {
  var name = fileLocation(image);
  var imageStream = stream(name);
  if (!imageStream) {
    var ws = fs.createWriteStream(name);
    imageStream = s3.get(year, month, image);
    imageStream.pipe(ws);
  }

  return gm(imageStream, image)
    .resize(width)
    .autoOrient()
    .stream();
};

module.exports = cache;
