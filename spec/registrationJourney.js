/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, beforeEach, afterEach, afterAll, xit, it, expect */
'use strict';

const helper = require('./journeyHelper');
const config = require('config');
const registration = require('../service/registration');
const couponcodes = require('../service/couponcodes');

describe('registration journey', () => {

  let client, originalRegistrationStatus;

  beforeAll((done) => {
    registration.isClosed().then(isClosed => {
      originalRegistrationStatus = isClosed;
      if(isClosed) {
        registration.reopen().then( () => {
          done();
        });
      } else {
        done();
      }
    });
  });

  beforeEach((done) => {
    helper.changeOriginalTimeout();
    client = helper.setUpClient(done);
  });

  afterEach(() => {
    helper.resetToOriginalTimeout();
  });

  afterAll((done) => {
    if (originalRegistrationStatus) {
      registration.close().then( () => {
        done();
      });
    } else {
      done();
    }
  });

  it('allows to start via the registration page', (done) => {
    client.url(helper.paceUrl)
      .click('a#registration')
      .isVisible('form#registrationForm')
      .setValue('input#firstname', 'Max')
      .setValue('input#lastname', 'Mustermann')
      .setValue('input#email', 'max@example.com')
      .selectByValue('select#category', 'f')
      .setValue('input#birthyear', 2000)
      .setValue('input#team', 'Crazy runners')
      .selectByIndex('select#visibility', 1)
      .selectByIndex('select#goal', 2)
      .click('input#shirt')
      .click('button#submit')
      .isVisible('div.thanks')
      .then((isVisible) => {
        expect(isVisible).toBe(true);
      })
      .isVisible('a#editurl')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .getText('span.amount')
      .then((amount) => {
        expect(amount).toMatch(/20.00/); // shirt and full price
      })
      .getText('span.startNumber')
      .then((number) => {
        expect(number).toMatch(/d*/);
      })
      .call(done);
  });

  it("doesn't display bank details and payment message when valid coupon code is used", (done) => {
    couponcodes.create()
    .then((code) => {
      client.url(helper.paceUrl)
        .click('a#registration')
        .isVisible('form#registrationForm')
        .setValue('input#firstname', 'Max')
        .setValue('input#lastname', 'Mustermann')
        .setValue('input#email', 'max@example.com')
        .selectByValue('select#category', 'f')
        .setValue('input#birthyear', 2000)
        .setValue('input#team', 'Crazy runners')
        .selectByIndex('select#visibility', 1)
        .selectByIndex('select#goal', 2)
        .selectByIndex('select#discount', 2)
        .isVisible('input#couponcode')
          .then((isVisible) => {
            expect(isVisible).toBe(true);
          })
        .setValue('input#couponcode', code.code)
        .click('input#shirt')
        .click('button#submit')
        .isVisible('div.thanks')
        .then((isVisible) => {
          expect(isVisible).toBe(true);
        })
        .isVisible('a#editurl')
        .then(function (isVisible) {
          expect(isVisible).toBe(true);
        })
        .getText('span.amount')
        .then((amount) => {
          expect(amount).toMatch(/10.00/); // only tshirt price
        })
        .getText('span.startNumber')
        .then((number) => {
          expect(number).toMatch(/d*/);
        })
        .call(done);
      });
  });

  it('allows to register without giving too much information', (done) => {
    client.url(helper.paceUrl)
      .click('a#registration')
      .isVisible('form#registrationForm')
      .selectByValue('select#category', 'f')
      .selectByIndex('select#visibility', 1)
      .click('button#submit')
      .isVisible('div.thanks')
      .then((isVisible) => {
        expect(isVisible).toBe(true);
      })
      .isVisible('a#editurl')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .isVisible('h5#no-email')
      .then((isVisible) => {
        expect(isVisible).toBe(true);
      })
      .getText('span.amount')
      .then((amount) => {
        expect(amount).toMatch(/10.00/);
      })
      .getText('span.startNumber')
      .then((number) => {
        expect(number).toMatch(/d*/);
      })
      .end(done);
  });

  it('shows a message when the registration is closed', (done) => {
    registration.close().then(() => {
      client.url(helper.paceUrl)
        .click('a#registration')
        .isVisible('form#registrationForm')
        .then((isVisible) => {
          expect(isVisible).toBe(false);
        })
        .isVisible('p#registration-closed-message')
        .then(function (isVisible) {
          expect(isVisible).toBe(true);
        })
        .then(registration.reopen).then(() => {
        client.end(done);
      });
    });
  });

  it('should return failure page on wrong couponcode', (done) =>{
    client.url(helper.paceUrl + 'registration')
      .setValue('input#firstname', 'Max')
      .setValue('input#lastname', 'Mustermann')
      .setValue('input#email', 'max@example.com')
      .setValue('input#birthyear', 2000)
      .selectByIndex('select#discount', 2)
      .isVisible('input#couponcode')
        .then((isVisible) => {
          expect(isVisible).toBe(true);
        })
      .setValue('input#couponcode', 'invalidCode')
      .click('button#submit')
      .isVisible('p#failure-message')
      .then((isVisible) => {
        expect(isVisible).toBe(true);
      }).end(done);
  });
});
