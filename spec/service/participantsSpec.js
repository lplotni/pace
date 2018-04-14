'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail, jasmine */
const mockery = require('mockery');

describe('participants service', () => {
    let participants = require('../../service/participants');

    describe('distributeIntoStartblocks()', () => {
      it('returns a suitable startblock with ambitious participants in first block', () => {
        let participantsWithGoals = [{goal: 'relaxed'}, {goal: 'ambitious'}, {goal: 'moderate'}, {goal: 'moderate'}, {goal: 'moderate'}, {goal: 'relaxed'}];
        let availableStartBlocks = [{}, {}, {}];

        const distribution = participants.distributeIntoStartblocks(participantsWithGoals, availableStartBlocks);

        expect(distribution.length).toBe(3);
        expect(distribution[0]).toBe(1);
        expect(distribution[1]).toBe(2);
        expect(distribution[2]).toBe(3);
      });
    });
  }
);
