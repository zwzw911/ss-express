var express = require('express');
var router = express.Router();
var cookieSessionClass=require('../public/javascripts/express_component/cookieSession');

var instMongo=require('../public/javascripts/model/dbConnection');
//var Schema=mongoose.schema;
var captcha=require('../public/javascripts/express_component/captcha');
var hashCrypto=require('../public/javascripts/express_component/hashCrypt');

var mongoose=instMongo.mongoose;
var userSch=new mongoose.Schema({
  name:{type:String,index:true},
  password:String
},{
  autoIndex:false
});
var user=mongoose.model("user",userSch);

var pemFilePath='./other/key/key.pem';
/* GET home page. */
router.get('/', function(req, res, next) {
  //res.cookie('f',1,cookieSessionClass.cookieOptions);
  var cap=captcha.awesomeCaptcha;
  //var ary=captcha.get();
  //console.log(ary);
  //var text=ary[0];
  //var pic=ary[1];
  req.session.state=2;
  //res.end(pic);
  var hmacInst=hashCrypto.hmac;
  //var captcha=require('../public/javascripts/express_component');
  cap({},function(text,file){
    res.render('index', { title:hmacInst('md5','asdfasdf',pemFilePath),img:file });
    //console.log(data);
  })
  //res.render('index', { title:hmacInst('md5','asdfasdf',pemFilePath),img:pic });
  //res.render('index', { title: 'Express',img:pic });
//next();
//  res.redirect('../users/api');

});

//session.state; null=hack(no get);1=already login;2=not login
router.post('/checkUser', function(req, res, next) {
  /*res.cookie('f',1,cookieSessionClass.cookieOptions);
   req.session.num=1;*/
  //console.log('index.js 2 app');
  //res.redirect(302,'../users/api');
  //return;
  if(req.session.state==undefined){
    //res.redirect(303,'../users/api');
    //res.send('test');
    //res.render('api',{title:'test'});
    //return;
    //res.redirect(301,'http://www.baidu.com');
    //window.location.href='/users/api';
    res.json({newurl:'/users/api'});
  }else if(req.session.state===1){
    res.json({newurl:'/'});
  }else if(req.session.state===2){
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
  } else{
    res.json({newurl:'/'});
  }
  //res.json({ rc:0});
});
//
//router.get('/checkUser', function(req, res, next) {
//  var instMongo=require('../public/javascripts/model/dbConnection.js');
//})
module.exports = router;
