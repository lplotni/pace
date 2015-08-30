var express = require('express');
var router = express.Router();
var _ = require('lodash');

var pg = require('pg');
var connectionString = process.env.DATABASE_URL || "tcp://vagrant@localhost/pace";

/* GET registrationRoute listing. */
router.get('/', function (req, res) {

    var participants = [];
    pg.connect(connectionString,function (err, client, done) {
            var query = client.query('select * from participants order by firstname,lastname');

            // Stream results back one row at a time
            query.on('row', function (row) {
                console.log(row);
                participants.push(row);
            });

            // After all data is returned, close connection and return results
            query.on('end', function () {
                console.log('end got called');
                client.end();
                return res.render('participants/list', {participants: participants});
            });
        }
    )
});

module.exports = router;
