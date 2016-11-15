/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, beforeEach, afterEach, it, expect, jasmine */
'use strict';

const pg = require('pg');
const config = require('config');
const _ = require('lodash');
const request = require('request');
const helper = require('./journeyHelper');
const participants = require('../service/participants');
const participant = require('../domain/participant');
const race = require('../service/race');

describe('api journey', () => {

  beforeEach((done) => {
    helper.setupDbConnection(done);
  });

  afterEach(() => {
    pg.end();
  });

  describe('scan', () => {
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
          request.post({url: url, formj: form}, (err,response) =>{
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

  describe('participants', () => {
    let aParticipant = participant.from({
      firstname: 'Friedrich',
      lastname: 'Schiller',
      email: 'f.schiller@example.com',
      category: 'f',
      birthyear: 1980,
      team: 'Crazy runners',
      visibility: 'yes',
      discount: 'yes'
    })
      .withStartNr(42)
      .withStartBlock(1)
      .withToken('payment token 1');

    const url = helper.paceUrl + 'api/participants';
    let qs = {
      start: 0,
      length: 5,
      search: {value: 'Crazy runn'},
      order: [{column: 0, dir: 'asc'}],
      columns: [{data: 'START_NUMBER'}], 
      draw: 4711,
    };

    it('should return participants matching filter', (done) => {
      participants.save(aParticipant)
        .then(participants.markPayed)
        .then(() => {
          request.get({url, qs}, (err,response) =>{
            expect(response.statusCode).toBe(200);
            const result = JSON.parse(response.body);
            expect(result.draw).toBe('4711');
            expect(result.recordsTotal).toBe(1);
            expect(result.recordsFiltered).toBe(1);
            expect(result.data[0]).toEqual(jasmine.objectContaining({
              start_number: 42,
              firstname: 'Friedrich',
              lastname: 'Schiller',
              team: 'Crazy runners'
            }));
            done();
          });
        });
    });

    it('should return no participants due to a non-matching filter', (done) => {
      qs = Object.assign({}, qs, { search: { value: 'XYZ'} });
      participants.save(aParticipant)
        .then(participants.markPayed)
        .then(() => {
          request.get({url, qs}, (err,response) =>{
            expect(response.statusCode).toBe(200);
            const result = JSON.parse(response.body);
            expect(result.recordsTotal).toBe(1);
            expect(result.recordsFiltered).toBe(0);
            expect(result.data.length).toBe(0);
            done();
          });
        });
    });

    it('should fail without parameters', (done) => {
      participants.save(aParticipant)
        .then(() => {
          request.get(url, (err,response) =>{
            expect(response.statusCode).toBe(500);
            done();
          });
        });
    });
  });

  describe('results', () => {
    let aParticipant = participant.from({
      firstname: 'Friedrich',
      lastname: 'Schiller',
      email: 'f.schiller@example.com',
      category: 'f',
      birthyear: 1980,
      team: 'Crazy runners',
      visibility: 'yes',
      discount: 'yes'
    })
      .withStartNr(42)
      .withStartBlock(1)
      .withToken('payment token 1');
    let time = '10:32:02';
    let startTimes = {
      block1: 36000,
      block2: 37200
    };

    const url = helper.paceUrl + 'api/results';
    let qs = {
      start: 0,
      length: 5,
      search: {value: 'Crazy runn'},
      order: [{column: 0, dir: 'asc'}],
      columns: [{data: 'START_NUMBER'}], 
      draw: 4711,
    };

    it('should return results matching filter', (done) => {
      participants.save(aParticipant)
        .then(participants.markPayed)
        .then(() => race.setStartTime(startTimes))
        .then(() => participants.insertTime(42, time))
        .then(() => {
          request.get({url, qs}, (err,response) =>{
            expect(response.statusCode).toBe(200);
            const result = JSON.parse(response.body);
            expect(result.draw).toBe('4711');
            expect(result.recordsTotal).toBe(1);
            expect(result.recordsFiltered).toBe(1);
            expect(result.data[0]).toEqual(jasmine.objectContaining({
              start_number: 42,
              firstname: 'Friedrich',
              lastname: 'Schiller',
              team: 'Crazy runners'
            }));
            done();
          });
        })
        .catch(done.fail);
    });

    it('should return no results due to a non-matching filter', (done) => {
      qs = Object.assign({}, qs, { search: { value: 'XYZ'} });
      participants.save(aParticipant)
        .then(participants.markPayed)
        .then(() => race.setStartTime(startTimes))
        .then(() => participants.insertTime(42, time))
        .then(() => {
          request.get({url, qs}, (err,response) =>{
            expect(response.statusCode).toBe(200);
            const result = JSON.parse(response.body);
            expect(result.recordsTotal).toBe(1);
            expect(result.recordsFiltered).toBe(0);
            expect(result.data.length).toBe(0);
            done();
          });
        });
    });

    it('should fail without parameters', (done) => {
      participants.save(aParticipant)
        .then(() => {
          request.get(url, (err,response) =>{
            expect(response.statusCode).toBe(500);
            done();
          });
        });
    });
  });
});
