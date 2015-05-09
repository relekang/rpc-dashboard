var Bluebird = require('bluebird');
var api = require('./api');
var alerts = require('./alerts');

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

  function formSubmit(event) {
    event.preventDefault();
    var $btn = $(this);
    var $form = $btn.parent();
    var $buttons = $form.find('button');
    var $spinner = $form.find('.fa-spinner');
    var hash = $form.find('#id_hash').val();
    var promise;

    $spinner.fadeIn();
    $buttons.addClass('disabled');

    if ($btn.data('action') == 'get') {
      promise = get(hash, $form.find('#id_key').val());
    } else if ($btn.data('action') == 'set') {
      promise = set(hash, $form.find('#id_key').val(), $form.find('#id_value').val());
    } else {
      $spinner.fadeOut();
      $buttons.removeClass('disabled');
      return;
    }

    promise.then(function(results) {
      $spinner.fadeOut();
      $buttons.removeClass('disabled');
    });
  }


  function get(hash, key) {
    return rpc.invoke(hash, 'get', [key])
      .then(function(result) {
        alerts.success('Fetch "' + result.value + '" from node "' + result.peer + '"');
        return result;
      });
  }

  function set(hash, key, value) {
    return rpc.invoke(hash, 'set', [key, value])
      .then(function(result) {
        alerts.success('Set');
        return result;
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
        var hash = $el.data('hash');
        $el.addClass('fa-spin');
        updateNode(hash, $container)
          .then(function() {
            $el.removeClass('fa-spin');
            $('.nav [data-hash=' + hash + ']').click();
          });
      });

    $('form button')
      .off('click')
      .on('click', formSubmit);
  }

  return {
    update: update,
    updateNode: updateNode
  };
};
