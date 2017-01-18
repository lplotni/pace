/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const isAuthenticated = require('../../acl/authentication');

router.post('/', isAuthenticated, (req, res) => {
      res.render('admin/statement-import', {});
  });

module.exports = router;
