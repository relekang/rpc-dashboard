var $ = require('jquery');
var closeBtn = '<button class="close" data-dismiss="alert">×</button>';

function addMessage(message, type) {
  var $alert = $('<div></div>');
  $alert.addClass('alert');
  if (type !== '') $alert.addClass(type);
  $alert.html(closeBtn + '\n' + message);
  $('#alerts').append($alert);
}

module.exports = {
  error: function addError(message) {
    addMessage(message, 'alert-error');
  },

  success: function addSuccess(message) {
    addMessage(message, 'alert-success');
  },

  info: function addInfo(message) {
    addMessage(message, 'alert-info');
  }
};
