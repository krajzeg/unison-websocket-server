var _ = require('lodash');
var Promise = require('bluebird');

export default class UnisonWebsocketServer {
  constructor(wsServer) {
    _.extend(this, {
      server: wsServer,
      clients: {},
      _nextId: 1
    });

    this.server = wsServer;
    this.clients = {};
    this.callbacks = {};

    this.server.on('connection', (clientSocket) => this.attach(clientSocket));
  }

  attach(clientSocket) {
    let clientId = 'client#' + (this._nextId++);
    clientSocket._clientId = clientId;

    Promise.promisifyAll(clientSocket);
    this.clients[clientId] = clientSocket;

    clientSocket.on('close', () => this.detach(clientId));
    clientSocket.on('message', (msg) => this.receive(clientId, msg));

    this.callback('onAttach')(clientId);
  }

  detach(clientId) {
    this.callback('onDetach')(clientId);
    delete this.clients[clientId];
  }

  receive(clientId, msg) {
    this.callback('onReceive')(clientId, msg);
  }

  sendTo(clientId, msgString) {
    let client = this.clients[clientId];
    if (!client)
      return;

    return this.clients[clientId].sendAsync(msgString);
  }

  callback(name) {
    return this.callbacks[name] || (() => {});
  }

  onAttach(callback) { this.callbacks.onAttach = callback; }
  onDetach(callback) { this.callbacks.onDetach = callback; }
  onReceive(callback) { this.callbacks.onReceive = callback; }
}
