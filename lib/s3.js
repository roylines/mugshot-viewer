var Readable = require('stream').Readable,
  async = require('async'),
  _ = require('lodash'),
  AWS = require('aws-sdk');

var s3 = {};

s3.list = function() {
  var rs = new Readable;

  var nextMarker;
  var comma = '[';

  function get(cb) {
    var params = {
      Bucket: process.env.MUGBUCKET,
      Marker: nextMarker
    };
    return new AWS.S3().listObjects(params, function(e, things) {
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
  }

  function hasMarker() {
    return nextMarker != null;
  }

  function complete(e) {
    if (e) {
      console.error(e);
    }
    rs.push(']');
    rs.push(null);
  }

  async.doWhilst(get, hasMarker, complete);
  rs._read = _.noop;
  return rs;
}

module.exports = s3;