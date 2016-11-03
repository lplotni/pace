/* jshint node: true */
/* jshint esnext: true */
'use strict';

const pg = require('pg');
const Q = require('q');

const connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || 'tcp://pgtester:pgtester@localhost/pace';

let db = {};

db.select = (querystring, params) => {
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

db.selectForDataTables = (queries, search, modifier) => {
  const allRecords = db.select(queries.totalQuery.build());
  const lsearch = search + '%';
  const filteredRecords = db.select(queries.filterQuery.build(), [lsearch]);
  const pagedSelect = db.select(queries.pagedQuery.build(), [lsearch]);

  let deferredPageSelect = Q.defer();
  if(modifier) {
    pagedSelect.then(result => modifier(result, deferredPageSelect)).catch(deferredPageSelect.reject);
  } else {
    deferredPageSelect = {promise: pagedSelect};
  }

  return Q.all([allRecords, filteredRecords, deferredPageSelect.promise]).then((data) => {
      return {
        numberOfAllRecords: parseInt(data[0][0].count),
        numberOfRecordsAfterFilter: parseInt(data[1][0].count),
        records: data[2],
      };
    }
  );
};

db.delete = (querystring, params) => db.select(querystring, params);

db.insert = (insertString, params) => {
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

db.update = (updateString, params) => {
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
