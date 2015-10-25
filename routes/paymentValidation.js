/* jshint node: true */
'use strict';

var router = require('express').Router();
var participants = require('../service/participants');
var accesscontrol = require("../acl/accesscontrol");

var userRole = 'admin';

router.get('/', function (req, res) {
    if(canAccess(userRole)) {
        res.render('paymentValidation/paymentValidation', {});
    } else {
        var result = {
            message: 'Bitte anmelden',
            error: {
                status: 'Nur Administratoren können diese Seite einsehen'
            }
        };
        res.render('error', result);
    }
});

router.post('/', function(req, res) {
    if(canAccess(userRole)) {
        var paymentToken = req.body.paymenttoken;

        participants.getByToken(paymentToken)
            .then(function (result) {
                return res.render('paymentValidation/paymentValidation', {
                    token: paymentToken,
                    name: result.name,
                    amount: result.amount,
                    participantid: result.id
                });
            })
            .catch(function (result) {
                return res.render('paymentValidation/paymentValidation', {
                    token: paymentToken,
                    error: result.error
                });
            });
    }
});

router.post('/confirm', function(req, res) {
    if(canAccess(userRole)) {
        participants.confirmParticipant(req.body.participantid)
            .then(function () {
                res.render('paymentValidation/paymentValidation', {
                    success_message: "Der Teilnehmer wurde bestätigt",
                    token: req.body.paymenttoken,
                    name: req.body.name,
                    amount: req.body.amount,
                    participantid: req.body.participantid
                });
            })
            .catch(function () {
                res.render('paymentValidation/paymentValidation', {
                    error: "Fehler: Der Teilnehmer konnte nicht bestätigt werden",
                    token: req.body.paymenttoken,
                    name: req.body.name,
                    amount: req.body.amount,
                    participantid: req.body.participantid
                });
            });
    }
});

var canAccess = function(userRole) {
    var accessControlCheckResult = false;
    accesscontrol.check(userRole, "confirm payment validation", function(err, result){
        accessControlCheckResult = result;
    });
    return accessControlCheckResult;
};

module.exports = {
    router: router,
    canAccess: canAccess
};

