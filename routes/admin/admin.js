/* jshint node: true */
/* jshint esnext: true */
'use strict';


const router = require('express').Router();
const accesscontrol = require('../../acl/accesscontrol');
const isAuthenticated = require('../../acl/authentication');

var canViewAdminPage = function (role) {
  return accesscontrol.hasPermissionTo(role, 'view admin page');
}

router.get('/', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    res.render('admin', {title: 'Pace Admin-Bereich'});
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
