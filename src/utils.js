var Bluebird = require('bluebird');
var api = require('./api');
var alerts = require('./alerts');
var progressBarTemplate = require('./templates/progress.handlebars');

Bluebird.longStackTraces();

module.exports = function utils(rpc, server, template) {
  var items = {};

  function update($container, done) {
    items = {};
    return api.remotes(server)
      .then(function(remotes) {
        return Bluebird.each(remotes, function(remote) {
          if (remote.match(/^dashboard/)) return;
          return rpc.invoke(remote, 'obj', [])
            .then(function(data) {
              items[remote] = JSON.parse(data);
              $container.html(progressBarTemplate({
                number: remotes.indexOf(remote) + 1,
                max: remotes.length,
                percent: (remotes.indexOf(remote) + 1) / remotes.length * 100,
              }));
            });
        });
      })
      .then(function() {
        render($container, done);
      })
      .catch(function(error) {
        //alert(error.message);
        throw error;
      });
  }

  function updateItem(hash, $container, done) {
    return rpc.invoke(hash, 'obj', [])
      .then(function(data) {
        items[hash] = JSON.parse(data);
        render($container, done);
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

  function render($container, done) {
    var listOfItems = [];
    for (var key in items) {
      listOfItems.push(items[key]);
    }

    $container.html(template({ items: listOfItems}));

    if (done) done();

    $('.refresh-node-btn')
      .off('click')
      .on('click', function() {
        var $el = $(this);
        var hash = $el.data('hash');
        $el.addClass('fa-spin');
        updateItem(hash, $container)
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
    updateItem: updateItem
  };
};
