/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Pool = require('pg').Pool;
const pgTypes = require('pg').types;
const Q = require('q');
const moment = require('moment');
const connectionString = process.env.DATABASE_URL || 'tcp://pgtester:pgtester@localhost/pace';

pgTypes.setTypeParser(1114, str => moment.utc(str).format());
let db = {};
let pool = new Pool({
    connectionString: connectionString
});

db.query = (querystring, params) => {
  return pool.connect().then(client => {
      return client.query(querystring, params).then(res => {
          client.release();
          return res;
      }).catch(err => {
          client.release();
          throw err;
      })
  }).catch(err => {
      console.log("Error when connecting to pool: ", err);
  });
};

db.select = (queryString, params) => db.query(queryString, params).then(res => res.rows);

db.delete = (querystring, params) => db.select(querystring, params);

db.insert = (insertString, params) => db.select(insertString, params).then(rows => rows[0].id);

db.update = (updateString, params) => db.query(updateString, params).then(res => res.rowCount);

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

module.exports = db;
