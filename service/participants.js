/* jshint node: true */
/* jshint esnext: true */
'use strict';

const crypto = require('crypto');
const Q = require('q');
const _ = require('lodash');
const nodemailer = require('nodemailer');
const sendmailTransport = require('nodemailer-sendmail-transport');
const config = require('config');
const calculator = require('../domain/costCalculator');
const db = require('../service/dbHelper');

const editUrlHelper = require('../domain/editUrlHelper');

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

service.save = function (participant, paymentToken, secureID) {
  return db.insert('insert into participants (firstname, lastname, email, category, birthyear, team, visibility,discount, paymenttoken, secureid) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning id',
    [participant.firstname, participant.lastname, participant.email, participant.category, participant.birthyear, participant.team, participant.visibility, participant.discount, paymentToken, secureID]);
};

service.delete = function (participantid) {
  const deferred = Q.defer();
  db.select('delete from participants where id=$1', [participantid])
    .then((result) => {
      deferred.resolve(result);
    })
    .catch(deferred.reject);
  return deferred.promise;
};

service.update = function (participant, id) {
  return db.update('UPDATE participants SET (firstname, lastname, email, category, birthyear, team, visibility) = ($1, $2, $3, $4, $5, $6, $7) WHERE secureid = $8',
    [participant.firstname, participant.lastname, participant.email, participant.category, participant.birthyear, participant.team, participant.visibility, id]);
};

service.addTShirt = function (tshirt, participantId) {
  return db.insert('insert into tshirts (size, model, participantId) values($1, $2, $3) returning id',
    [tshirt.size, tshirt.model, participantId]);
};

service.getTShirtFor = function (participantId) {
  return db.select('SELECT * FROM tshirts WHERE participantid = $1', [participantId]);
};

function randomString() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

service.createUniqueToken = function () {
  const deferred = Q.defer();
  const token = randomString();

  db.select('select * from participants where paymenttoken like $1', [token])
    .then((result) => {
      if (_.isEmpty(result)) {
        deferred.resolve(token);
      } else {
        return deferred.resolve(service.createUniqueToken());
      }
    })
    .catch(deferred.reject);

  return deferred.promise;
};

service.register = function (participant) {
  const deferred = Q.defer();
  const jade = require('jade');

  service.createUniqueToken().then((paymentToken) => {
    const secureID = editUrlHelper.generateSecureID();
    service.save(participant, paymentToken, secureID)
      .then(id => {
        if (!_.isEmpty(participant.tshirt)) {
          service.addTShirt(participant.tshirt, id);
        }

        jade.renderFile('views/registration/text.jade',
          {
            name: participant.firstname,
            token: paymentToken,
            bank: config.get('contact.bank'),
            amount: calculator.priceFor(participant),
            editUrl: editUrlHelper.generateUrl(secureID)
          },
          (error, html) => {
            service.sendEmail(participant.email, 'Lauf Gegen Rechts: Registrierung erfolgreich', html, error);
          }
        );

        deferred.resolve({'id': id, 'token': paymentToken, secureid: secureID});
      })
      .fail(err => deferred.reject(err));
  }).fail(deferred.reject);

  return deferred.promise;
};

service.getByToken = function (paymentToken) {
  return db.select('SELECT id, firstname, lastname FROM participants WHERE upper(paymenttoken) = $1', [paymentToken.toUpperCase()])
    .then(result => {
      if (_.isEmpty(result)) {
        throw new Error('Es konnte keine Registrierung mit Token ' + paymentToken + ' gefunden werden.');
      }
      return result;
    })
    .then(result => {
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
  return db.select('SELECT * FROM participants WHERE id = $1', [id])
    .then(result => {
      if (_.isEmpty(result)) {
        throw new Error('No participant found');
      }
      return result;
    })
    .then(result => result[0]);
};

service.getBySecureId = function (id) {
  return db.select('SELECT * FROM participants WHERE secureid = $1', [id])
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
          jade.renderFile('views/admin/paymentValidation/text.jade',
            {name: result.firstname, editUrl: editUrlHelper.generateUrl(result.secureid)},
            (error, html) =>
              service.sendEmail(result.email, 'Lauf gegen Rechts: Zahlung erhalten', html, error)
          );
          deferred.resolve();
        });
    })
    .fail(err =>
      deferred.reject(err)
    );
  return deferred.promise;
};

service.sendEmail = function (address, subject, text, error) {
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
