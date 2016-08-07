/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, beforeEach, afterEach, it, expect */
'use strict';

const pg = require('pg');
const config = require('config');
const _ = require('lodash');
const request = require('request');
const helper = require('./journeyHelper');
const participants = require('../service/participants');
const participant = require('../domain/participant');

describe('api journey', () => {

  beforeEach((done) => {
    helper.setupDbConnection(done);
  });

  afterEach(() => {
    pg.end();
  });
  let aParticipant = participant.from({
    firstname: 'Friedrich',
    lastname: 'Schiller',
    email: 'f.schiller@example.com',
    category: 'f',
    birthyear: 1980,
    team: 'Crazy runners',
    visibility: 'no',
    discount: 'yes'
  }).withStartNr(42).withStartBlock(1);

  let headers = { 'X-Pace-Token': config.get('admin.token')};
  let form = { 'startnumber': 42, 'time': 123};
  let url = helper.paceUrl + 'api/scan';

  it('allows to send finish times', (done) => {
    participants.save(aParticipant)
      .then(() => {
        request.post({url: url, headers: headers, form: form}, (err,response) =>{
          expect(response.statusCode).toBe(200);
          done();
        });
      });
  });
  it('only allows to send finish times with correct token', (done) => {
    participants.save(aParticipant)
      .then(() => {
        request.post({url: url, form: form}, (err,response) =>{
          expect(response.statusCode).toBe(403);
          done();
        });
      });
  });
  it('returns error if user not found', (done) => {
    participants.save(aParticipant)
      .then(() => {
        let form = { 'startnumber': 1234000, 'time': 123};
        request.post({url: url, headers: headers, form: form}, (err,response) =>{
          expect(response.statusCode).toBe(404);
          done();
        });
      });
  });


});
