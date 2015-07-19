var _ = require('lodash');

export default class UnisonWebsocketServer {
  constructor(wsServer) {
    _.extend(this, {
      server: wsServer,
      clients: {},
      _nextId: 1
    });

    this.server = wsServer;
    this.clients = {};

    this.server.on('connection', (clientSocket) => this.attach(clientSocket));
  }

  attach(clientSocket) {
    let clientId = 'client#' + (this._nextId++);
    clientSocket._clientId = clientId;

    this.clients[clientId] = clientSocket;

    clientSocket.on('close', () => this.detach(clientId));
    clientSocket.on('message', (msg) => this.receive(clientId, msg));

    this.callbacks.onAttach(clientId);
  }

  detach(clientId) {
    this.callbacks.onDetach(clientId);
    delete this.clients[clientId];
  }

  receive(clientId, msg) {
    this.callbacks.onReceive(clientId, msg);
  }

  sendTo(clientId, msgString) {
    let client = this.clients[clientId];
    if (!client)
      return;
    this.clients[clientId].send(msgString);
  }

  onAttach(callback) { this.callbacks.onAttach = callback; }
  onDetach(callback) { this.callbacks.onDetach = callback; }
  onReceive(callback) { this.callbacks.onReceive = callback; }
}
