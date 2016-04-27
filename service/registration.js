/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Q = require('q');
const _ = require('lodash');
const pug = require('pug');

const config = require('config');
const calculator = require('../domain/costCalculator');
const db = require('../service/util/dbHelper');
const mails = require('../service/util/mails');
const participants = require('../service/participants');
const couponcodes = require('../service/couponcodes');
const startNumbers = require('../service/startNumbers');
const tokens = require('../service/tokens');
const tshirts = require('../service/tshirts');

const editUrlHelper = require('../domain/editUrlHelper');

const registration = {};
registration.isClosed = () => {
  return db.select("SELECT data->>'is_closed' as is_closed FROM race;")
    .then(result => {
      return result[0].is_closed === 'true';
    });
};

registration.close = () => {
  return db.update("UPDATE race SET data = jsonb_set(data, '{is_closed}', 'true');");
};

registration.reopen = () => {
  return db.update("UPDATE race SET data = jsonb_set(data, '{is_closed}', 'false');");
};

registration.confirm = function (participantId) {
  const deferred = Q.defer();

  participants.markPayed(participantId)
    .then(() => {
      participants.byId(participantId)
        .then(result => {
          pug.renderFile('views/admin/paymentValidation/text.pug',
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

function sendConfirmationMail(participant, paymentToken) {
  pug.renderFile('views/registration/confirmationText.pug',
    {
      name: participant.firstname,
      token: paymentToken,
      bank: config.get('contact.bank'),
      amount: calculator.priceFor(participant),
      editUrl: editUrlHelper.generateUrl(participant.secureID),
      startnr: participant.start_number
    },
    (error, html) => {
      mails.sendEmail(participant.email, 'Lauf Gegen Rechts: Registrierung erfolgreich', html, error);
    }
  );
}
registration.start = function (participant) {
  const deferred = Q.defer();
  var resultPromise = couponcodes.validateCode(participant.couponcode, participant.discount);
  resultPromise.then(isValidCode => {
    if (isValidCode) {
      tokens.createUnique().then((paymentToken) => {
        startNumbers.next().then((nr) => {
          let p = participant
            .withToken(paymentToken)
            .withSecureId(editUrlHelper.generateSecureID())
            .withStartNr(nr);
          participants.save(p)
            .then(id => {
              if (!_.isEmpty(p.tshirt)) {
                tshirts.addFor(p.tshirt, id);
              }

              if (calculator.priceFor(p) === 0) {
                participants.markPayed(id);
              }
              sendConfirmationMail(p, paymentToken);
              deferred.resolve({'id': id, 'token': paymentToken, secureid: p.secureID, startnr: p.start_number});

              couponcodes.markAsUsed(participant.couponcode);
            })
            .fail(deferred.reject);
        });
      }).fail(deferred.reject);
    } else {
      deferred.reject(new TypeError('Ungültiger Couponcode'));
    }
  });

  return deferred.promise;
};

module.exports = registration;
