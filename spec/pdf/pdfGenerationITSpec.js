/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail */
'use strict';

describe('participants service', () => {
  const pdfGeneration = require('../../pdf/pdfGeneration');
  const participants = require('../../service/participants');

  afterAll((done) => {
    // delete pdf file
    done();
  });

  const createParticipant = (firsname, lastname) => {
    return {
      firstname: firsname,
      lastname: lastname,
      email: 'j.testperson@example.com',
      category: 'Unicorn',
      birthyear: 1975,
      visibility: 'yes',
      discount: 'no',
      team: 'Crazy runners'
    };
  };

  it('should generate a pdf page for every participant', (done) => {
    const randomToken = '1234567';
    const anotherRandomToken = '7654321';
    const secureId = 'some secure id';

    participants.save(createParticipant('Jonas', 'Testperson'), randomToken, secureId).then(() =>
      participants.save(createParticipant('Martha', 'Testperson'), anotherRandomToken, secureId).then(() =>
        pdfGeneration.generate().then(() => {
          // verify page number
          done();
        }))
    );
  });
});