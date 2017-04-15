/* jshint node: true */
/* jshint esnext: true */
'use strict';

let _ = require('lodash');

let liveresults = (function () {

  let connectClients = [];

  let initClient = function(ws) {
    connectClients.push(ws);
  };

  let closeClient = function(ws) {
    _.remove(connectClients, value => ws === value);
  };

  let updateAllClients = function(result) {
    _.each(connectClients, (client) => {
      client.send(result);
    });
  };

  return {
    initClient: initClient,
    closeClient: closeClient,
    updateAllClients: updateAllClients
  };
})();

module.exports = liveresults;