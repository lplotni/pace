var pg = require('pg');
var connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || 'tcp://vagrant@localhost/pace';
var client = new pg.Client(connectionString);
client.connect(
    function (err) {
        console.log(err);
        if (!err) {
            return client.query (
                "create table participants (id SERIAL PRIMARY KEY, email VARCHAR(255), firstname VARCHAR(255), lastname VARCHAR(255));",
                function (err, res) { 
                    if (! err) { 
                        console.log("result:" , res);
                        client.end();
                        return "created";
                    }
                }
            );
        }
    }
);