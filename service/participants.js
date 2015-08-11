var pg = require('pg');
var connectionString = process.env.DATABASE_URL || "tcp://vagrant@localhost/pace";

function getAll(tempCallback) {
    var participants = [];
    pg.connect(connectionString,function (err, client, done) {
            var query = client.query('select * from participants');

            // Stream results back one row at a time
            query.on('row', function (row) {
                console.log(row);
                participants.push(row);
            });

            // After all data is returned, close connection and return results
            query.on('end', function () {
                console.log('end got called');
                client.end();
                tempCallback(participants);
            });
        }
    )

}

module.exports = {
    getAll: getAll
};
