var bluebird = require('bluebird');
var request = bluebird.promisify(require('browser-request'));

module.exports.remotes = function remotes(host) {
  return request(host + '/api/clients')
    .spread(function(res, body) {
      var peers = JSON.parse(body);
      for (var i = 0; i < clients.length; i++) {
        if (peers[i].match(/^dashboard/)) {
          peers.splice(i, 1);
        }
      }
      peers.sort();
      return peers;
    });
};
