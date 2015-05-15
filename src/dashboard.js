import $ from 'jquery';
import sha1 from 'sha1';
import RPC from 'peerjs-rpc';

export function init(options) {
  var rpc = new RPC('dashboard' + sha1(Date.now().toString()), {}, options.rpcOptions);
  var utils = require('./utils')(rpc, options);

  var $container = $(options.container);
  var $btn = $('.refresh-btn');

  $btn.addClass('fa-spin');
  utils.update($container, options.onRendered)
    .then(() => {
      $btn.removeClass('fa-spin');
    });

  $btn.on('click', e => {
    $btn.addClass('fa-spin');
    utils.update($container, options.onRendered)
      .then(() => {
        $btn.removeClass('fa-spin');
      });
  });

  return {rpc: rpc};
}
