/* jshint node: true */
/* jshint esnext: true */
/* global jasmine */
'use strict';

const webdriverio = require('webdriverio');
const pg = require('pg');

let originalTimeout;

let options = {
  desiredCapabilities: {
    browserName: 'phantomjs'
  }
};

let journeyHelper = {};

journeyHelper.paceUrl = process.env.PACE_URL || 'http://localhost:3000/';

journeyHelper.setUpClient = function () {
  return webdriverio.remote(options).init();
};

journeyHelper.changeOriginalTimeout = function () {
  originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
};

journeyHelper.resetToOriginalTimeout = function () {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
};

journeyHelper.setupDbConnection = function (done) {
  let connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || 'tcp://vagrant@localhost/pace';
  let jasmineDone = done;

  pg.connect(connectionString,  (err, client, done) => {
      function errorFunction(error) {
        console.error('DB statement problem: ', error);
        done();
        jasmineDone();
      }

      if (err) {
        errorFunction(err);
      } else {
        let deleteShirts = client.query('delete from tshirts');
        deleteShirts.on('end',  () => {
          let deleteParticipants = client.query('delete from participants');
          deleteParticipants.on('end', () => {
            done();
            jasmineDone();
          });
          deleteParticipants.on('error', errorFunction);
        });
        deleteShirts.on('error', errorFunction);
      }
    }
  );
};

module.exports = journeyHelper;
