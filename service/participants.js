/* jshint node: true */
/* jshint esnext: true */
'use strict';

var pg = require('pg');
var Q = require('q');
const _ = require('lodash');
var nodemailer = require('nodemailer');
var sendmailTransport = require('nodemailer-sendmail-transport');
var config = require('config');
const calculator = require('../domain/costCalculator');
const db = require('../service/dbHelper')

var connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || 'tcp://vagrant@localhost/pace';

var service = {};

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

service.save = function (participant, paymentToken) {
  return db.insert('insert into participants (firstname, lastname, email, category, birthyear, team, paymenttoken) values($1, $2, $3, $4, $5, $6, $7) returning id',
    [participant.firstname, participant.lastname, participant.email, participant.category, participant.birthyear, participant.team, paymentToken]);
};

service.update = function (participant, id) {
  var deferred = Q.defer();

  pg.connect(connectionString, function (err, client, done) {
    client.query(
      'UPDATE participants SET (firstname, lastname, email, category, birthyear, team) = ($1, $2, $3, $4, $5, $6) WHERE id = $7',
      [participant.firstname, participant.lastname, participant.email, participant.category, participant.birthyear, participant.team, id],

      function (err) {
        done();
        if (!err) {
          deferred.resolve(id);
        } else {
          deferred.reject(err);
        }
      }
    );
  });

  return deferred.promise;
};

service.addTShirt = function (tshirt, participantId) {
  return db.insert('insert into tshirts (size, model, participantId) values($1, $2, $3) returning id',
    [tshirt.size, tshirt.model, participantId]);
};

service.getTShirts = function () {
  return db.select('SELECT * FROM tshirts');
};

service.register = function (participant, paymentToken) {
  var deferred = Q.defer();
  var jade = require('jade');
  service.save(participant, paymentToken)
    .then(function (id) {
      if (!_.isEmpty(participant.tshirt)) {
        service.addTShirt(participant.tshirt, id);
      }
      jade.renderFile('views/registration/success.jade', {
        name: participant.firstname,
        token: paymentToken,
        amount: config.get('costs.standard')
      }, function (error, html) {
        service.sendEmail(participant.email, 'Lauf Gegen Rechts: Registrierung erfolgreich', html);
      });
      deferred.resolve(id);
    })
    .fail(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

service.getByToken = function (paymentToken) {
  return db.select('SELECT id, firstname, lastname FROM participants WHERE paymenttoken = $1', [paymentToken])
    .then(function (result) {
      if (_.isEmpty(result)) {
        throw new Error('Es konnte keine Registrierung mit Token ' + paymentToken + ' gefunden werden.');
      }
      return result;
    })
    .then(function (result) {
      return {
        name: result[0].lastname + ', ' + result[0].firstname,
        amount: calculator.priceFor(result[0]),
        id: result[0].id
      }
    })
    .then(function (participantDetails) {
        return db.select('SELECT * from tshirts where participantid = $1', [participantDetails.id])
          .then(function (result) {
            participantDetails.tshirt = result[0];
            return participantDetails;
          })
      }
    );
};

service.getById = function (id) {
  return db.select('SELECT id, firstname, lastname, email FROM participants WHERE id = $1', [id])
    .then(function (result) {
      if (_.isEmpty(result)) {
        throw new Error('Es konnte kein Teilnehmer mit ID: ' + id + ' gefunden werden.');
      }
      return result;
    })
    .then(function (result) {
      return {
        name: result[0].firstname,
        email: result[0].email
      };
    });
};

service.getFullInfoById = function (id) {
  return db.select('SELECT * FROM participants WHERE id = $1', [id])
    .then(function (result) {
      if (_.isEmpty(result)) {
        throw new Error('No participant found');
      }
      return result;
    })
    .then(function (result) {
      return result[0];
    });
};

service.markPayed = function (participantId) {
  var deferred = Q.defer();
  pg.connect(connectionString, function (err, client, done) {
    var query = 'update participants SET has_payed = true WHERE id = ' + participantId;
    client.query(query,
      function (err, res) {
        done();
        if (!err) {
          if (res.rowCount > 0) {
            deferred.resolve();
          } else {
            deferred.reject();
          }
        } else {
          deferred.reject(err);
        }
      }
    );
  });

  return deferred.promise;
};

service.confirmParticipant = function (participantId) {
  var deferred = Q.defer();
  var jade = require('jade');
  service.markPayed(participantId)
    .then(function () {
      service.getById(participantId)
        .then(function (result) {
          jade.renderFile('views/paymentValidation//success.jade', {name: result.name}, function (error, html) {
            service.sendEmail(result.email, 'Lauf gegen Rechts: Zahlung erhalten', html);
          });
        });
      deferred.resolve();
    })
    .fail(function (err) {
      deferred.reject(err);
    });
  return deferred.promise;
};

service.sendEmail = function (address, subject, text) {
  var transporter = service._nodemailer.createTransport(sendmailTransport({
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
