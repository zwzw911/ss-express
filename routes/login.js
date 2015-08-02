var express = require('express');
var router = express.Router();
var cookieSessionClass=require('../public/javascripts/express_component/cookieSession');

//var instMongo=require('../public/javascripts/model/dbConnection');
//var Schema=mongoose.schema;
var captcha=require('../public/javascripts/express_component/awesomeCaptcha');
var cap=captcha.awesomeCaptcha;

var hashCrypto=require('../public/javascripts/express_component/hashCrypt');

var async=require('async');

/*var mongoose=instMongo.mongoose;
var userSch=new mongoose.Schema({
  name:{type:String,index:true},
  password:String
},{
  autoIndex:false
});
var user=mongoose.model("user",userSch);*/
var userModel=require('../public/javascripts/model/db_structure').user;
var captchaInfo={};
var options={};

var mongooseError=require('./assist/3rd_party_error_define').mongooseError;
var errorRecorder=require('../public/javascripts/express_component/recorderError').recorderError;
//var genCaptcha=function(){
//  var options={};
//  var cap=captcha.awesomeCaptcha;
//  cap(options,function(text,url){
//    captchaInfo={text:text,url:url};
//  })
//}
var pemFilePath='./other/key/key.pem';

//var getCaptcha=function(req){
//  var cap=captcha.awesomeCaptcha;
//  cap({},function(text,file){
//    req.session.captcha=text;
//    return {url:file};
//  })
//};

/* GET home page. */
//session.state; null=hack(no get);1=already login;2=not login
router.post('/regen_captcha',function(req,res,next){
  if(2===req.session.state){ //only not login, can regen
    //console.log('in2');
    cap({},function(err,text,url){
      req.session.captcha=text;
      res.json({url:url})
    })
  }
});
/*
* 0: login ok
* 1: userName parameters format wrong
* 2: password parameters format wrong
* 3: captcha wrong
* 4: remember wrong
* 5; username of password wrong
* */
router.post('/loginUser',function(req,res,next){
  var name=req.body.name;
  var pwd=req.body.pwd;
  var captcha=req.body.captcha;
  var rememberMe=req.body.rememberMe;
  //console.log(rememberMe)
  if (name.length<2 || name.length>20 ){
    cap({},function(err,text,url) {
      req.session.captcha = text;
      res.json({rc: 1, msg: "用户名由2到20个字符组成", url: url});
    })
    return
  }
  if (pwd.length<2 || pwd.length>20 ){
    cap({},function(err,text,url) {
      req.session.captcha = text;
      res.json({rc: 2, msg: "密码由2到20个字符组成", url: url});
    })
    return;
  }
  //console.log(captcha.toUpperCase())
  //console.log(req.session.captcha)
  if(captcha.toUpperCase()!=req.session.captcha){
    cap({},function(err,text,url){
      req.session.captcha=text;
      res.json({rc:3,msg:"验证码不正确",url:url});
    })

    return;
  }
  if('boolean'!=typeof(rememberMe)){
    cap({},function(err,text,url) {
      req.session.captcha=text;
      res.json({rc: 4, msg: "记住用户名必需是布尔值", url: url})
    })
    return;
  }

  pwd=hashCrypto.hmac('sha1',pwd,pemFilePath);
  //console.log(pwd)
  userModel.count({'name':name,'password':pwd},function(err,result){
    if(err) {
        errorRecorder(err.code,err.errmsg,'login','countUser')
        return res.json(mongooseError.countUser)
    }
    if(0===result){
      cap({},function(err,text,url) {
        req.session.captcha = text;
        res.json({rc: 5, msg: "用户名或者密码错误", url: url});
      })
      return;
    }else{
      if(true===rememberMe){
        var tmpCookie={};
        for (var key in cookieSessionClass.cookieOptions){
          tmpCookie[key]=cookieSessionClass.cookieOptions[key];
        }
        tmpCookie['maxAge']=24*3600*1000;//save one day
        tmpCookie['signed']=true;
        var cryptName=hashCrypto.crypt(null,name,pemFilePath);
        //console.log(cryptName)
        res.cookie('rememberMe',cryptName,tmpCookie);
        //res.signedCookie()
        //return
      }else{
        res.clearCookie('rememberMe',cookieSessionClass.cookieOptions);
        //return
      }
      return res.json({rc:0});
    }
  })
})
router.get('/', function(req, res, next) {
  req.session.state=2;
  //var hmacInst=hashCrypto.hmac;

  async.waterfall([
      function(cb){
         captcha.awesomeCaptcha({},cb);
      },
      //captcha.awesomeCaptcha({},cb),
      function(text,url,cb){

        var remremberMe,cryptName;
        //console.log(req.signedCookies.rememberMe);
        cryptName=req.signedCookies.rememberMe;//cookie remember store user name
        (undefined=== cryptName || ''===cryptName) ? remremberMe=false:remremberMe=true;//if store user name, flag set to true to inform client to enable checkbox "remember me"
        //console.log("t"+req.signedCookies.rememberMe);
        if(true===remremberMe)
        {
          var name=hashCrypto.decrypt(null,cryptName,pemFilePath);
        }else{
          var name='';
        }
        req.session.captcha=text;
        //console.log(name);
        res.render('login', { title:'登录',img:url ,rememberMe:remremberMe,decryptName:name});
      }

  ]);
  //next;
/*  async.series([
    captcha.awesomeCaptcha(options,function(text,url){
      captchaInfo={text:text,url:url}
    })
    //function(){console.log(captchaInfo)},
    //res.render('login', { title:hmacInst('md5','asdfasdf',pemFilePath),img:captchaInfo.url }),
    //function(){console.log(captchaInfo)}
    //function(){}
  ]
      //,function(){console.log(captchaInfo)}
  );*/
  //console.log(captchaInfo)
  //req.session.captcha=captchaInst.text;
  //  res.render('login', { title:hmacInst('md5','asdfasdf',pemFilePath),img:captchaInst.url });
    //console.log(data);

    //res.render('login', { title:hmacInst('md5','asdfasdf',pemFilePath),img:pic });
  //res.render('login', { title: 'Express',img:pic });
//next();
//  res.redirect('../users/api');

});




//session.state; null=hack(no get);1=already login;2=not login

//
//router.get('/checkUser', function(req, res, next) {
//  var instMongo=require('../public/javascripts/model/dbConnection.js');
//})
module.exports = router;
