// This end to end test sets up a websocket server,
// connects with simulated clients and checks whether the results are correct.

let assert = require('chai').assert;
let Promise = require('bluebird');
let ws = require('ws');
let UnisonWsServer = require('../lib');

const PORT = 13515;

describe("Unison websocket server", () => {

  it("should report connecting clients via the onAttach callback", (done) => {
    withTestServer((server) => {
      let clients = [];
      server.onAttach((clientId) => clients.push(clientId));

      return withTestClient((ws1) => {
        return withTestClient((ws2) => {
          assert.deepEqual(clients, ["client#1", "client#2"]);
        });
      });
    }).then(done).catch(done);
  });

  it("should report messages from clients through the onReceive callback", (done) => {
    let receivedMessages = [];

    withTestServer((server) => {
      server.onReceive((client, msg) => receivedMessages.push({client, msg}));
      return withTestClient((ws1) => {
        return sendTestMessage(ws1, "Hello!")
          .then(() => {
            assert.deepEqual(receivedMessages, [
              {client: "client#1", msg: "Hello!"}
            ]);
          });
      });
    }).then(done).catch(done);
  });

  it("should allow sending messages to clients with sendTo", (done) => {
    withTestServer((server) => {
      return withTestClient((ws1) => {
        let messagesOnClient = [];
        ws1.on('message', (msg) => messagesOnClient.push(msg));

        return server.sendTo('client#1', "Hi!").then(() => {
          return wait(100);
        }).then(() => {
          assert.deepEqual(messagesOnClient, ["Hi!"]);
        });
      });
    }).then(done).catch(done);
  });

  it("should report disconnecting clients via the onDetach callback", (done) => {
    withTestServer((server) => {
      let detachedClients = [];
      server.onDetach((client) => detachedClients.push(client));

      return withTestClient(() => {})
        .then(() => {
          // at this point the client has disconnected
          return wait(100);
        }).then(() => {
          assert.deepEqual(detachedClients, ["client#1"]);
        });
    }).then(done).catch(done);
  });
});



function withTestServer(testBody) {
  let wsServer;
  return new Promise((resolve, reject) => {
    wsServer = new ws.Server({port: PORT}, (err) => {
      if (err) return reject(err);
      resolve(wsServer);
    });
  }).then((wsServer) => {
    return new UnisonWsServer(wsServer);
  }).then((unisonServer) => {
    return testBody(unisonServer);
  }).finally(() => {
    wsServer.close();
  });
}

function withTestClient(testBody) {
  let socket;
  return new Promise((resolve, reject) => {
    socket = new ws(`ws://localhost:${PORT}`);
    socket.on('open', () => resolve(socket));
    socket.on('error', reject);
  }).then((socket) => {
    return testBody(socket);
  }).finally(() => {
    if (socket) socket.close();
    return wait(500); // give some time to actually close the server
  });
}

function sendTestMessage(socket, msg) {
  return Promise.promisify(socket.send.bind(socket))(msg)
    .then(() => {
      return wait(200); // give the message some time to arrive
    });
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}