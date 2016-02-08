/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const accesscontrol = require('../../acl/accesscontrol');
const isAuthenticated = require('../../acl/authentication');

let canViewAdminPage = function (role) {
  return accesscontrol.hasPermissionTo(role, 'view admin page');
};

router.get('/', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    let admininfo = require('../../service/admininfo');
    admininfo.getShirtOrders().then(orders =>
      admininfo.getConfirmedParticipants().then(confirmed =>
        admininfo.getUnonfirmedParticipants().then(unconfirmed =>
          res.render('admin/admin', {orders, confirmed ,unconfirmed, isAdmin: true}))));
  } else {
    res.render('error', {
      message: 'Bitte anmelden',
      error: {
        status: 'Nur Administratoren können diese Seite einsehen'
      }
    });
  }
});

module.exports = router;
