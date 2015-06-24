var express = require('express');
var router = express.Router();
var cookieSessionClass=require('../public/javascripts/express_component/cookieSession');

var instMongo=require('../public/javascripts/model/dbConnection');
//var Schema=mongoose.schema;
var captcha=require('../public/javascripts/express_component/awesomeCaptcha');
var hashCrypto=require('../public/javascripts/express_component/hashCrypt');

var async=require('async');

var mongoose=instMongo.mongoose;
var userSch=new mongoose.Schema({
  name:{type:String,index:true},
  password:String
},{
  autoIndex:false
});
var user=mongoose.model("user",userSch);

var captchaInfo={};
var options={};
//var genCaptcha=function(){
//  var options={};
//  var cap=captcha.awesomeCaptcha;
//  cap(options,function(text,url){
//    captchaInfo={text:text,url:url};
//  })
//}
var pemFilePath='./other/key/key.pem';

var getCaptcha=function(){
  var cap=captcha.awesomeCaptcha;
  cap({},function(text,file){
    return {text:text,url:file};
  })
};

/* GET home page. */
router.post('/regen_captcha',function(req,res,next){
  if(2===req.session.state){ //only not login, can regen
    //console.log('in2');
    var cap=captcha.awesomeCaptcha;
    cap({},function(err,text,url){
      res.json({text:text,url:url})
    })
  }
});
router.post('/loginUser',function(req,res,next){
  var name=req.body.name;
  var pwd=req.body.pwd;
  var captcha=req.body.captcha;
  if (name.length<2 || name.length>20 ){
    res.json({rc:1,msg:"用户名由2到20个字符组成"});
    return
  }
  if (pwd.length<2 || pwd.length>20 ){
    res.json({rc:1,msg:"密码由2到20个字符组成"});
    return;
  }
  if(captcha!=req.session.captcha){
    res.json({rc:1,msg:"验证码不正确"});
    return;
  }
  userSch.count({'name':name,'password':pwd},function(err,result){
    if(err) throw err;
    if(0===result){
      res.json({rc:0,msg:"用户名或者密码错误"})
      return;
    }else{
      res.json({newurl:'/'});
    }
  })
})
router.get('/', function(req, res, next) {
  req.session.state=2;
  var hmacInst=hashCrypto.hmac;
  //var captchaInst=genCaptcha();
  //var cap=captcha.awesomeCaptcha(options,function(text,url){captchaInfo={text:text,url:url}});
  //console.log(captchaInfo);
  //var render= res.render('index', { title:hmacInst('md5','asdfasdf',pemFilePath),img:captchaInfo.url });
  async.waterfall([
      function(cb){
         captcha.awesomeCaptcha({},cb);
      },
      //captcha.awesomeCaptcha({},cb),
      function(text,url,cb){
        console.log(url);
        res.render('index', { title:hmacInst('md5','asdfasdf',pemFilePath),img:url });
      }

  ]);
  //next;
/*  async.series([
    captcha.awesomeCaptcha(options,function(text,url){
      captchaInfo={text:text,url:url}
    })
    //function(){console.log(captchaInfo)},
    //res.render('index', { title:hmacInst('md5','asdfasdf',pemFilePath),img:captchaInfo.url }),
    //function(){console.log(captchaInfo)}
    //function(){}
  ]
      //,function(){console.log(captchaInfo)}
  );*/
  //console.log(captchaInfo)
  //req.session.captcha=captchaInst.text;
  //  res.render('index', { title:hmacInst('md5','asdfasdf',pemFilePath),img:captchaInst.url });
    //console.log(data);

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
