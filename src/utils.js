var Bluebird = require('bluebird');
var api = require('./api');

Bluebird.longStackTraces();

module.exports = function utils(rpc) {
  var nodes = {};
  var template = require('./templates/nodes.handlebars');
  var server = require('./rpc-options').server;

  function update($container) {
    nodes = {};
    return api.remotes(server)
      .then(function(remotes) {
        return Bluebird.each(remotes, function(remote) {
          if (remote.match(/^dashboard/)) return;
          return rpc.invoke(remote, 'obj', [])
            .then(function(data) {
              nodes[remote] = JSON.parse(data);
            });
        });
      })
      .then(function() {
        render($container);
      })
      .catch(function(error) {
        //alert(error.message);
        throw error;
      });
  }

  function updateNode(hash, $container) {
    return rpc.invoke(hash, 'obj', [])
      .then(function(data) {
        nodes[hash] = JSON.parse(data);
        render($container);
      });
  }

  function render($container) {
    var listOfNodes = [];
    for (var key in nodes) {
      listOfNodes.push(nodes[key]);
    }

    $container.html(template({ nodes: listOfNodes}));
    $('.refresh-node-btn')
      .off('click')
      .on('click', function() {
        var $el = $(this);
        $el.addClass('fa-spin');
        updateNode($el.data('hash'));
        $el.removeClass('fa-spin');
      });
  }

  return {
    update: update,
    updateNode: updateNode
  };
};
