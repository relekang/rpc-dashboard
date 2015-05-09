var port;
var host;

if (window.location.search.match(/\?/)) {
  host = window.location.search.replace('?', '').split(':')[0];
  if (window.location.search.split(':').length > 1) {
    port = window.location.search.replace('?', '').split(':')[1];
  }
} else {
  host = 'dht.aberforth.lkng.me';
}

var server = 'http://' + host + (port ? ':' + port : '');

module.exports = {
  peerOptions: {
    host: host,
    port: 5050,
    path: '/dht'
  },
  timeout: 36000000,
  debug: true,
  server: server
};
