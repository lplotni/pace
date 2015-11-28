var webdriverio = require('webdriverio');
var pg = require('pg');

var originalTimeout;

var options = {
  desiredCapabilities: {
    browserName: 'phantomjs'
  }
};

var journeyHelper = {};

journeyHelper.paceUrl = process.env.PACE_URL || 'http://localhost:3000/';

journeyHelper.setUpClient = function () {
  return webdriverio.remote(options).init();
};

journeyHelper.changeOriginalTimeout = function () {
  originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
};

journeyHelper.resetToOriginalTimeout = function () {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
};

journeyHelper.setupDbConnection = function (done) {
  var connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || 'tcp://vagrant@localhost/pace';
  var jasmineDone = done;

  pg.connect(connectionString, function (err, client, done) {
      function errorFunction(error) {
        console.error('DB statement problem: ', error);
        done();
        jasmineDone();
      }

      if (err) {
        errorFunction(err);
      } else {
        var deleteShirts = client.query('delete from tshirts');
        deleteShirts.on('end', function () {
          var deleteParticipants = client.query('delete from participants');
          deleteParticipants.on('end', function () {
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
