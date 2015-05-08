var Bluebird = require('bluebird');
var $ = require('jquery');
var api = require('./api');
var RPC = require('peerjs-rpc');

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
var rpc = new RPC('dashboard', {}, {
  peerOptions: {
    host: host,
    port: 5050,
    path: '/dht'
  },
  timeout: 36000000,
  debug: true
});

var nodes = {};
var template = require('./templates/nodes.handlebars');
var $container = $('#container');
var $btn = $('.refresh-btn');

$btn.addClass('fa-spin');
update()
  .then(function() {
    $btn.removeClass('fa-spin');
  });

function update() {
  nodes = {};
  return api.remotes(server)
    .then(function(remotes) {
      return Bluebird.each(remotes, function(remote) {
        if (remote === 'dashboard') return;
        return rpc.invoke(remote, 'obj', [])
          .then(function(data) {
            nodes[remote] = JSON.parse(data);
          });
      });
    })
    .then(function() {
      render();
    })
    .catch(function(error) {
      alert(error.message);
    });
}

function updateNode(hash) {
  return rpc.invoke(hash, 'obj', [])
    .then(function(data) {
      nodes[hash] = JSON.parse(data);
      render();
    });
}

function render() {
  var listOfNodes = [];
  for (var key in nodes) {
    listOfNodes.push(nodes[key]);
  }

  $container.html(template({ nodes: listOfNodes}));

  $('.refresh-node-btn').unbind();
  $('.refresh-node-btn').on('click', function() {
    var $el = $(this);
    $el.addClass('fa-spin');
    updateNode($el.data('hash'));
    $el.removeClass('fa-spin');
  });
}

$btn.on('click', function() {
  $btn.addClass('fa-spin');
  update()
    .then(function() {
      $btn.removeClass('fa-spin');
    });
});
