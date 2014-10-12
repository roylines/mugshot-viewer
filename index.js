var
  http = require('http'),
  router = require('router'),
  route = router(),
  s3 = require('./lib/s3');

route.get('/images', function(req, res) {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  return s3.list().pipe(res);
});

http
  .createServer(route)
  .listen(8000);
