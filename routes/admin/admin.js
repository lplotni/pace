/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Q = require('q');
const router = require('express').Router();
const accesscontrol = require('../../acl/accesscontrol');
const isAuthenticated = require('../../acl/authentication');
const pdfGeneration = require('../../pdf/pdfGeneration');
const registration = require('../../service/registration');
const participants = require('../../service/participants');
const stats = require('../../service/stats');

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
        res.render('admin/admin', {orders: r[0], confirmed: r[1], unconfirmed: r[2], isAdmin: true});
      });
  } else {
    renderNotAllowed(res);
  }
});

router.get('/generate-start-numbers', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    pdfGeneration.generate(res);
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
      res.render('admin/closeRegistration/success', {isAdmin: true})
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
