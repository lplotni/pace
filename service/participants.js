/* jshint node: true */
'use strict';

var pg = require('pg');
var connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || "tcp://vagrant@localhost/pace";

function getAll(tempCallback) {
    var participants = [];
    pg.connect(connectionString,function (err, client, done) {
            var query = client.query('select * from participants order by firstname,lastname');
            query.on('row', function (row) {
                participants.push(row);
            });

            query.on('end', function () {
                client.end();
                tempCallback(participants);
            });
        }
    );
}

module.exports = {
    getAll: getAll
};
