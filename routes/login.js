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

var general=require('./assist/general').general

var generalFunc=require('./express_component/generalFunction').generateFunction

var input_validate=require('./error_define/input_validate').input_validate
var runtimeDbError=require('./error_define/runtime_db_error').runtime_db_error
var runtimeNodeError=require('./error_define/runtime_node_error').runtime_node_error

var captchaDbOperation=require('./model/redis/captcha').captcha

var inputRuleDefine=require('./error_define/inputRuleDefine').inputRuleDefine
var inputValidateFunc=require('./assist_function/inputValid').inputValid
var runtimeRedisError=require('./error_define/runtime_redis_error').runtime_redis_error
var inputRuleDefine=require('./error_define/inputRuleDefine').inputRuleDefine

var miscFunc=require('./assist_function/miscellaneous').func

var options={};
var captchaParams={}

var pemFilePath=generalFunc.getPemFile(general.pemPath);//当前目录是网站根目录



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
      var tmpUrl=general.reqProtocol+'://'+general.reqHostname
      //console.log(tmpUrl)
      //如果端口不是默认的80，需要添加预定义的port
      if(general.reqPort!=80){
          tmpUrl=tmpUrl+':'+general.reqPort
      }
      //如果hostname和protocol符合预定义，并且referer是本机地址，那么重新生成referer地址
      if(undefined!==req.get('Referer') && undefined!==req.hostname && undefined!==req.protocol && general.reqProtocol===req.protocol && general.reqHostname===req.hostname){
            //http/https        127.0.0.1(不带port）
            //用general产生的hostname重生生成Referer
            var t=req.get('Referer').split('/') //   http://127.0.0.1:3000/login/login====>[ 'http:', '', '127.0.0.1:3000', 'login', 'login' ]
            if(t.length>3){
                var newReferer=tmpUrl
                for (var i= 3,len= t.length;i<len;i++){
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
*
* 1. check cpatcha
* 2. check other input
* 3. check user/pwd match
* 4. set cookie and save info to session
* */
router.post('/loginUser',function(req,res,next){
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
      //req.session.captcha = undefined;
      //req.session.captchaPath = undefined

      //console.log(req.session.referer)
      //res.redirect(req.session.referer)
      return res.json({rc: 0,msg:req.session.referer});

    })
  })

  /*var name=req.body.name;
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

  //var captchaSaveInDB=capathaDbOperation.getCaptcha(req,result.msg.text)




/!*  if(undefined!=req.session.captchaPath){
    //console.log(req.session.captchaPath)
    fs.unlinkSync(req.session.captchaPath)
  }*!/
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

  //POST上来的就是字符
  if(undefined===resultFail && ('true'!==rememberMe && 'false'!==rememberMe)){
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

        //console.log(req.session.referer)
        //res.redirect(req.session.referer)
      return res.json({rc: 0,msg:req.session.referer});
    }
  })*/

})





//session.state; null=hack(no get);1=already login;2=not login

//
//router.get('/checkUser', function(req, res, next) {
//  var instMongo=require('../public/javascripts/model/dbConnection.js');
//})
module.exports = router;
