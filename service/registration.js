/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Q = require('q');
const _ = require('lodash');
const jade = require('jade');

const config = require('config');
const calculator = require('../domain/costCalculator');
const db = require('../service/util/dbHelper');
const mails = require('../service/util/mails');
const participants = require('../service/participants');
const startNumbers = require('../service/startNumbers');
const tokens = require('../service/tokens');

const editUrlHelper = require('../domain/editUrlHelper');

const registration = {};
registration.isClosed = () => {
  return db.select("SELECT data->>'is_closed' as is_closed FROM registration;")
    .then( result => {
      return result[0].is_closed === 'true';
    });
};

registration.close = () => {
  return db.update("UPDATE registration SET data = jsonb_set(data, '{is_closed}', 'true');");
};

registration.reopen = () => {
  return db.update("UPDATE registration SET data = jsonb_set(data, '{is_closed}', 'false');");
};

registration.confirm = function (participantId) {
  const deferred = Q.defer();

  participants.markPayed(participantId)
    .then(() => {
      participants.getById(participantId)
        .then(result => {
          jade.renderFile('views/admin/paymentValidation/text.jade',
            {name: result.firstname, editUrl: editUrlHelper.generateUrl(result.secureid)},
            (error, html) =>
              mails.sendEmail(result.email, 'Lauf gegen Rechts: Zahlung erhalten', html, error)
          );
          deferred.resolve();
        });
    })
    .fail(err =>
      deferred.reject(err)
    );
  return deferred.promise;
};

registration.start = function (participant) {
  const deferred = Q.defer();

  tokens.createUniqueToken().then((paymentToken) => {
    startNumbers.next().then((nr) => {
      let p = participant
        .withToken(paymentToken)
        .withSecureId(editUrlHelper.generateSecureID())
        .withStartNr(nr);
      participants.save(p)
        .then(id => {
          if (!_.isEmpty(p.tshirt)) {
            participants.addTShirt(p.tshirt, id);
          }

          jade.renderFile('views/registration/text.jade',
            {
              name: p.firstname,
              token: paymentToken,
              bank: config.get('contact.bank'),
              amount: calculator.priceFor(p),
              editUrl: editUrlHelper.generateUrl(p.secureID),
              startnr: p.start_number
            },
            (error, html) => {
              mails.sendEmail(p.email, 'Lauf Gegen Rechts: Registrierung erfolgreich', html, error);
            }
          );

          deferred.resolve({'id': id, 'token': paymentToken, secureid: p.secureID, startnr: p.start_number});
        })
        .fail(deferred.reject);
    });
  }).fail(deferred.reject);

  return deferred.promise;
};

module.exports = registration;