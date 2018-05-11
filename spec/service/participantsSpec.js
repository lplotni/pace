'use strict';
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail, jasmine */
const mockery = require('mockery');
const _ = require('lodash');
/* jshint node: true */

describe('participants service', () => {
    let participants = require('../../service/participants');

    describe('distributeIntoStartblocks()', () => {
      it('returns a suitable startblock with only ambitious participants in first block even if the block could be larger', () => {
        let participantsWithGoals = [{goal: 'relaxed'}, {goal: 'ambitious'}, {goal: 'moderate'}, {goal: 'moderate'}, {goal: 'moderate'}, {goal: 'relaxed'}];
        let availableStartBlocks = [{}, {}, {}];

        const distribution = participants.distributeIntoStartblocks(participantsWithGoals, availableStartBlocks);

        expect(distribution.length).toBe(3);
        expect(distribution[0]).toBe(1);
        expect(distribution[1]).toBe(2);
        expect(distribution[2]).toBe(3);
      });

      it('returns a suitable startblock with only ambitious participants in first block even if the block should be smaller', () => {
        let participantsWithGoals = [{goal: 'relaxed'}, {goal: 'ambitious'}, {goal: 'ambitious'}, {goal: 'ambitious'}, {goal: 'moderate'}, {goal: 'moderate'}, {goal: 'moderate'}, {goal: 'relaxed'}, {goal: 'ambitious'}];
        let availableStartBlocks = [{}, {}, {}, {}];

        const distribution = participants.distributeIntoStartblocks(participantsWithGoals, availableStartBlocks);

        expect(distribution.length).toBe(4);
        expect(distribution[0]).toBe(4);
        expect(distribution[1]).toBe(1);
        expect(distribution[2]).toBe(1);
        expect(distribution[3]).toBe(3);
      });

      it('returns a suitable startblock when there is only 1 startblock', () => {
        let participantsWithGoals = [{goal: 'relaxed'}, {goal: 'ambitious'}, {goal: 'ambitious'}, {goal: 'ambitious'}, {goal: 'moderate'}, {goal: 'moderate'}, {goal: 'moderate'}, {goal: 'relaxed'}, {goal: 'ambitious'}];
        let availableStartBlocks = [{}];

        const distribution = participants.distributeIntoStartblocks(participantsWithGoals, availableStartBlocks);

        expect(distribution.length).toBe(1);
        expect(distribution[0]).toBe(9);
      });
    });
});
