'use strict';Object.defineProperty(exports, '__esModule', { value: true });var _createClass = (function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};})();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError('Cannot call a class as a function');}}var _ = require('lodash');
var Promise = require('bluebird');var 

UnisonWebsocketServer = (function () {
  function UnisonWebsocketServer(wsServer) {var _this = this;_classCallCheck(this, UnisonWebsocketServer);
    _.extend(this, { 
      server: wsServer, 
      clients: {}, 
      _nextId: 1 });


    this.server = wsServer;
    this.clients = {};
    this.callbacks = {};

    this.server.on('connection', function (clientSocket) {return _this.attach(clientSocket);});}_createClass(UnisonWebsocketServer, [{ key: 'attach', value: 


    function attach(clientSocket) {var _this2 = this;
      var clientId = 'client#' + this._nextId++;
      clientSocket._clientId = clientId;

      Promise.promisifyAll(clientSocket);
      this.clients[clientId] = clientSocket;

      clientSocket.on('close', function () {return _this2.detach(clientId);});
      clientSocket.on('message', function (msg) {return _this2.receive(clientId, msg);});

      this.callback('onAttach')(clientId);} }, { key: 'detach', value: 


    function detach(clientId) {
      this.callback('onDetach')(clientId);
      delete this.clients[clientId];} }, { key: 'receive', value: 


    function receive(clientId, msg) {
      this.callback('onReceive')(clientId, msg);} }, { key: 'sendTo', value: 


    function sendTo(clientId, msgString) {
      var client = this.clients[clientId];
      if (!client) 
      return;

      return this.clients[clientId].sendAsync(msgString);} }, { key: 'callback', value: 


    function callback(name) {
      return this.callbacks[name] || function () {};} }, { key: 'onAttach', value: 


    function onAttach(callback) {this.callbacks.onAttach = callback;} }, { key: 'onDetach', value: 
    function onDetach(callback) {this.callbacks.onDetach = callback;} }, { key: 'onReceive', value: 
    function onReceive(callback) {this.callbacks.onReceive = callback;} }]);return UnisonWebsocketServer;})();exports['default'] = UnisonWebsocketServer;module.exports = exports['default'];
//# sourceMappingURL=index.js.map