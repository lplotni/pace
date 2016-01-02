'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterEach, it, expect */

describe('sendEmail', () => {
  let emailToBeSend;

  let service;
  let realNodeMailer;

  beforeEach(() => {
      service = require('../../service/participants');
      realNodeMailer = service._nodemailer;
      service._nodemailer = {
        createTransport: () => {
          return {
            sendMail: function (email) {
              emailToBeSend = email;
            }
          };
        }
      };
    }
  );

  afterEach(() => {
    service._nodemailer = realNodeMailer;
  });

  it('should use the correct recipient address', () => {
    service.sendEmail('herbert@example.com', 'A Subject Line','not tested yet');
    expect(emailToBeSend.to).toBe('herbert@example.com');
  });
  it('should use the correct subject', () => {
    service.sendEmail('herbert@example.com', 'A Subject Line','not tested yet');
    expect(emailToBeSend.subject).toBe('A Subject Line');
  });
  it('should use the correct html body', () => {
    service.sendEmail('herbert@example.com', 'A Subject Line','HTML BODY');
    expect(emailToBeSend.html).toBe('HTML BODY');
  });
});
