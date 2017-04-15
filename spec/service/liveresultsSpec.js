'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, afterAll, spyOn, it, expect, fail, jasmine */

describe('liveResults service', () => {

  let liveresults;

  beforeAll(() => {
    liveresults = require("../../service/liveresults");
  });

  it('sends results to all connected clients', () => {
    let aClientWs = jasmine.createSpyObj("aCientWs", ["send"]);
    let anotherClientWs = jasmine.createSpyObj("anotherClientWs", ["send"]);
    let aResult = {"name": "test", "time": "20000"};
    liveresults.initClient(aClientWs);
    liveresults.initClient(anotherClientWs);

    liveresults.updateAllClients(aResult);

    expect(aClientWs.send).toHaveBeenCalledWith(aResult);
    expect(anotherClientWs.send).toHaveBeenCalledWith(aResult);
  });

  it('should not send results to disconnected clients', () => {
    let aClientWs = jasmine.createSpyObj("aCientWs", ["send"]);
    let anotherClientWs = jasmine.createSpyObj("anotherClientWs", ["send"]);
    let aResult = {"name": "test", "time": "20000"};
    liveresults.initClient(aClientWs);
    liveresults.initClient(anotherClientWs);

    liveresults.closeClient(anotherClientWs);
    liveresults.updateAllClients(aResult);

    expect(aClientWs.send).toHaveBeenCalledWith(aResult);
    expect(anotherClientWs.send).not.toHaveBeenCalledWith(aResult);
  });


});
