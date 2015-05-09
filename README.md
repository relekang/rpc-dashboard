# RPC dashboard [![Build status](https://ci.frigg.io/relekang/rpc-dashboard.svg)](https://ci.frigg.io/relekang/rpc-dashboard/last/) [![Dependency Status](https://david-dm.org/relekang/rpc-dashboard.svg)](https://david-dm.org/relekang/rpc-dashboard)

This is a simple dashboard for showing node information from a Chord
implementation on top of [peerjs-rpc](https://github.com/relekang/peerjs-rpc).

## Usage
```
npm run watch
```

### With browserify
```
npm install relekang/rpc-dashboard
```

```javascript
var dashboard = require('rpc-dashboard');


dashboard.init({
  containerSelector: '#container',
  func: 'toJSON',
  rpcOptions: require('./rpc-options'),
  template: require('./templates/nodes.handlebars'),
  onRendered: function onRendered(utils) {
    // rewire listeners
  }
});

```

## Configuration
Host can be set with adding it as get parameter in the url
`http://127.0.0.1:3000?127.0.0.1:5000`
