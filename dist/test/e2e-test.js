// This end to end test sets up a websocket server,
// connects with simulated clients and checks whether the results are correct.
'use strict';
var assert = require('chai').assert;
var Promise = require('bluebird');
var ws = require('ws');
var UnisonWsServer = require('../lib');

var PORT = 13515;

describe('Unison websocket server', function () {

  it('should report connecting clients via the onAttach callback', function (done) {
    withTestServer(function (server) {
      var clients = [];
      server.onAttach(function (clientId) {return clients.push(clientId);});

      return withTestClient(function (ws1) {
        return withTestClient(function (ws2) {
          assert.deepEqual(clients, ['client#1', 'client#2']);});});}).


    then(done)['catch'](done);});


  it('should report messages from clients through the onReceive callback', function (done) {
    var receivedMessages = [];

    withTestServer(function (server) {
      server.onReceive(function (client, msg) {return receivedMessages.push({ client: client, msg: msg });});
      return withTestClient(function (ws1) {
        return sendTestMessage(ws1, 'Hello!').
        then(function () {
          assert.deepEqual(receivedMessages, [
          { client: 'client#1', msg: 'Hello!' }]);});});}).



    then(done)['catch'](done);});


  it('should allow sending messages to clients with sendTo', function (done) {
    withTestServer(function (server) {
      return withTestClient(function (ws1) {
        var messagesOnClient = [];
        ws1.on('message', function (msg) {return messagesOnClient.push(msg);});

        return server.sendTo('client#1', 'Hi!').then(function () {
          return wait(100);}).
        then(function () {
          assert.deepEqual(messagesOnClient, ['Hi!']);});});}).


    then(done)['catch'](done);});


  it('should report disconnecting clients via the onDetach callback', function (done) {
    withTestServer(function (server) {
      var detachedClients = [];
      server.onDetach(function (client) {return detachedClients.push(client);});

      return withTestClient(function () {}).
      then(function () {
        // at this point the client has disconnected
        return wait(100);}).
      then(function () {
        assert.deepEqual(detachedClients, ['client#1']);});}).

    then(done)['catch'](done);});});





function withTestServer(testBody) {
  var wsServer = undefined;
  return new Promise(function (resolve, reject) {
    wsServer = new ws.Server({ port: PORT }, function (err) {
      if (err) return reject(err);
      resolve(wsServer);});}).

  then(function (wsServer) {
    return new UnisonWsServer(wsServer);}).
  then(function (unisonServer) {
    return testBody(unisonServer);})['finally'](
  function () {
    wsServer.close();});}



function withTestClient(testBody) {
  var socket = undefined;
  return new Promise(function (resolve, reject) {
    socket = new ws('ws://localhost:' + PORT);
    socket.on('open', function () {return resolve(socket);});
    socket.on('error', reject);}).
  then(function (socket) {
    return testBody(socket);})['finally'](
  function () {
    if (socket) socket.close();
    return wait(500); // give some time to actually close the server
  });}


function sendTestMessage(socket, msg) {
  return Promise.promisify(socket.send.bind(socket))(msg).
  then(function () {
    return wait(200); // give the message some time to arrive
  });}


function wait(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);});}
//# sourceMappingURL=e2e-test.js.map