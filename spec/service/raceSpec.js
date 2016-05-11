'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail, jasmine */
const Q = require('q');
const race = require('../../service/race');


describe('race service', () => {
      it('opens csv files', (done) => {
          race.parse('spec/service/results.csv')
            .then( (data) => {
              expect(data[1]).toBe('09:24:04');
              done();
            })
            .catch(done.fail);
      });
});
