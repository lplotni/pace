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

module.exports = {
    getRegistered: getRegistered,
    getConfirmed: getConfirmed,
    save: save
};
