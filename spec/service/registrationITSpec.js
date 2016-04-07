'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, beforeAll, afterAll, spyOn, it, expect, fail */

describe('registration', () => {

  const registration = require('../../service/registration');
  const participants = require('../../service/participants');
  const tshirts = require('../../service/tshirts');
  const participant = require('../../domain/participant');

  const mails = require('../../service/util/mails');
  const helper = require('../journeyHelper');

  let originalRegistrationStatus;
  let startNr = 30;

  const aParticipant = participant.from({
    firstname: 'Hertha',
    lastname: 'Mustermann',
    email: 'h.mustermann@example.com',
    category: 'Unicorn',
    birthyear: 1980,
    visibility: 'yes',
    discount: 'no',
    team: 'Crazy runners'
  }).withSecureId('some_secure_id');

  beforeAll((done) => {
    registration.isClosed().then(isClosed => {
      originalRegistrationStatus = isClosed;
      if (isClosed) {
        registration.reopen().then(() => {
          done();
        });
      } else {
        done();
      }
    });
  });

  afterAll((done) => {
    if (!originalRegistrationStatus) {
      registration.reopen().then(() => {
        helper.closeDbConnection(done);
      });
    } else {
      helper.closeDbConnection(done);
    }
  });
  
  describe('start()', () => {
    it('should save the participant and send confirmation email', (done) => {
      spyOn(participants, 'save').and.callThrough();
      spyOn(mails, 'sendEmail');
      spyOn(tshirts, 'addFor');

      const p = participant.from({
        firstname: 'Hertha',
        lastname: 'Mustermann',
        email: 'h.mustermann@example.com',
        category: 'Unicorn',
        birthyear: 1980,
        visibility: 'yes',
        discount: 'no',
        team: 'Crazy runners'
      });

      registration.start(p)
        .then((result) => {
          expect(participants.save).toHaveBeenCalled();

          let participant = participants.save.calls.mostRecent().args[0];
          expect(participant.firstname).toBe(p.firstname);
          expect(participant.paymentToken).toBe(result.token);
          expect(participant.secureID).toBe(result.secureid);
          expect(participant.start_number).toBe(result.startnr);

          expect(mails.sendEmail).toHaveBeenCalled();

          let participantsEmail = mails.sendEmail.calls.mostRecent().args[0];
          expect(participantsEmail).toBe(p.email);

          let subject = mails.sendEmail.calls.mostRecent().args[1];
          expect(subject).toBe('Lauf Gegen Rechts: Registrierung erfolgreich');

          let content = mails.sendEmail.calls.mostRecent().args[2];
          expect(content).toMatch(/Danke/);

          expect(tshirts.addFor).not.toHaveBeenCalled();
          done();
        })
        .fail(fail);
    });

    it('should call addFor if one ordered', (done) => {
      spyOn(tshirts, 'addFor');

      const pWithShirt = participant.from({
        firstname: 'Hertha',
        lastname: 'Mustermann',
        email: 'h.mustermann@example.com',
        birthyear: 1980,
        category: 'Horse',
        visibility: 'yes',
        discount: 'no',
        shirt: 'yes',
        size: 'XS',
        model: 'Crazy cool fit'
      });

      registration.start(pWithShirt)
        .then(() => {
          expect(tshirts.addFor).toHaveBeenCalled();
          done();
        })
        .fail(fail);
    });
  });

  describe('confirm()', () => {
    it('should mark the participant as payed and send a confirmation mail which includes the edit link', (done) => {
      spyOn(participants, 'markPayed').and.callThrough();
      spyOn(mails, 'sendEmail');

      participants.save(aParticipant.withToken('token x').withStartNr(startNr++))
        .then(function (participantId) {
          registration.confirm(participantId)
            .then(() => {
              expect(participants.markPayed).toHaveBeenCalledWith(participantId);

              expect(mails.sendEmail).toHaveBeenCalled();
              let partcipantsEmail = mails.sendEmail.calls.mostRecent().args[0];
              expect(partcipantsEmail).toBe(aParticipant.email);
              let subject = mails.sendEmail.calls.mostRecent().args[1];
              expect(subject).toBe('Lauf gegen Rechts: Zahlung erhalten');
              let content = mails.sendEmail.calls.mostRecent().args[2];
              expect(content).toMatch(aParticipant.firstname);
              expect(content).toMatch(/eingegangen/);
              expect(content).toMatch('some_secure_id');

              done();
            })
            .fail(fail);
        }).fail(fail);
    });

    it('should give error if ID is invalid', (done) => {
      let wrongId = '999';

      participants.save(aParticipant.withToken('token y').withStartNr(startNr++))
        .then(() => {
          registration.confirm(wrongId)
            .catch(() => {
              done();
            });
        }).fail(fail);
    });
  });
  
  it('should close the registration', (done) => {
    registration.close()
      .then(() => {
        registration.isClosed()
          .then((isClosed) => {
            expect(isClosed).toEqual(true);
            done();
          })
          .fail(fail);
      })
      .fail(fail);
  });
});
