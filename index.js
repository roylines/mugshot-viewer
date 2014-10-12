var
  http = require('http'),
  router = require('router'),
  route = router(),
  s3 = require('./lib/s3'),
  list = s3.list,
  get = s3.get,
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
  
  if(req.headers['if-modified-since']) {
    var dt = Date.parse(req.headers['if-modified-since']);
    console.log(dt);
    if(new Date().getTime() - dt < 360000) {
      console.log('using cache for data');
      res.writeHead(304);
      return res.end();
    }
  }

  return list()
    .pipe(res);
});

route.get('/image/:year/:month/:image', function(req, res) {
  if(req.headers['if-none-match'] === 'etag') {
    console.log('using cache:', req.params.image);
    res.writeHead(304);
    return res.end();
  }

  res.writeHead(200, {
    'Content-Type': 'image/jpeg',
    'Last-Modified': new Date().toString(),
    'Etag': 'etag' 
  });
  return get(req.params.year, req.params.month, req.params.image)
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

http
  .createServer(route)
  .listen(8000);
