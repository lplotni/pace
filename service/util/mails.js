/* jshint node: true */
/* jshint esnext: true */
'use strict';
const nodemailer = require('nodemailer');
const sendmailTransport = require('nodemailer-sendmail-transport');
const config = require('config');
const pug = require('pug');

const editUrlHelper = require('../../domain/editUrlHelper');

let service = {};
service._nodemailer = nodemailer;

service.sendStatusEmail = (participant, subject, pugfile) => {
  pug.renderFile(pugfile,
    {name: participant.firstname, editUrl: editUrlHelper.generateUrl(participant.secureid)},
    (error, html) =>
      service.sendEmail(participant.email, subject, html, error)
  );
};

service.sendEmail = (address, subject, text, error) => {
  if (error) {
    console.error(error);
  } else {
    let transporter = service._nodemailer.createTransport(sendmailTransport({
      path: '/usr/sbin/sendmail'
    }));
    transporter.sendMail({
      from: config.get('contact.email'),
      to: address,
      subject: subject,
      html: text
    });
  }
};

module.exports = service;
