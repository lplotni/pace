'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail */

describe('startblock service', () => {

  const helper = require('../journeyHelper');
  const startblocks = require('../../service/startblocks');
  const pg = require('pg');

  const defaultColor = '#FFFFFF';

  beforeEach((done) => {
    helper.setupDbConnection(done);
  });

  it('should save and read a startblock', (done) => {
    let name = 'My first startblock';
    let time = '1479312647';
    startblocks.add(time,name)
      .then(startblocks.get)
      .then(function(data) {
        expect(data.length).toBe(1);
        expect(data[0].name).toBe(name);
        expect(data[0].start_time).toBe(time);
        expect(data[0].color).toBe(defaultColor);
        done();
      })
      .catch(done.fail);
   });

  it('should save and read a startblock with custom color', (done) => {
    let name = 'My first startblock';
    let time = '1479312647';
    let color = '#CAFE00';
    startblocks.add(time,name, color)
      .then(startblocks.get)
      .then(function(data) {
        expect(data.length).toBe(1);
        expect(data[0].name).toBe(name);
        expect(data[0].start_time).toBe(time);
        expect(data[0].color).toBe(color);
        done();
      })
      .catch(done.fail);
  });

  it('should save default color when invalid hex color', (done) => {
    let name = 'My first startblock';
    let time = '1479312647';
    let color = '#CAFE0';
    startblocks.add(time,name, color)
      .then(startblocks.get)
      .then(function(data) {
        expect(data.length).toBe(1);
        expect(data[0].name).toBe(name);
        expect(data[0].start_time).toBe(time);
        expect(data[0].color).toBe(defaultColor);
        done();
      })
      .catch(done.fail);
  });

  it('should return startblock times as an array', (done) => {
    let name = 'My first startblock';
    let time = '3600';
    startblocks.add(time,name)
      .then(startblocks.times)
      .then(function(data) {
        expect(data[0]).toBe(time);
        done();
      })
      .catch(done.fail);
   });

})
;
