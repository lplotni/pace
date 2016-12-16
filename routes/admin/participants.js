/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Q = require('q');
const router = require('express').Router();
const accesscontrol = require('../../acl/accesscontrol');
const isAuthenticated = require('../../acl/authentication');
const participants = require('../../service/participants');
const tshirts = require('../../service/tshirts');
const editUrlHelper = require('../../domain/editUrlHelper');
const costCalculator = require('../../domain/costCalculator');
const mails = require('../../service/util/mails');


//TODO Move those 2 method out of the Ctrl.
let addEditUrlTo = (participants) => {
  participants.map(participant => {
    participant.editUrl = editUrlHelper.generateUrlForAdmin(participant.secureid);
    return participant;
  });
};

let addAmountTo = (participants) => {
  participants.map((participant) => {
    participant.amount = costCalculator.priceFor(participant);
    return participant;
  });
};


router.get('/', isAuthenticated, (req, res) => {
  participants.get.all().then(allParticipants => {
    addEditUrlTo(allParticipants);
    Q.all(allParticipants.map(tshirts.findAndAddTo))
      .then(() => {
          addAmountTo(allParticipants);
          res.render('admin/list', {participants: allParticipants});
      });
  });
});

router.post('/resend-mail', isAuthenticated, (req, res) => {
  participants.byId(req.body.participantid).then((participant) => {
    // TODO: refactor to server
    mails.sendStatusEmail(participant, 'Lauf gegen Rechts 2016 - Infos zum Lauf', 'views/participants/bulkmail.pug');
    res.render('admin/sentMail');
  });
});

module.exports = router;
