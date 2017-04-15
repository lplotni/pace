'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, afterAll, spyOn, it, expect, fail, jasmine */

describe('websocket', () => {

  let websocket;

  beforeAll(() => {
    websocket = require("../../routes/websocket");
  });

  it('sends a message to all connected clients', () => {
    let aClientWs = jasmine.createSpyObj("aCientWs", ["send"]);
    let anotherClientWs = jasmine.createSpyObj("anotherClientWs", ["send"]);
    let aResult = {"name": "test", "time": "20000"};
    websocket.initClient(aClientWs);
    websocket.initClient(anotherClientWs);

    websocket.updateAllClients(aResult);

    let expectedMessage = JSON.stringify(aResult);
    expect(aClientWs.send).toHaveBeenCalledWith(expectedMessage);
    expect(anotherClientWs.send).toHaveBeenCalledWith(expectedMessage);
  });

  it('should not send messages to disconnected clients', () => {
    let aClientWs = jasmine.createSpyObj("aCientWs", ["send"]);
    let anotherClientWs = jasmine.createSpyObj("anotherClientWs", ["send"]);
    let aResult = {"name": "test", "time": "20000"};
    websocket.initClient(aClientWs);
    websocket.initClient(anotherClientWs);

    websocket.closeClient(anotherClientWs);
    websocket.updateAllClients(aResult);

    expect(aClientWs.send).toHaveBeenCalledWith(JSON.stringify(aResult));
    expect(anotherClientWs.send).not.toHaveBeenCalled();
  });
});
