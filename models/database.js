var pg = require('pg');
var connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || 'tcp://vagrant@localhost/pace';
pg.connect(connectionString, function (err, client, done) {
        if (!err) {
            var query = client.query (
                "create table participants (id SERIAL PRIMARY KEY, email VARCHAR(255), firstname VARCHAR(255), lastname VARCHAR(255));");
            query.on('error', function(error) {
                console.error('Could not execute the query: ', error);
                client.end();
            });
            query.on('end', function() {
                console.log('CREATE DB done');
                client.end();
            })
        } else {
            console.error('Problem with the DB connection: ', err);
            client.end();
        }
    }
);