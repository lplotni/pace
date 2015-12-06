var router = require('express').Router();
var participants = require('../service/participants');
var participant = require('../domain/participant');
var editUrlGenerator = require('../domain/editUrlGenerator');

router.get('/', function(req, res) {
    var participantId = editUrlGenerator.getIdFromEncryptedUrl(req.query.edit);
    participants.getFullInfoById(participantId).then(function (participant) {
        res.render('participants/editParticipant', { participant: participant, participantid: participantId });
    }).catch(function () {
        res.render('error', {message: "Teilnehmer nicht bekannt", error: { status: "Möglicherweise wurde ein falscher Link verwendet" }} );
    });
});

router.post('/', function(req, res) {
    var currentParticipant = participant.from(req.body);
    var id = req.body.participantid;
    participants.update(currentParticipant, id)
        .then(function () {
            res.render('participants/success', { name: req.body.firstname + ' ' + req.body.lastname });
        })
        .catch(function () {
            res.render('error', {message: "Es ist ein Fehler aufgetreten", error: { status: "Bitte versuche es nochmal" }} );
        });
});

module.exports = router;
