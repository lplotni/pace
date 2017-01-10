/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Q = require('q');
const _ = require('lodash');
const router = require('express').Router();
const accesscontrol = require('../../acl/accesscontrol');
const isAuthenticated = require('../../acl/authentication');
const pdfGeneration = require('../../pdf/pdfGeneration');
const registration = require('../../service/registration');
const stats = require('../../service/stats');
const participants = require('../../service/participants');

let canViewAdminPage = (role) => accesscontrol.hasPermissionTo(role, 'view admin page');

let renderNotAllowed = (res) => res.render('error', {
  message: 'Bitte anmelden',
  error: {
    status: 'Nur Administratoren können diese Seite einsehen'
  }
});

router.get('/', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    Q.allSettled(
      [stats.shirtOrders(), stats.confirmedParticipantsCount(), stats.unconfirmedParticipantsCount()])
      .then((results) => {
        let r = results.map(r => r.value);
        participants.get.blancParticipants().then((blancParticipants) => {
          res.render('admin/admin', {
              orders: r[0],
              confirmed: r[1],
              unconfirmed: r[2],
              numBlancParticipants: blancParticipants.length,
              registrationsData: [10, 2, 30, 50, 2], //TODO use the data returned by the stats service
              confirmationsData: [0, 0, 0, 40, 5],
              labels: ['1. Jan', '2. Jan', '3. Jan', '4. Jan', '5. Jan']
            }
          );
        });
      });
  } else {
    renderNotAllowed(res);
  }
});

router.get('/generate-start-numbers', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    pdfGeneration.generateRegistered(res);
  }
});

router.post('/generate-on-site-start-numbers', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    participants.saveBlancParticipants(_.toInteger(req.body.amountOnSite)).then(() => {
      pdfGeneration.generateOnSite(res);
    });
  }
});

router.get('/bulkmail', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    participants.bulkmail().then(result =>
      res.render('admin/bulkmail', {count: result})
    );
  } else {
    renderNotAllowed(res);
  }
});

router.post('/close-registration', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    registration.close().then(() =>
      res.render('admin/closeRegistration/success')
    );
  }
});

router.post('/reopen-registration', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    registration.reopen().then(() =>
      res.redirect('/admin')
    );
  }
});

module.exports = router;
