'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail, jasmine */
const mockery = require('mockery');

describe('participants service', () => {
    let participants = require('../../service/participants');

    describe('distributeIntoStartblocks()', () => {
      it('returns a suitable startblock', () => {
        let distribution = participants.distributeIntoStartblocks([{goal: 'relaxed'}, {goal: 'ambitious'}, {goal: 'ambitious'}, {goal: 'moderate'}, {goal: 'moderate'}, {goal: 'moderate'}, {goal: 'relaxed'}], [{}, {}, {}])
        expect(distribution.length).toBe(3);
        expect(distribution[0]).toBe(2);
        expect(distribution[1]).toBe(2);
        expect(distribution[2]).toBe(3);
      });
    });
  }
);
