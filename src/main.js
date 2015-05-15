import $ from 'jquery';
import Bluebird from 'bluebird';
import {init} from './dashboard';
import template from './templates/nodes.handlebars';
import api from './api';
import alerts from './alerts';
import options from './rpc-options';

var $container = $('#container');

var dashboard = init({
  container: $container,
  rpcOptions: options,
  template: template,
  onRendered: onRendered,
  fetchClients: () => {
    return api.remotes(options.server);
  },

  peerComparator: (a, b) => {
    return api.peersComparator(a, b);
  }
});

function onRendered(utils) {
  $('.refresh-node-btn')
    .off('click')
    .on('click', refreshNodeClickHandler);

  $('form button')
    .off('click')
    .on('click', formSubmit);

  function refreshNodeClickHandler(e) {
    var $el = $(this);
    var hash = $el.data('hash');
    $el.addClass('fa-spin');
    utils.updateItem(hash, $container, onRendered)
      .then(() => {
        $el.removeClass('fa-spin');
        $('.nav [data-hash=' + hash + ']').click();
      });
  }
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
    return dashboard.rpc.invoke(hash, 'get', [key, implementation])
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
  return dashboard.rpc.invoke(hash, 'set', [key, value, 'scalable'])
    .then(function(result) {
      alerts.success('Set');
      return result;
    });
}
