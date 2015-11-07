'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterEach, it, expect */

describe('sendEmail', function () {
  var emailToBeSend;

  var service;
  var realNodeMailer;

  beforeEach(function () {
      service = require('../../service/participants');
      realNodeMailer = service._nodemailer;
      service._nodemailer = {
        createTransport: function () {
          return {
            sendMail: function (email) {
              console.log('sending ');
              emailToBeSend = email;
            }
          };
        }
      };
    }
  );

  afterEach(function () {
    service._nodemailer = realNodeMailer;
  });

  it('should use the correct recipient address', function () {
    service.sendEmail('herbert@example.com', 'not tested yet');
    expect(emailToBeSend.to).toBe('herbert@example.com');
  });
});
