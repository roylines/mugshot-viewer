var Readable = require('stream').Readable,
  async = require('async'),
  _ = require('lodash'),
  key = require('./key'),
  AWS = require('aws-sdk');

var s3 = {};

var bucket = process.env.MUGBUCKET + '.photos';

s3.keys = function() {

  var rs = new Readable;

  var nextMarker;
  var comma = '';

  function get(cb) {
    var params = {
      Bucket: bucket,
      Marker: nextMarker
    };
    return new AWS.S3().listObjects(params, function(e, things) {
      if (e) {
        console.error('error getting things', e);
        return cb(e);
      }
      var lastKey;
      _.forEach(things.Contents, function(thing) {
        rs.push(comma + thing.Key);
        comma = ',';
        lastKey = thing.Key;
      });
      if (things.IsTruncated) {
        nextMarker = lastKey;
      } else {
        nextMarker = null;
      }
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
    rs.push(null);
  }

  async.doWhilst(get, hasMarker, complete);
  rs._read = _.noop;
  
  return rs;
}

s3.get = function(year, month, image) {
  var params = {
    Bucket: bucket,
    Key: [year, month, image].join('/')
  };
  return new AWS.S3().getObject(params).createReadStream();
};

module.exports = s3;
