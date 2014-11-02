var expect = require('chai').expect,
    key = require('../lib/key');

describe('key', function() {
  it('can parse dates', function() {
    var k = "2001/03/20010326134350.jpg"
    expect(key.utc(k)).to.equal(new Date(2001, 02, 26, 13, 43, 50).getTime());
  });
});
