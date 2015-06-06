var express = require('express');
var router = express.Router();
var cookieSessionClass=require('../public/javascripts/express_component/cookieSession');

var instMongo=require('../public/javascripts/model/dbConnection.js');
//var Schema=mongoose.schema;
var mongoose=instMongo.mongoose;
var userSch=new mongoose.Schema({
  name:{type:String,index:true},
  password:String
},{
  autoIndex:false
});
var user=mongoose.model("user",userSch);
/* GET home page. */
router.get('/', function(req, res, next) {
  //res.cookie('f',1,cookieSessionClass.cookieOptions);
  req.session.state=0;//state:0=first get page;1=login done
  res.render('index', { title: 'Express' });
//next();
//  res.redirect('../users/api');

});
router.post('/checkUser', function(req, res, next) {
  /*res.cookie('f',1,cookieSessionClass.cookieOptions);
   req.session.num=1;*/
  //console.log('index.js 2 app');
  if(req.session.test==undefined){
    res.redirect('../users/api');
    return;
    //res.redirect(301,'http://www.baidu.com');
  }else {
    //console.log(req.session.test);
    var postUserName = req.body.name;
    //console.log(postUserName);


    //var instUser=new user({name:'test',password:'test'});
    //instUser.save(function(err){console.log(err)});
    user.count({'name': postUserName}, function (err, result) {
      if (err) {
        res.json({rc: 1, msg: '用户检查失败'})
      }
      //console.log(result);
      var userExists;
      if (result > 0) {
        userExists = true
      }
      else {
        userExists = false
      }
      ;
      res.json({rc: 0, exists: userExists});
    });
  }
  //res.json({ rc:0});
});
//
//router.get('/checkUser', function(req, res, next) {
//  var instMongo=require('../public/javascripts/model/dbConnection.js');
//})
module.exports = router;
