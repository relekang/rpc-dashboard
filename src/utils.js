var Bluebird = require('bluebird');
var api = require('./api');
var alerts = require('./alerts');
var progressBarTemplate = require('./templates/progress.handlebars');

Bluebird.longStackTraces();

module.exports = function utils(rpc, server, template) {
  var items = {};

  function update($container, done) {
    items = {};
    $container.html('<h1 class="text-center">Fetching list of peers</h1>');
    return api.remotes(server)
      .then(function(remotes) {
        $container.html(progressBarTemplate({
          number: 0,
          max: remotes.length,
          percent: 0
        }));

        return Bluebird.each(remotes, function(remote) {
          if (remote.match(/^dashboard/)) return;
          return rpc.invoke(remote, 'obj', [])
            .then(function(data) {
              items[remote] = JSON.parse(data);
              items[remote].raw = JSON.stringify(items[remote], null, 2);
              $container.html(progressBarTemplate({
                number: remotes.indexOf(remote) + 1,
                max: remotes.length,
                percent: (remotes.indexOf(remote) + 1) / remotes.length * 100
              }));
            });
        });
      })
      .then(function() {
        render($container, done);
      })
      .catch(function(error) {
        throw error;
      });
  }

  function updateItem(hash, $container, done) {
    return rpc.invoke(hash, 'obj', [])
      .then(function(data) {
        items[hash] = JSON.parse(data);
        items[hash].raw = JSON.stringify(items[hash], null, 2);
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
    function timedGet(key, implementation) {
      var start = Date.now();
      return rpc.invoke(hash, 'get', [key, implementation])
        .then(function(result) {
          result.end = Date.now();
          result.start = start;
          result.time = result.end - result.start;
          return result;
        });
    }

    return Bluebird.all([timedGet(key, 'scalable'), timedGet(key, 'geo')])
      .spread(function(scalable, geo) {
        alerts.success('(scalable) Fetched  "' + scalable.value + '" from node "' + scalable.peer + '" in ' + scalable.time + ' ms');
        alerts.success('(geo) Fetched  "' + geo.value + '" from node "' + geo.peer + '" in ' + geo.time + ' ms');
        return [scalable, geo];
      });
  }

  function set(hash, key, value) {
    return rpc.invoke(hash, 'set', [key, value, 'scalable'])
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
