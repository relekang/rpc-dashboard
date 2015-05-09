var $ = require('jquery');
var sha1 = require('sha1');
var RPC = require('peerjs-rpc');
var rpc = new RPC('dashboard' + sha1(Date.now().toString()), {}, require('./rpc-options'));
var utils = require('./utils')(rpc);

var $container = $('#container');
var $btn = $('.refresh-btn');

$btn.addClass('fa-spin');
utils.update($container)
  .then(function() {
    $btn.removeClass('fa-spin');
  });


$btn.on('click', function() {
  $btn.addClass('fa-spin');
  utils.update($container)
    .then(function() {
      $btn.removeClass('fa-spin');
    });
});
