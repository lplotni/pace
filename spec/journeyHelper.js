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
            if (err) {
                console.error('DB connection problem: ', err);
                done();
                jasmineDone();
            } else {
                var query = client.query('delete from participants');
                query.on('end', function () {
                    done();
                    jasmineDone();
                });
                query.on('error', function (error) {
                    console.error('DB statement problem: ', error);
                    done();
                    jasmineDone();
                });
            }
        }
    );
};

module.exports = journeyHelper;
