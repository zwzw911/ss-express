'use strict'
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

var internalSetting=require('./inputDefine/adminLogin/defaultGlobalSetting').internalSetting

var generalFunc=require('./express_component/generalFunction').generateFunction

var input_validate=require('./error_define/input_validate').input_validate
var runtimeDbError=require('./error_define/runtime_db_error').runtime_db_error
var runtimeNodeError=require('./error_define/runtime_node_error').runtime_node_error
var runtimeRedisError=require('./error_define/runtime_redis_error').runtime_redis_error

var captchaDbOperation=require('./model/redis/captcha').captcha

//var inputRuleDefine=require('./error_define/inputRuleDefine').inputRuleDefine
var inputValidateFunc=require('./assist_function/inputValid').inputValid

var inputRuleDefine=require('./inputDefine/adminLogin/inputRuleDefine').inputRuleDefine

var miscFunc=require('./assist_function/miscellaneous').func

var options={};
var captchaParams={}

var pemFilePath=generalFunc.getPemFile(internalSetting.pemPath);//当前目录是网站根目录



//console.log('final'+pemFilePath)
var userDbOperation=require('./model/user').userDbOperation

/*生成captcha，并存入session*/
var failThenGenCaptcha=function(req,resultFail,callback){
  captchaInst.captcha(captchaParams,function(err,result){
/*    captchaInst.removeExpireFile(captchaParams,function(err,result){
      if(0<result.rc){
        return callback(err,result)
      }
    })*/
    //为了防止多个进程同时删除一个captcha文件，删除使用单独的进程来处理
    if(err){
      return callback(null,result)
    }
    captchaDbOperation.saveCaptcha(req,result.msg.text)
    //req.session.captcha=result.msg.text;
    resultFail.data=result.msg.data
    return callback(err,resultFail)
  })
}
/* GET home page. */
router.get('/', function(req, res, next) {
	//console.log(a)
  req.session.state=2;
    var preResult=generalFunc.preCheck(req,false)
    if(preResult.rc>0){
        return res.json(preResult)
    }

  captchaInst.captcha(captchaParams,function(err,result){
    if(result.rc>0){
      return res.json(result)
    }

    //captchaInst.removeExpireFile(captchaParams)//无需等待回应
    var rememberMe,cryptName;
    //console.log(req.signedCookies.rememberMe);
    cryptName=req.signedCookies.rememberMe;//cookie remember store user name
    rememberMe =(undefined=== cryptName || ''===cryptName) ? false:true;//if store user name, flag set to true to inform client to enable checkbox "remember me"
    //console.log("t"+req.signedCookies.rememberMe);
//console.log(rememberMe)
    if(true===rememberMe)
    {
      var name=hashCrypto.decrypt(null,cryptName,pemFilePath);
    }else{
      var name='';
    }
    captchaDbOperation.saveCaptcha(req,result.msg.text)
    //req.session.captcha=result.msg.text;

      //根据general中定义，产生http：//127.0.0.1：3000/的格式
      var tmpUrl=internalSetting.reqProtocol+'://'+internalSetting.reqHostname
      //console.log(tmpUrl)
      //如果端口不是默认的80，需要添加预定义的port
      if(internalSetting.reqPort!=80){
          tmpUrl=tmpUrl+':'+internalSetting.reqPort
      }
      //如果hostname和protocol符合预定义，并且referer是本机地址，那么重新生成referer地址
      if(undefined!==req.get('Referer') && undefined!==req.hostname && undefined!==req.protocol && internalSetting.reqProtocol===req.protocol && internalSetting.reqHostname===req.hostname){
            //http/https        127.0.0.1(不带port）
            //用internalSetting产生的hostname重生生成Referer
            let t=req.get('Referer').split('/') //   http://127.0.0.1:3000/login/login====>[ 'http:', '', '127.0.0.1:3000', 'login', 'login' ]
            let newReferer
            if(t.length>3){
                newReferer=tmpUrl
                for (let i= 3,len= t.length;i<len;i++){
                    newReferer+='/'
                    newReferer+=t[i];
                }
            }
            //存入req。session。referer
            req.session.referer=newReferer;
      }else{
          //直接转到主页
            req.session.referer=tmpUrl;
      }
    return res.render('login', { title:'登录',img:result.msg.data ,rememberMe:rememberMe,decryptName:name,year:new Date().getFullYear()});
	
  })
});

