/* jshint node: true */
/* jshint esnext: true */
'use strict';


const router = require('express').Router();

/* GET home page. */
router.get('/', (req, res) =>
  res.render('index', { title: 'Pace' })
);

module.exports = router;
