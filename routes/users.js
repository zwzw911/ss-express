var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/api', function(req, res, next) {
  //res.send('respond with a resource');
  //next();
  res.render('api', { title: 'user/api' })
});
//router.post('/checkUser', function(req, res, next) {
//  console.log(req);
//  next();
//  //res.send('respond with a resource');
//});
module.exports = router;
