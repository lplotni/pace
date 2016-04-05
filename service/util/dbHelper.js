/* jshint node: true */
/* jshint esnext: true */
'use strict';

const pg = require('pg');
const Q = require('q');

const connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || 'tcp://pgtester:pgtester@localhost/pace';

let db = {};

db.select = function (querystring, params) {
  let results = [];
  const deferred = Q.defer();

  pg.connect(connectionString, (err, client, done) => {
      let query = client.query(querystring, params);

      query.on('row', row => results.push(row));
      query.on('error', (e) => {
        done();
        deferred.reject(e);
      });
      query.on('end', () => {
        done();
        deferred.resolve(results);
      });
    }
  );
  return deferred.promise;
};

db.insert = function (insertString, params) {
  const deferred = Q.defer();

  pg.connect(connectionString, (err, client, done) => {
    client.query(insertString, params,
      (err, res) => {
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

db.update = function (updateString, params) {
  const deferred = Q.defer();

  pg.connect(connectionString, (err, client, done) => {
    client.query(updateString, params,
      (err, res) => {
        done();
        if (!err) {
          deferred.resolve(res.rowCount);
        } else {
          deferred.reject(err);
        }
      }
    );
  });

  return deferred.promise;
};

module.exports = db;
