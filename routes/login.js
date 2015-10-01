var express = require('express');
var router = express.Router();

var cookieSessionClass=require('./express_component/cookieSession');
var fs=require('fs')

//var instMongo=require('../public/javascripts/model/dbConnection');
//var Schema=mongoose.schema;
var captchaInst=require('./express_component/awesomeCaptcha').captcha;
//var cap=captcha.awesomeCaptcha;

var hashCrypto=require('./express_component/hashCrypt');

var async=require('async');

var general=require('./assist/general').general

var generalFunc=require('./express_component/generalFunction').generateFunction

var input_validate=require('./error_define/input_validate').input_validate
var runtimeDbError=require('./error_define/runtime_db_error').runtime_db_error
var runtimeNodeError=require('./error_define/runtime_node_error').runtime_node_error
/*var mongoose=instMongo.mongoose;
var userSch=new mongoose.Schema({
  name:{type:String,index:true},
  password:String
},{
  autoIndex:false
});
var user=mongoose.model("user",userSch);*/

//var captchaInfo={};
var options={};
var captchaParams={}
//var mongooseError=require('./assist/3rd_party_error_define').mongooseError;


var pemFilePath='./other/key/key.pem';//当前目录是网站根目录

var userDbOperation=require('./model/user').userDbOperation

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
  captchaInst.captcha(captchaParams,function(err,text,url,path){
    if(err){
      return res.json(runtimeNodeError.user.genCaptchaFail)
    }

    captchaInst.removeExpireFile(captchaParams)//无需等待回应
    var rememberMe,cryptName;
    //console.log(req.signedCookies.rememberMe);
    cryptName=req.signedCookies.rememberMe;//cookie remember store user name
    rememberMe =(undefined=== cryptName || ''===cryptName) ? false:true;//if store user name, flag set to true to inform client to enable checkbox "remember me"
    //console.log("t"+req.signedCookies.rememberMe);
    if(true===rememberMe)
    {
      var name=hashCrypto.decrypt(null,cryptName,pemFilePath);
    }else{
      var name='';
    }
    req.session.captcha=text;
    req.session.captchaPath=path+"/"+url
    //console.log('out'+path+"/"+url);
    //console.log(captchaParams)
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
      fs.unlinkSync(req.session.captchaPath)
    }

    captchaInst.captcha({},function(err,text,url,path){
      captchaInst.removeExpireFile(captchaParams)
      req.session.captcha=text;
      req.session.captchaPath=path+"/"+url
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
  var resultFail;//如果错误，需要返回的结果（主要是需要添加一个属性url，以便返回新产生的captcha）
  //console.log(req.route)
  //console.log(rememberMe)
  //删除touter.get产生的captcha img **********  现在还不work，可能是captchaAwesome写完当前文件后，没有正确关闭，倒是无法删除（其实是node-canvas的方法）
  if(undefined!=req.session.captchaPath){
    //console.log(req.session.captchaPath)
    fs.unlinkSync(req.session.captchaPath)
  }
  if (!input_validate.user.name.type.define.test(name) ){
    cap({},function(err,text,url, path) {
      req.session.captcha = text;
      req.session.captchaPath=path+"/"+url
      resultFail=input_validate.user.name.type.client
      resultFail.url=url
      return res.json(resultFail);
    })
  }
  if (!input_validate.user.pwd.type.define.test(pwd) ){
    cap({},function(err,text,url, path) {
      req.session.captcha = text;
      req.session.captchaPath=path+"/"+url
      resultFail=input_validate.user.password.type.client
      resultFail.url=url
      return res.json(resultFail);
    })
  }
  if (!input_validate.user.captcha.type.define.test(captcha) ){
    captchaInst.captcha(captchaParams,function(err,text,url, path) {
      captchaInst.removeExpireFile(captchaParams)
      req.session.captcha = text;
      req.session.captchaPath=path+"/"+url
      resultFail=input_validate.user.captcha.type.client
      resultFail.url=url
      return res.json(url);
    })
  }
  //console.log(captcha.toUpperCase())
  //console.log(req.session.captcha)

  if(captcha.toUpperCase()!=req.session.captcha){
    captchaInst.captcha(captchaParams,function(err,text,url, path){
      captchaInst.removeExpireFile(captchaParams)
      req.session.captcha=text;
      req.session.captchaPath=path+"/"+url
      resultFail=runtimeNodeError.user.captchaVerifyFail
      resultFail.url=url
      return res.json(resultFail);
    })

    ;
  }
  if('boolean'!=typeof(rememberMe)){
    captchaInst.captcha({},function(err,text,url, path) {
      captchaInst.removeExpireFile(captchaParams)
      req.session.captcha=text;
      req.session.captchaPath=path+"/"+url
      resultFail=runtimeNodeError.user.rememberMeTypeWrong
      resultFail.url=url
      return res.json(url)
    })
  }

  pwd=hashCrypto.hmac('sha1',pwd,pemFilePath);
  //console.log(pwd)
  userDbOperation.checkUserValidate(name,pwd,function(err,result){
    if(0<result.rc){
      cap({},function(err,text,url, path) {
        req.session.captcha = text;
        req.session.captchaPath=path+"/"+url

        result.url=url
        //console.log(result)
        return res.json(result);
      })
    }
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
    req.session.userName=result.name
    req.session.captcha=undefined;
    req.session.captchaPath=undefined
    return res.json({rc:0});

  })

})





//session.state; null=hack(no get);1=already login;2=not login

//
//router.get('/checkUser', function(req, res, next) {
//  var instMongo=require('../public/javascripts/model/dbConnection.js');
//})
module.exports = router;
