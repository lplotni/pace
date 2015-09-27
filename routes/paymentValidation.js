/* jshint node: true */
'use strict';

var router = require('express').Router();
var participants = require('../service/participants');

router.get('/', function (req, res) {
    res.render('paymentValidation/paymentValidation', {});
});

router.post('/', function(req, res) {
    var paymentToken = req.body.paymenttoken;

    participants.getByToken(paymentToken, function(result) {
        if(result.error) {
            return res.render('paymentValidation/paymentValidation', {
                token: paymentToken,
                error: result.error
            });
        } else {
            return res.render('paymentValidation/paymentValidation', {
                token: paymentToken,
                name: result.name,
                amount: result.amount
            });
        }
    });
});

module.exports = router;
