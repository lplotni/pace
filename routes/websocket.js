/* jshint node: true */
/* jshint esnext: true */
'use strict';

let _ = require('lodash');

let websocket = (function () {

  let connectClients = [];

  let initClient = function(ws) {
    connectClients.push(ws);
  };

  let closeClient = function(ws) {
    _.remove(connectClients, value => ws === value);
  };

  let updateAllClients = function(messageObject) {
    let jsonMessage = JSON.stringify(messageObject);
    _.each(connectClients, (client) => {
      client.send(jsonMessage);
    });
  };

  return {
    initClient: initClient,
    closeClient: closeClient,
    updateAllClients: updateAllClients
  };
})();

module.exports = websocket;