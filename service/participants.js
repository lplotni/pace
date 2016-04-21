/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Q = require('q');
const _ = require('lodash');

const calculator = require('../domain/costCalculator');
const db = require('../service/util/dbHelper');
const mails = require('../service/util/mails');
const tshirts = require('../service/tshirts');

let participants = {};

participants.allWithPaymentStatus = function (paymentStatus) {
  if (_.isUndefined(paymentStatus)) {
    return db.select('select * from participants order by firstname,lastname');
  } else {
    return db.select('select * from participants where has_payed = $1 order by firstname,lastname', [paymentStatus]);
  }
};

participants.registered = function () {
  return participants.allWithPaymentStatus(false);
};

participants.confirmed = function () {
  return participants.allWithPaymentStatus(true);
};

participants.publiclyVisible = function () {
  return participants.confirmed().then(confirmed =>
    _.filter(confirmed, p => p.visibility === 'yes')
  );
};

participants.save = function (participant) {
  return db.insert('INSERT INTO participants ' +
    '(firstname, lastname, email, category, birthyear, team, visibility,discount, paymenttoken, secureid, start_number, couponcode) ' +
    'values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) returning id',
    [participant.firstname,
      participant.lastname,
      participant.email,
      participant.category,
      participant.birthyear,
      participant.team,
      participant.visibility,
      participant.discount,
      participant.paymentToken,
      participant.secureID,
      participant.start_number,
      participant.couponcode]
  );
};

participants.delete = function (participantid) {
  return db.delete('delete from participants where id=$1', [participantid]);
};

participants.update = function (participant, id) {
  return db.update('UPDATE participants SET ' +
    '(firstname, lastname, email, category, birthyear, team, visibility) = ' +
    '($1, $2, $3, $4, $5, $6, $7) WHERE secureid = $8',
    [participant.firstname,
      participant.lastname,
      participant.email,
      participant.category,
      participant.birthyear,
      participant.team,
      participant.visibility,
      id]);
};

participants.byToken = function (paymentToken) {
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
        return tshirts.getFor(participantDetails.id)
          .then(result => {
            participantDetails.tshirt = result[0];
            return participantDetails;
          });
      }
    );
};

participants.byId = function (id) {
  return db.select('SELECT * FROM participants WHERE id = $1', [id])
    .then(result => {
      if (_.isEmpty(result)) {
        throw new Error('No participant found');
      }
      return result;
    })
    .then(result => result[0]);
};

participants.bySecureId = function (id) {
  return db.select('SELECT * FROM participants WHERE secureid = $1', [id])
    .then(result => {
      if (_.isEmpty(result)) {
        throw new Error('No participant found');
      }
      return result;
    })
    .then(result => result[0]);
};

participants.markPayed = function (participantId) {
  return db.update('update participants SET has_payed = true WHERE id = $1', [participantId])
    .then(result => {
      if (result < 1) {
        throw new Error('Es konnte kein Teilnehmer mit ID: ' + participantId + ' gefunden werden.');
      }
    });
};

participants.bulkmail = function () {
  const deferred = Q.defer();

  participants.confirmed().then(confirmed => {
    participants.registered().then(unconfirmed => {
      _.forEach(confirmed, participant => {
        mails.sendStatusEmail(participant, 'hallo', 'views/participants/bulkmail.jade');
      });
      _.forEach(unconfirmed, participant => {
        mails.sendStatusEmail(participant, 'hallo', 'views/participants/bulkmail.jade');
      });
      deferred.resolve();
    });
  }).fail(deferred.reject);

  return deferred.promise;
};

module.exports = participants;
