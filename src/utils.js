import Bluebird from 'bluebird';
import alerts from './alerts';
import {peersComparator} from './api'; // remove me
import progressBarTemplate from './templates/progress.handlebars';

Bluebird.longStackTraces();

export default function utils(rpc, options) {
  var template = options.template;
  var items = {};

  function update($container, done) {
    items = {};
    $container.html('<h1 class="text-center">Fetching list of peers</h1>');

    return Bluebird.resolve(options.fetchClients())
      .then(remotes => {
        $container.html(progressBarTemplate({
          number: 0,
          max: remotes.length,
          percent: 0
        }));

        return Bluebird.each(remotes, remote => {
          if (remote.match(/^dashboard/)) return;
          return rpc.invoke(remote, 'obj', [])
            .then(data => {
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

      .then(() => {
        render($container, done);
      })

      .catch(error => {
        throw error;
      });
  }

  function updateItem(hash, $container, done) {
    return rpc.invoke(hash, 'obj', [])
      .then(data => {
        items[hash] = JSON.parse(data);
        items[hash].raw = JSON.stringify(items[hash], null, 2);
        render($container, done);
      });
  }

  function render($container, done) {
    var listOfItems = [];
    for (var key in items) {
      listOfItems.push(items[key]);
    }

    listOfItems.sort((a, b) => {
      return peersComparator(a.hash, b.hash);
    });

    $container.html(template({ items: listOfItems}));

    if (done) done({update: update, updateItem: updateItem, rpc: rpc});

  }

  return {
    update: update,
    updateItem: updateItem
  };
}
