var bluebird = require('bluebird');
var request = bluebird.promisify(require('browser-request'));

module.exports.remotes = function remotes(host) {
  return request(host + '/api/clients')
    .spread(function(res, body) {
      var peers = JSON.parse(body);
      peers.sort();
      return peers;
    });
};
