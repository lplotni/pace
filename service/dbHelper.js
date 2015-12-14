/* jshint node: true */
/* jshint esnext: true */
'use strict';

const pg = require('pg');
const Q = require('q');
const _ = require('lodash');

const connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || 'tcp://vagrant@localhost/pace';


var db = {};

db.select = function (querystring, params) {
  var results = [];
  var deferred = Q.defer();

  pg.connect(connectionString, function (err, client, done) {
      var query = client.query(querystring, params);
      query.on('row', function (row) {
        results.push(row);
      });

      query.on('error', function () {
        done();
        deferred.reject();
      });

      query.on('end', function () {
        done();
        deferred.resolve(results);
      });
    }
  );
  return deferred.promise;
};

db.insert = function (insertString, params) {
  var deferred = Q.defer();

  pg.connect(connectionString, function (err, client, done) {
    client.query(insertString, params,
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

module.exports = db;
