/* jshint node: true */
'use strict';

var pg = require('pg');
var _ = require('lodash');
var Q = require('q');

var connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || "tcp://vagrant@localhost/pace";

function getAllWithPaymentStatus(payment_status) {
  var querystring='';
  if (payment_status){
    querystring='select * from participants where has_payed='+payment_status+' order by firstname,lastname';
  } else {
    querystring='select * from participants order by firstname,lastname';
  }
  var participants = [];
  var deferred = Q.defer();

  pg.connect(connectionString, function (err, client, done) {
      var query = client.query(querystring);
      query.on('row', function (row) {
        participants.push(row);
      });

      query.on('error', function() {
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
}

function getRegistered() {
  return getAllWithPaymentStatus(false);
}

function getConfirmed() {
  return getAllWithPaymentStatus(true);
}

function save(participant, paymentToken) {
    var deferred = Q.defer();
    pg.connect(connectionString, function (err, client, done) {
        client.query(
            "insert into participants (firstname, lastname, email, paymenttoken) values($1, $2, $3, $4)", [participant.firstname, participant.lastname, participant.email, paymentToken],
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
}

function getByToken(paymentToken) {
  var deferred = Q.defer();
  var participantDetails;

  pg.connect(connectionString, function(err, client, done){
    var query = client.query(
      "SELECT firstname, lastname FROM participants WHERE paymenttoken = $1", [paymentToken]);

    query.on('row', function(row) {
      participantDetails = {
        name : row.lastname + ", " + row.firstname,
        amount: '10'
      };
    });

    query.on('error', function() {
      done();
      deferred.reject();
    });

    query.on('end', function(result) {
      done();
      if (result.rowCount > 0) {
        deferred.resolve(participantDetails);
      } else {
        deferred.reject({error: 'Es konnte keine Registrierung mit Token ' + paymentToken + ' gefunden werden.'});
      }
    });
  });

  return deferred.promise;
}

module.exports = {
  getRegistered: getRegistered,
  getConfirmed: getConfirmed,
  save: save,
  getByToken: getByToken
};
