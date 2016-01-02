/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Q = require('q');
const _ = require('lodash');
const nodemailer = require('nodemailer');
const sendmailTransport = require('nodemailer-sendmail-transport');
const config = require('config');
const calculator = require('../domain/costCalculator');
const db = require('../service/dbHelper');

let service = {};

service._nodemailer = nodemailer;

service.getAllWithPaymentStatus = function (paymentStatus) {
  if (typeof paymentStatus !== 'undefined') {
    return db.select('select * from participants where has_payed = $1 order by firstname,lastname', [paymentStatus]);
  } else {
    return db.select('select * from participants order by firstname,lastname');
  }
};

service.getRegistered = function () {
  return service.getAllWithPaymentStatus(false);
};

service.getConfirmed = function () {
  return service.getAllWithPaymentStatus(true);
};

service.getPubliclyVisible = function () {
  return service.getConfirmed().then(confirmed =>
    _.filter(confirmed, p => p.visibility === 'yes')
  );
};

service.save = function (participant, paymentToken) {
  return db.insert('insert into participants (firstname, lastname, email, category, birthyear, team, visibility, paymenttoken) values($1, $2, $3, $4, $5, $6, $7, $8) returning id',
    [participant.firstname, participant.lastname, participant.email, participant.category, participant.birthyear, participant.team, participant.visibility, paymentToken]);
};

service.update = function (participant, id) {
  return db.update('UPDATE participants SET (firstname, lastname, email, category, birthyear, team, visibility) = ($1, $2, $3, $4, $5, $6, $7) WHERE id = $8',
    [participant.firstname, participant.lastname, participant.email, participant.category, participant.birthyear, participant.team, participant.visibility, id]);
};

service.addTShirt = function (tshirt, participantId) {
  return db.insert('insert into tshirts (size, model, participantId) values($1, $2, $3) returning id',
    [tshirt.size, tshirt.model, participantId]);
};

service.getTShirtFor = function (participantId) {
  return db.select('SELECT * FROM tshirts WHERE participantid = $1', [participantId]);
};

service.register = function (participant, paymentToken) {
  const deferred = Q.defer();
  const jade = require('jade');
  service.save(participant, paymentToken)
    .then(id => {
      if (!_.isEmpty(participant.tshirt)) {
        service.addTShirt(participant.tshirt, id);
      }
      jade.renderFile('views/registration/success.jade', {
        name: participant.firstname,
        token: paymentToken,
        amount: config.get('costs.standard')
      }, (error, html) => service.sendEmail(participant.email, 'Lauf Gegen Rechts: Registrierung erfolgreich', html));
      deferred.resolve(id);
    })
    .fail(err => deferred.reject(err));

  return deferred.promise;
};

service.getByToken = function (paymentToken) {
  return db.select('SELECT id, firstname, lastname FROM participants WHERE paymenttoken = $1', [paymentToken])
    .then(result => {
      if (_.isEmpty(result)) {
        throw new Error('Es konnte keine Registrierung mit Token ' + paymentToken + ' gefunden werden.');
      }
      return result;
    })
    .then(result  => {
      return {
        name: result[0].lastname + ', ' + result[0].firstname,
        amount: calculator.priceFor(result[0]),
        id: result[0].id
      };
    })
    .then(participantDetails => {
        return db.select('SELECT * from tshirts where participantid = $1', [participantDetails.id])
          .then(result => {
            participantDetails.tshirt = result[0];
            return participantDetails;
          });
      }
    );
};

service.getById = function (id) {
  return db.select('SELECT id, firstname, lastname, email FROM participants WHERE id = $1', [id])
    .then(result => {
      if (_.isEmpty(result)) {
        throw new Error('Es konnte kein Teilnehmer mit ID: ' + id + ' gefunden werden.');
      }
      return result;
    })
    .then(result => {
      return {
        name: result[0].firstname,
        email: result[0].email
      };
    });
};

service.getFullInfoById = function (id) {
  return db.select('SELECT * FROM participants WHERE id = $1', [id])
    .then(result => {
      if (_.isEmpty(result)) {
        throw new Error('No participant found');
      }
      return result;
    })
    .then(result => result[0]);
};

service.markPayed = function (participantId) {
  return db.update('update participants SET has_payed = true WHERE id = $1', [participantId])
    .then(result => {
      if (result < 1) {
        throw new Error('Es konnte kein Teilnehmer mit ID: ' + participantId + ' gefunden werden.');
      }
    });
};

service.confirmParticipant = function (participantId) {
  const deferred = Q.defer();
  const jade = require('jade');
  service.markPayed(participantId)
    .then(() => {
      service.getById(participantId)
        .then(result => {
          jade.renderFile('views/paymentValidation//success.jade', {name: result.name}, (error, html) =>
            service.sendEmail(result.email, 'Lauf gegen Rechts: Zahlung erhalten', html)
          );
        });
      deferred.resolve();
    })
    .fail(err =>
      deferred.reject(err)
    );
  return deferred.promise;
};

service.sendEmail = function (address, subject, text) {
  let transporter = service._nodemailer.createTransport(sendmailTransport({
    path: '/usr/sbin/sendmail'
  }));


  transporter.sendMail({
    from: config.get('contact.email'),
    to: address,
    subject: subject,
    html: text
  });
};

module.exports = service;
