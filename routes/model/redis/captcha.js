/**
 * Created by wzhan039 on 2016-03-02.
 * captcha相关操作
 * 1. 保存
 * 2。判断是否存在（超时）
 * 3. 读取
 */
'use strict'
//var defaultSetting=require('../../assist/defaultGlobalSetting').defaultSetting
//use redis to save get golbalSetting
var redisClient=require('./redis_connections').redisClient()
//var miscFunc=require('../../assist_function/miscellaneous').func
//var redisClient = require("redis").createClient()
//var async=require('async')
//var settingError=require('../../error_define/runtime_node_error').runtime_node_error.setting
var runtimeRedisError=require('../../error_define/runtime_redis_error').runtime_redis_error
var defaultSetting=require('../../assist/not_used_defaultGlobalSetting').defaultSetting
var rightResult={rc:0}
//redisClient.on('ready',function(){
//    redisClient.multi().set('test1',2).exec()
//})
//异步，返回true、false：是否ok
//redisClient.on("error", function (err) {
//    console.log("Error " + err);
//});
/*var checkRedisStatus=function(cb){
    redisClient.on('drain',function(){//命令太多，需要缓存
        return cb('drain',false)
    })
    //redisClient.on('ready',function(){
        redisClient.expire('test1',100)
        //return cb(null,true)
    //})
    redisClient.on('connect',function(){
        return cb(null,true)
    })
    redisClient.on('reconnecting',function(){
        return cb('reconnecting',false)
    })
    redisClient.on('error',function(err){
        return cb(err,false)
    })
    redisClient.on('end',function(){
        return cb('connection ended',false)
    })

    redisClient.on('idle',function(){
        return cb(null,true)
    })

}*/
var saveCaptcha=function(req,captcha){
/*    redisClient.set(`${req.session.id}:captcha`,captcha,function(){

    })*/
    let captchaKey=`${req.session.id}:captcha`
    redisClient.multi().set(captchaKey,captcha).expire(captchaKey,defaultSetting.miscellaneous.captchaExpire.define).exec()
}

var getCaptcha=function(req,cb){
    var captchaKey=`${req.session.id}:captcha`;
    redisClient.exists(captchaKey,function(err,exist){
        if(err){
            return cb(null,runtimeRedisError.general.existsFail)
        }
        if(1===exist){
            redisClient.get(captchaKey,function(err,result){
                if(err){
                    return cb(null,runtimeRedisError.captcha.getError)
                }
                return cb(null,{rc:0,msg:result})
            })
        }else{
            //getCaptcha只在对比时才调用，那么说明之前已经产生过captcha了，所以notExist，返回说明文字“超时”
            return cb(null,runtimeRedisError.captcha.expire)
        }

    })
}

var delCaptcha=function(req,cb){
    var captchaKey=`${req.session.id}:captcha`;
    redisClient.exists(captchaKey,function(err,exist){
        if(err){
            return cb(null,runtimeRedisError.general.existsFail)
        }
        if(1===exist){
            redisClient.del(captchaKey,function(err,result){
                if(err){
                    return cb(null,runtimeRedisError.captcha.delError)
                }
                return cb(null,{rc:0,msg:result})
            })
        }
    })
}

exports.captcha={
    saveCaptcha:saveCaptcha,
    getCaptcha:getCaptcha,
    delCaptcha:delCaptcha,

}
//exportsaveCaptcha()