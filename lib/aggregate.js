var through2 = require('through2'),
  path = require('path'),
  key = require('./key'),
  JSONStream = require('JSONStream');

var aggregate = {};

function day(utc) {
  var d = new Date(utc);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function month(utc) {
  var d = new Date(utc);
  return new Date(d.getFullYear(), d.getMonth()).getTime();
}

aggregate.each = function() {
  var sep = '[';

  return through2(function(chunk, enc, done) {
    this.push(sep);
    sep = ',';
    item = {
      key: chunk.toString(),
      utc: key.utc(chunk.toString())
    };
    this.push(JSON.stringify(item));
    return done();
  }, function(done) {
    this.push(']');
    return done();
  });
};

aggregate.day = function() {
  var counts = {};
  var lastKey = null;
  var count = 0;
  var sep = '[';

  return through2(function(chunk, enc, done) {
    var k = day(key.utc(chunk.toString()));
    if (count > 0 && lastKey !== k) {
      this.push(sep);
      this.push(JSON.stringify({
        x: k,
        y: count
      }));
      sep = ',';
      count = 0;
    }
    lastKey = k;
    ++count;
    return done();
  }, function(done) {
    this.push(']');
    return done();
  });
};

aggregate.month = function() {

  var counts = {};
  var lastKey = null;
  var count = 0;
  var sep = '[';

  return through2(function(chunk, enc, done) {
    var k = month(key.utc(chunk.toString()));
    if (count > 0 && lastKey !== k) {
      this.push(sep);
      this.push(JSON.stringify({
        x: k,
        y: count
      }));
      sep = ',';
      count = 0;
    }
    lastKey = k;
    ++count;
    return done();
  }, function(done) {
    this.push(']');
    return done();
  });
};

module.exports = aggregate;