//session.state; null=hack(no get);1=already login;2=not login
router.put('/regen_captcha',function(req,res,next){
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
*
* 1. check cpatcha
* 2. check other input
* 3. check user/pwd match
* 4. set cookie and save info to session
* */
router.put('/loginUser',function(req,res,next){
    //console.log(req.get("Referer"))
  var preResult=generalFunc.preCheck(req,false)
  if(preResult.rc>0){
      return res.json(preResult)
  }

  var userRule=inputRuleDefine.user
  //1. 检查传入的参数
  var inputValidateResult=inputValidateFunc.checkInput(req.body.user,inputRuleDefine.user)
  if(inputValidateResult.rc>0){
    return res.json(inputValidateResult)
  }
  var inputName=req.body.user.userName.value;
  var inputPassword=req.body.user.password.value;
  var inputCaptcha=req.body.user.captcha.value;

  var rememberMe
  if(req.body.rememberMe){
    rememberMe=true
  }else{
    rememberMe=false
  }

  //2. 读取redis中的captcha，并进行比较
  captchaDbOperation.getCaptcha(req,function(err,result){
    //captcha不存在，重新生成
    if(result.rc===runtimeRedisError.captcha.expire.rc){
      failThenGenCaptcha(req,result,function(err,result){
        //console.log(req.session.captcha)
        return res.json(result)
      })
      return//防止继续往后执行（因为上述captchaInst是异步函数）
    }
    //其它错误，直接返回
    if(0<result.rc){
      return res.json(miscFunc.convertServerResult2CilentResult(result))
    }

    //读取到captcha，进行比较
    let redisCaptcha=result.msg
    if(inputCaptcha.toUpperCase()!=redisCaptcha){
      let resultFail=runtimeNodeError.user.captchaVerifyFail
      failThenGenCaptcha(req,resultFail,function(err,resultFail){
        //console.log(req.session.captcha)
        return res.json(resultFail)
      })
      return//防止继续往后执行（因为上述captchaInst是异步函数）
    }
    //删除captcha，异步当作同步执行，反正不care是否真的删除
    captchaDbOperation.delCaptcha(req,function(){})
    //captcha正确，比较用户名和密码
    let hashedPassword=hashCrypto.hmac('sha1',inputPassword,pemFilePath);
    userDbOperation.checkUserValidate(inputName,hashedPassword,function(err,checkUserResult){
      if(0<checkUserResult.rc){
        failThenGenCaptcha(req,checkUserResult,function(err,result){
          return res.json(result)
        })
        return
      }

      //密码正确，检查是否需要把用户名保存到cookie
      if (true === rememberMe) {
        var tmpCookie = {};
        //读取预定义的cookie option，根据需要更改maxAge和signed
        for (let key in cookieSessionClass.cookieOptions) {
          tmpCookie[key] = cookieSessionClass.cookieOptions[key];
        }
        tmpCookie['maxAge'] = 24 * 3600 * 1000;//save one day
        tmpCookie['signed'] = true;
        //存储加密过的名字
        let cryptName = hashCrypto.crypt(null, inputName, pemFilePath);
        res.cookie('rememberMe', cryptName, tmpCookie);
      } else {
        res.clearCookie('rememberMe', cookieSessionClass.cookieOptions);
        //return
      }
      req.session.state = 1
      req.session.userId = checkUserResult.msg._id
      req.session.userName = checkUserResult.msg.name

      return res.json({rc: 0,msg:req.session.referer});

    })
  })



})





//session.state; null=hack(no get);1=already login;2=not login

//
//router.get('/checkUser', function(req, res, next) {
//  var instMongo=require('../public/javascripts/model/dbConnection.js');
//})
module.exports = router;
