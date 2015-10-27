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


var options={};
var captchaParams={}

var pemFilePath=generalFunc.getPemFile(general.pemPath);//当前目录是网站根目录



//console.log('final'+pemFilePath)
var userDbOperation=require('./model/user').userDbOperation

/*生成captcha，并存入session*/
var failThenGenCaptcha=function(req,resultFail,callback){
  captchaInst.captcha(captchaParams,function(err,text,url,path){
/*    captchaInst.removeExpireFile(captchaParams,function(err,result){
      if(0<result.rc){
        return callback(err,result)
      }
    })*/
    //为了防止多个进程同时删除一个captcha文件，删除使用单独的进程来处理
    if(err){
      return callback(null,runtimeNodeError.user.genCaptchaFail)
    }
    req.session.captcha=text;
    req.session.captchaPath=path+"/"+url
    resultFail.url=url
    return callback(err,resultFail)
  })
}
/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.state=2;
    var preResult=generalFunc.preCheck(req,false)
    if(preResult.rc>0){
        return res.json(preResult)
    }

  captchaInst.captcha(captchaParams,function(err,text,url,path){
    if(err){
      return res.json(runtimeNodeError.user.genCaptchaFail)
    }

    //captchaInst.removeExpireFile(captchaParams)//无需等待回应
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
    //console.log( req.session)
    return res.render('login', { title:'登录',img:url ,rememberMe:rememberMe,decryptName:name,year:new Date().getFullYear()});
  })
});

//session.state; null=hack(no get);1=already login;2=not login
router.post('/regen_captcha',function(req,res,next){
    var preResult=generalFunc.preCheck(req,false)
    if(preResult.rc>0){
        return res.json(preResult)
    }


  if(2===req.session.state){ //only not login, can regen
    //删除前次产生的captcha img
    if(undefined!=req.session.captchaPath){
      fs.unlinkSync(req.session.captchaPath)
    }
    var tmpResult={rc:0}
    failThenGenCaptcha(req,tmpResult,function(err,result){
      return res.json(result)
    })
/*    captchaInst.captcha(captchaParams,function(err,text,url,path){
      captchaInst.removeExpireFile(captchaParams)
      req.session.captcha=text;
      req.session.captchaPath=path+"/"+url
      return res.json({rc:0,msg:url})
    })*/
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
    var preResult=generalFunc.preCheck(req,false)
    if(preResult.rc>0){
        return res.json(preResult)
    }
  var name=req.body.name;
  var pwd=req.body.pwd;
  var captcha=req.body.captcha;
  var rememberMe=req.body.rememberMe;
  var errorResult;//如果出现任何输入参数的错误，那么返回对应的json result；否则默认是undefined
  var resultFail;//如果错误，需要返回的结果（主要是需要添加一个属性url，以便返回新产生的captcha）
//console.log(captcha)
    if(undefined===resultFail && undefined===name){
        resultFail=input_validate.user.name.require.server
        //return res.json()
    }
    if(undefined===resultFail && undefined===pwd){
        resultFail=input_validate.user.password.require.server
        //return res.json()
    }
    if(undefined===resultFail && undefined===captcha){
        resultFail=input_validate.user.captcha.require.client
    }
    if(undefined===resultFail && undefined===rememberMe)(
        rememberMe=false
    )
    //console.log(rememberMe)
    //console.log(typeof(rememberMe))
  //删除touter.get产生的captcha img **********  现在还不work，可能是captchaAwesome写完当前文件后，没有正确关闭，倒是无法删除（其实是node-canvas的方法）
  if(undefined!=req.session.captchaPath){
    //console.log(req.session.captchaPath)
    fs.unlinkSync(req.session.captchaPath)
  }
  if (undefined===resultFail && !input_validate.user.name.type.define.test(name) ){
    resultFail=input_validate.user.name.type.client
  }
  if (undefined===resultFail && !input_validate.user.password.type.define.test(pwd) ){
    resultFail=input_validate.user.password.type.client
  }
  if (undefined===resultFail && !input_validate.user.captcha.type.define.test(captcha) ){
    resultFail=input_validate.user.captcha.type.client
  }
    //console.log(captcha)
    //console.log(req.session.captcha)
    if(undefined===resultFail && captcha.toUpperCase()!=req.session.captcha){
    resultFail=runtimeNodeError.user.captchaVerifyFail
  }


  if(undefined===resultFail && 'boolean'!=typeof(rememberMe)){
    resultFail=runtimeNodeError.user.rememberMeTypeWrong
  }

  if(undefined!==resultFail){
    failThenGenCaptcha(req,resultFail,function(err,resultFail){
        //console.log(req.session.captcha)
      return res.json(resultFail)
    })
    return//防止继续往后执行（因为上述captchaInst是异步函数）
  }
  pwd=hashCrypto.hmac('sha1',pwd,pemFilePath);
  //console.log(pwd)
  userDbOperation.checkUserValidate(name,pwd,function(err,checkUserResult){
//console.log(result.rc)
    if(0<checkUserResult.rc){
      //console.log('fail')
      //var captchaParams={}
      //var tmpResult={rc:0}
      failThenGenCaptcha(req,checkUserResult,function(err,result){
        return res.json(result)
      })
      return
    }else{
      if (true === rememberMe) {
        var tmpCookie = {};
        for (var key in cookieSessionClass.cookieOptions) {
          tmpCookie[key] = cookieSessionClass.cookieOptions[key];
        }
        tmpCookie['maxAge'] = 24 * 3600 * 1000;//save one day
        tmpCookie['signed'] = true;
        var cryptName = hashCrypto.crypt(null, name, pemFilePath);
        //console.log(cryptName)
        res.cookie('rememberMe', cryptName, tmpCookie);
        //res.signedCookie()
        //return
      } else {
        res.clearCookie('rememberMe', cookieSessionClass.cookieOptions);
        //return
      }
      req.session.state = 1
      req.session.userId = checkUserResult.msg._id
      req.session.userName = checkUserResult.msg.name
      req.session.captcha = undefined;
      req.session.captchaPath = undefined
      return res.json({rc: 0});
    }
  })

})





//session.state; null=hack(no get);1=already login;2=not login

//
//router.get('/checkUser', function(req, res, next) {
//  var instMongo=require('../public/javascripts/model/dbConnection.js');
//})
module.exports = router;
