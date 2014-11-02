var
  http = require('http'),
  router = require('router'),
  route = router(),
  cache = require('./lib/cache'),
  dots = require('./lib/dots'),
  list = cache.list,
  get = cache.get,
  keys = cache.keys,
  aggregate = require('./lib/aggregate'),
  url = require('url'),
  static = require('./lib/static');

function setContentType(res, contentType) {
  res.writeHead(200, {
    "Content-Type": contentType
  });
}

route.get('/images', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Last-Modified': new Date().toString()
  });

  if (req.headers['if-modified-since']) {
    var dt = Date.parse(req.headers['if-modified-since']);
    if (new Date().getTime() - dt < 60 * 1000 * 1000) {
      console.log('using cache for data');
      res.writeHead(304);
      return res.end();
    }
  }
  return keys()
    .pipe(aggregate.each())
    .pipe(res);
});

route.post('/images/refresh', function(req, res) {
  cache.refresh();
  return res.end();
});

route.get('/months', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Last-Modified': new Date().toString()
  });

  return cache.keys()
    .pipe(aggregate.month())
    .pipe(res);
});

route.get('/image/:year/:month/:image', function(req, res) {
  var width = +(url.parse(req.url, true).query.width || 50);
  if (req.headers['if-none-match'] === ('etag:w' + width)) {
    console.log('using cache:', req.params.image);
    res.writeHead(304);
    return res.end();
  }

  console.log('downloading:', req.params.image);

  res.writeHead(200, {
    'Content-Type': 'image/jpeg',
    'Last-Modified': new Date().toString(),
    'Etag': 'etag:w' + width
  });
  return cache
    .get(req.params.year, req.params.month, req.params.image, width)
    .pipe(res);
});

route.get('/', function(req, res) {
  setContentType(res, 'text/html');
  return static('index.html').pipe(res);
});

route.get('/index.js', function(req, res) {
  setContentType(res, 'application/x-javascript');
  return static('index.js').pipe(res);
});

route.get('/index.css', function(req, res) {
  setContentType(res, 'text/css');
  return static('index.css').pipe(res);
});

http
  .createServer(route)
  .listen(8000);
