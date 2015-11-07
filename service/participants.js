/* jshint node: true */
'use strict';

var pg = require('pg');
var Q = require('q');
var nodemailer = require('nodemailer');
var sendmailTransport = require('nodemailer-sendmail-transport');

var connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || 'tcp://vagrant@localhost/pace';

var service = {};

service.getAllWithPaymentStatus = function (paymentStatus) {
  var querystring = '';
  if (typeof paymentStatus !== 'undefined') {
    querystring = 'select * from participants where has_payed=' + paymentStatus + ' order by firstname,lastname';
  } else {
    querystring = 'select * from participants order by firstname,lastname';
  }
  var participants = [];
  var deferred = Q.defer();

  pg.connect(connectionString, function (err, client, done) {
      var query = client.query(querystring);
      query.on('row', function (row) {
        participants.push(row);
      });

    query.on('error', function () {
        done();
        deferred.reject();
      });

      query.on('end', function () {
        done();
        deferred.resolve(participants);
      });
    }
  );
  return deferred.promise;
};

service.getRegistered = function () {
  return service.getAllWithPaymentStatus(false);
};

service.getConfirmed = function () {
  return service.getAllWithPaymentStatus(true);
};

service.save = function (participant, paymentToken) {
  var deferred = Q.defer();

  pg.connect(connectionString, function (err, client, done) {
    client.query(
      'insert into participants (firstname, lastname, email, gender, birthyear, team, paymenttoken) values($1, $2, $3, $4, $5, $6, $7)',
      [participant.firstname, participant.lastname, participant.email, participant.gender, participant.birthyear, participant.team, paymentToken],
      function (err, res) {
        done();
        if (!err) {
          deferred.resolve(res);
        } else {
          deferred.reject(err);
        }
      }
    );
  });

  return deferred.promise;
};

service.register = function (participant, paymentToken) {
  var deferred = Q.defer();

  service.save(participant, paymentToken)
    .then(function () {
      service.sendEmail(participant.email, 'HELLO');
      deferred.resolve();
    })
    .fail(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

service.getByToken = function (paymentToken) {
  var deferred = Q.defer();
  var participantDetails;

  pg.connect(connectionString, function (err, client, done) {
    var query = client.query(
      'SELECT id, firstname, lastname FROM participants WHERE paymenttoken = $1', [paymentToken]);

    query.on('row', function (row) {
      participantDetails = {
        name: row.lastname + ', ' + row.firstname,
        amount: '10',
        id: row.id
      };
    });

    query.on('error', function () {
      done();
      deferred.reject();
    });

    query.on('end', function (result) {
      done();
      if (result.rowCount > 0) {
        deferred.resolve(participantDetails);
      } else {
        deferred.reject({error: 'Es konnte keine Registrierung mit Token ' + paymentToken + ' gefunden werden.'});
      }
    });
  });

  return deferred.promise;
};

service.getIdFor = function (participant) {
  var deferred = Q.defer();
  var participantId;

  pg.connect(connectionString, function (err, client, done) {
    var query = client.query(
      'SELECT id FROM participants WHERE firstname = $1 AND lastname = $2 AND email = $3',
      [participant.firstname, participant.lastname, participant.email]);

    query.on('row', function (row) {
      participantId = row.id;
    });

    query.on('error', function () {
      done();
      deferred.reject();
    });

    query.on('end', function (result) {
      done();
      if (result.rowCount > 0) {
        deferred.resolve(participantId);
      } else {
        deferred.reject('No participant found with these details');
      }
    });
  });

  return deferred.promise;
};

service.confirmParticipant = function (participantId) {
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

service.sendEmail = function (address, text) {
  var transporter = nodemailer.createTransport(sendmailTransport({
    path: '/usr/sbin/sendmail'
  }));
  transporter.sendMail({
    from: 'info@lauf-gegen-rechts.de',
    to: address,
    subject: 'Registrierungsbestätigung',
    text: 'This is a HTML only Email',
    html: text
  });
};

module.exports = service;
