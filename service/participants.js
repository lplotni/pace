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

var connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || 'tcp://vagrant@localhost/pace';

var service = {};

service._nodemailer = nodemailer;

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
      'insert into participants (firstname, lastname, email, category, birthyear, team, paymenttoken) values($1, $2, $3, $4, $5, $6, $7) returning id',
      [participant.firstname, participant.lastname, participant.email, participant.category, participant.birthyear, participant.team, paymentToken],
      function (err, res) {
        done();
        if (!err) {
          deferred.resolve(res.rows[0].id);
        } else {
          deferred.reject(err);
        }
      }
    );
  });

  return deferred.promise;
};

service.update = function (participant, id ) {
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
  var deferred = Q.defer();

  pg.connect(connectionString, function (err, client, done) {
    client.query(
      'insert into tshirts (size, model, participantId) values($1, $2, $3)',
      [tshirt.size, tshirt.model, participantId],
      function (err, res) {
        done();
        if (!err) {
          deferred.resolve(res.oid);
        } else {
          deferred.reject(err);
        }
      }
    );
  });

  return deferred.promise;

};

service.getTShirts = function () {
  var deferred = Q.defer();
  const tshirts = [];

  pg.connect(connectionString, function (err, client, done) {
    var query = client.query('SELECT * FROM tshirts');

    query.on('row', function (row) {
      tshirts.push(row);
    });

    query.on('error', function () {
      done();
      deferred.reject();
    });

    query.on('end', function () {
      done();
      deferred.resolve(tshirts);
    });
  });

  return deferred.promise;
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

// select * from participant -> should return participant with tshirt

service.getByToken = function (paymentToken) {
  var deferred = Q.defer();
  var participantDetails;

  pg.connect(connectionString, function (err, client, done) {
    var query = client.query(
      'SELECT id, firstname, lastname FROM participants WHERE paymenttoken = $1', [paymentToken]);

    query.on('row', function (row) {
      participantDetails = {
        name: row.lastname + ', ' + row.firstname,
        amount: calculator.priceFor(row),
        id: row.id
      };
    });

    query.on('error', function () {
      done();
      deferred.reject();
    });

    query.on('end', function (result) {
      if (result.rowCount > 0) {
        var tshirtsJoin = client.query('SELECT * from tshirts where participantid = $1', [participantDetails.id]);
        tshirtsJoin.on('row', function (row) {
          participantDetails.tshirt = row;
        });
        tshirtsJoin.on('end', function () {
          done();
          deferred.resolve(participantDetails);
        });
        tshirtsJoin.on('error', function () {
          done();
          deferred.reject({error: 'Es konnte keine Tshirt-Informationen zum Token ' + paymentToken + ' gefunden werden.'})
        })
      } else {
        done();
        deferred.reject({error: 'Es konnte keine Registrierung mit Token ' + paymentToken + ' gefunden werden.'});
      }
    });
  });

  return deferred.promise;
};

service.getById = function (id) {
  var deferred = Q.defer();
  var participantDetails;

  pg.connect(connectionString, function (err, client, done) {
    var query = client.query(
      'SELECT id, firstname, lastname, email FROM participants WHERE id = $1', [id]);

    query.on('row', function (row) {
      participantDetails = {
        name: row.firstname,
        email: row.email
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
        deferred.reject({error: 'Es konnte keine Registrierung mit Id ' + id + ' gefunden werden.'});
      }
    });
  });

  return deferred.promise;
};

service.getFullInfoById = function (id) {
  var deferred = Q.defer();
  var participantDetails;

  pg.connect(connectionString, function (err, client, done) {
    var query = client.query(
      'SELECT * FROM participants WHERE id = $1', [id]);

    query.on('row', function (row) {
      participantDetails = row;
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
        deferred.reject({error: 'Es konnte keine Registrierung mit Id ' + id + ' gefunden werden.'});
      }
    });
  });

  return deferred.promise;
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
