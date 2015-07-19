# unison-websocket-server

A communications implementation for [Unison][unison] using a [ws][ws] websocket server that clients can connect to.

# Usage

To set up a Unison server using this communication protocol, you have to do these three steps:

```js
// get a ws.Server from somewhere, e.g. like this (see more in their documentation)
var ws = require('ws');
var wsServer = new ws.Server({port: 3000});
// create a UnisonWebsocketServer wrapping the ws one
var UnisonWebsocketServer = require('unison-websocket-server');
var comm = new UnisonWebsocketServer(wsServer);
// use it when creating your Unison object
unison({your: state})
    .plugin(server({
        communication: comm,
        ...
    });
```

[unison]: https://github.com/krajzeg/unison
[ws]: https://github.com/websockets/ws/
