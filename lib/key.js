var moment = require('moment');

var key = {}

key.utc = function(k) {
  return moment(k.substr(8, 14), 'YYYYMMDDHHmmss').valueOf();
};

module.exports = key;
