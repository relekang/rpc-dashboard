var $ = require('jquery');
var dashboard = require('./dashboard');

dashboard.init({
  containerSelector: '#container',
  rpcOptions: require('./rpc-options'),
  template: require('./templates/nodes.handlebars'),
  onRendered: function onRendered(utils) { }
});
