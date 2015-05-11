var bluebird = require('bluebird');

module.exports.remotes = function remotes(host) {
  var request = bluebird.promisify(require('browser-request'));

  return request(host + '/api/clients')
    .spread(function(res, body) {
      var peers = JSON.parse(body);
      for (var i = 0; i < peers.length; i++) {
        if (peers[i].match(/^dashboard/)) {
          peers.splice(i, 1);
        }
      }

      peers.sort(peersComparator);
      return peers;
    });
};

var peersComparator = function peersComparator(a, b) {
  a = parseInt(a, 16);
  b = parseInt(b, 16);
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

module.exports.peersComparator = peersComparator;
