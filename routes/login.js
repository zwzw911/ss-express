var express = require('express');
var router = express.Router();
var cookieSessionClass=require('./express_component/cookieSession');
var fs=require('fs')

//var instMongo=require('../public/javascripts/model/dbConnection');
//var Schema=mongoose.schema;
var captcha=require('./express_component/awesomeCaptcha');
var cap=captcha.awesomeCaptcha;

var hashCrypto=require('./express_component/hashCrypt');

var async=require('async');

var general=require('./assist/general').general

var generalFunc=require('./express_component/generalFunction').generateFunction
/*var mongoose=instMongo.mongoose;
var userSch=new mongoose.Schema({
  name:{type:String,index:true},
  password:String
},{
  autoIndex:false
});
var user=mongoose.model("user",userSch);*/
var userModel=require('./model/db_structure').userModel;
var captchaInfo={};
var options={};

var mongooseError=require('./assist/3rd_party_error_define').mongooseError;
var errorRecorder=require('./express_component/recorderError').recorderError;

var pemFilePath='./other/key/key.pem';//当前目录是网站根目录



/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.state=2;
  //var hmacInst=hashCrypto.hmac;
  //console.log(req.route.methods.post)
  var checkIntervalResult=generalFunc.checkInterval(req)
  //console.log(checkIntervalResult)
  if(checkIntervalResult.rc>0){
    return res.json(checkIntervalResult)
  }
  captcha.awesomeCaptcha({},function(err,text,url){
    if(err){console.log(err)}
    var rememberMe,cryptName;
    //console.log(req.signedCookies.rememberMe);
    cryptName=req.signedCookies.rememberMe;//cookie remember store user name
    (undefined=== cryptName || ''===cryptName) ? rememberMe=false:rememberMe=true;//if store user name, flag set to true to inform client to enable checkbox "remember me"
    //console.log("t"+req.signedCookies.rememberMe);
    if(true===rememberMe)
    {
      var name=hashCrypto.decrypt(null,cryptName,pemFilePath);
    }else{
      var name='';
    }
    req.session.captcha=text;
    req.session.captchaPath=general.captchaImg_path+"/"+url
    //console.log(name);
    return res.render('login', { title:'登录',img:url ,rememberMe:rememberMe,decryptName:name});
  })
});

//session.state; null=hack(no get);1=already login;2=not login
router.post('/regen_captcha',function(req,res,next){
  //console.log(req.route)
  var checkIntervalResult=generalFunc.checkInterval(req)

  if(checkIntervalResult.rc>0){
    return res.json(checkIntervalResult)
  }
  if(2===req.session.state){ //only not login, can regen
    //console.log('in2');
    //删除前次产生的captcha img
    if(undefined!=req.session.captchaPath){
      fs.unlink(req.session.captchaPath,function(err){})
    }

    cap({},function(err,text,url){
      req.session.captcha=text;
      req.session.captchaPath=general.captchaImg_path+"/"+url
      return res.json({rc:0,msg:url})
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
  var checkIntervalResult=generalFunc.checkInterval(req)
  if(checkIntervalResult.rc>0){
    return res.json(checkIntervalResult)
  }
  var name=req.body.name;
  var pwd=req.body.pwd;
  var captcha=req.body.captcha;
  var rememberMe=req.body.rememberMe;
  //console.log(req.route)
  //console.log(rememberMe)
  //删除touter.get产生的captcha img **********  现在还不work，可能是captchaAwesome写完当前文件后，没有正确关闭，倒是无法删除（其实是node-canvas的方法）
  if(undefined!=req.session.captchaPath){
    //console.log(req.session.captchaPath)
    fs.unlink(req.session.captchaPath,function(err){
      //console.log(err)
    })
  }
  if (name.length<2 || name.length>20 ){
    cap({},function(err,text,url) {
      req.session.captcha = text;
      req.session.captchaPath=general.captchaImg_path+"/"+url
      res.json({rc: 1, msg: "用户名由2到20个字符组成", url: url});
    })
    return
  }
  if (pwd.length<2 || pwd.length>20 ){
    cap({},function(err,text,url) {
      req.session.captcha = text;
      req.session.captchaPath=general.captchaImg_path+"/"+url
      res.json({rc: 2, msg: "密码由2到20个字符组成", url: url});
    })
    return;
  }
  //console.log(captcha.toUpperCase())
  //console.log(req.session.captcha)
  if(captcha.toUpperCase()!=req.session.captcha){
    cap({},function(err,text,url){
      req.session.captcha=text;
      req.session.captchaPath=general.captchaImg_path+"/"+url
      res.json({rc:3,msg:"验证码不正确",url:url});
    })

    return;
  }
  if('boolean'!=typeof(rememberMe)){
    cap({},function(err,text,url) {
      req.session.captcha=text;
      req.session.captchaPath=general.captchaImg_path+"/"+url
      res.json({rc: 4, msg: "记住用户名必需是布尔值", url: url})
    })
    return;
  }

  pwd=hashCrypto.hmac('sha1',pwd,pemFilePath);
  //console.log(pwd)
  userModel.findOne({'name':name,'password':pwd},function(err,result){
    //throw err
    if(err) {
      //throw err
        errorRecorder(err.code,err.errmsg,'login','countUser')
        return res.json(mongooseError.countUser)
    }
    if(null===result){
      cap({},function(err,text,url) {
        req.session.captcha = text;
        req.session.captchaPath=general.captchaImg_path+"/"+url
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
      req.session.state=1
      req.session.userId=result._id
      req.session.captcha=undefined;
      req.session.captchaPath=undefined
      return res.json({rc:0});
    }
  })
})





//session.state; null=hack(no get);1=already login;2=not login

//
//router.get('/checkUser', function(req, res, next) {
//  var instMongo=require('../public/javascripts/model/dbConnection.js');
//})
module.exports = router;
