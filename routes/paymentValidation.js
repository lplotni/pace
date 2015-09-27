/* jshint node: true */
'use strict';

var router = require('express').Router();

var pg = require('pg');
var connectionString = process.env.DATABASE_URL || "tcp://vagrant@localhost/pace";

router.get('/', function (req, res) {
    res.render('paymentValidation/paymentValidation', {});
});

router.post('/', function(req, res) {
    try{
        var paymentToken = req.body.paymenttoken;
        var participantDetails;

        pg.connect(connectionString,function(err,client){

            var query = client.query(
              "SELECT firstname, lastname FROM participants WHERE paymenttoken = $1", [paymentToken]);

            query.on('row', function(row) {
                participantDetails = {
                    name : row.lastname + ", " + row.firstname,
                    amount: '10'
                };
            });

            query.on('end', function(result) {
                client.end();
                if (result.rowCount > 0) {
                    return res.render('paymentValidation/paymentValidation', {
                        token: paymentToken,
                        name: participantDetails.name,
                        amount: participantDetails.amount
                    });
                } else {
                    return res.render('paymentValidation/paymentValidation', {
                        token: paymentToken,
                        error: 'Es konnte keine Registrierung mit Token ' + paymentToken + ' gefunden werden.'
                    });
                }
            });
        });

    } catch (err) {
        res.send(err.message);
    }
});

module.exports = router;
