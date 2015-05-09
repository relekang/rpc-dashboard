var $ = require('jquery');
var sha1 = require('sha1');
var RPC = require('peerjs-rpc');

module.exports.init = function init(options) {
  var rpc = new RPC('dashboard' + sha1(Date.now().toString()), {}, options.rpcOptions);
  var utils = require('./utils')(rpc, options.rpcOptions.server, options.template);

  var $container = $(options.containerSelector);
  var $btn = $('.refresh-btn');

  $btn.addClass('fa-spin');
  utils.update($container, options.onRendered)
    .then(function() {
      $btn.removeClass('fa-spin');
    });

  $btn.on('click', function() {
    $btn.addClass('fa-spin');
    utils.update($container, options.onRendered)
      .then(function() {
        $btn.removeClass('fa-spin');
      });
  });
};
