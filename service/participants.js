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

function save(participant) {
    var deferred = Q.defer();
    pg.connect(connectionString, function (err, client, done) {
        client.query(
            "insert into participants (firstname, lastname, email) values($1, $2, $3)", [participant.firstname, participant.lastname, participant.email],
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

function getByToken(paymentToken, callback) {
  pg.connect(connectionString,function(err,client){
    var participantDetails;

    var query = client.query(
      "SELECT firstname, lastname FROM participants WHERE paymenttoken = $1", [paymentToken]);

    query.on('row', function(row) {
      participantDetails = {
        name : row.lastname + ", " + row.firstname,
        amount: '10'
      };
    });

    return query.on('end', function(result) {
      client.end();
      if (result.rowCount > 0) {
        callback(participantDetails);
      } else {
        callback({error: 'Es konnte keine Registrierung mit Token ' + paymentToken + ' gefunden werden.'});
      }
    });
  });
}

function create(firstname, lastname, email, paymentToken, callback) {
  pg.connect(connectionString,function(err,client){
    client.query(
      "insert into participants (firstname, lastname, email, paymenttoken) values($1, $2, $3, $4)",[firstname, lastname, email, paymentToken],
      function (err, res) {
        console.log('Executed');
        if (! err) {
          console.log("result:" , res);
          client.end();
          callback();
          return "inserted";
        }
      }
    );
  });
}

module.exports = {
    getRegistered: getRegistered,
    getConfirmed: getConfirmed,
    save: save,
    getAll: getAll,
    create: create,
    getByToken: getByToken
};
