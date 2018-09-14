/* jshint node: true */
/* jshint esnext: true */
'use strict';


const router = require('express').Router();

router.get('/', (req, res) => {
  res.render('index', {})
  console.log(res);
}
);

module.exports = router;
