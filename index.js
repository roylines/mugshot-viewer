var
  async = require('async'),
  _ = require('lodash'),
  http = require('http'),
  router = require('router'),
  route = router(),
  Readable = require('stream').Readable,
  AWS = require('aws-sdk');

function s3() {
  return new AWS.S3();
}

function listObjects() {
  var rs = new Readable;
  rs._read = function() {};

  var nextMarker;
  var comma = '[';

  async.doWhilst(function(cb) {
    var params = {
      Bucket: process.env.MUGBUCKET,
      Marker: nextMarker
    };
    return s3().listObjects(params, function(e, things) {
      if (e) {
        return cb(e);
      }
      _.forEach(things.Contents, function(thing) {
        rs.push(comma + "{key:'" + thing.Key + "'}");
        comma = ',';
      });
      nextMarker = things.NextMarker;
      return cb();
    });
    return cb();
  }, function() {
    return nextMarker != null;
  }, function(e) {
    if (e) {
      console.error(e);
    }
    rs.push(']');
    rs.push(null);
  });

  return rs;
}

route.get('/images', function(req, res) {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  return listObjects().pipe(res);
});

http
  .createServer(route)
  .listen(8000);
