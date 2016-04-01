/**
 * Created by zw on 2016/3/6.
 * 和adminLog相关的redis操作
 */
'use strict'
//var redisClient=require('./redis_connections').redisClient()
var runtimeNodeError=require('../../error_define/runtime_node_error').runtime_node_error
var LuaSHA=require('../../assist/globalConstantDefine').constantDefine.LuaSHA
var runtimeRedisError=require('../../error_define/runtime_redis_error').runtime_redis_error
//var getSetting=require('./CRUDGlobalSetting').globalSetting.getSingleSetting
var rightResult={rc:0}
var miscFunc=require('../../assist_function/miscellaneous').func
var ioredis=require('ioredis')
var ioredisclient=new ioredis()

//通过检查sessionid：adminLogin是否存在，判断是否已经登录
var getAdminLoginState=function(sessionId,cb) {
    if(undefined===sessionId || null===sessionId){
        return cb(null,runtimeNodeError.adminLogin.notLogin)
    }
    ioredisclient.evalsha(LuaSHA.adminLogin.getAdminLoginState,0,sessionId,function(err,result){
        if(err){
            console.log(err)
            return cb(null, runtimeRedisError.general.luaFail)
        }
        switch (result[0]){
            case 0:
                return cb(null,rightResult)
            case 1:
                return cb(null,runtimeNodeError.adminLogin.reachMaxTryTimes)
            case 2:
                return cb(null,runtimeNodeError.adminLogin.notLogin)
            default:
                return cb(null,runtimeNodeError.adminLogin.unknownErr)
        }

    })
}

//用户登录
var adminLogin=function(sessionId,passInUserName,passInPassword,cb) {
    let leftTime=miscFunc.leftSecondInDay()
    ioredisclient.evalsha(LuaSHA.adminLogin.adminLogin,3,"user","password",sessionId,passInUserName,passInPassword,leftTime,function(err,result){
        if(err){
            console.log(err)
            return cb(null, runtimeRedisError.general.luaFail)
        }
        let rc={}
//console.log(result)
        switch (result[0]){
            case 0:
                return cb(null,rightResult)
            case 1:
                return cb(null,runtimeNodeError.adminLogin.reachMaxTryTimes)
            case 2:
                return cb(null,runtimeNodeError.adminLogin.notSaveUserNamePassword)
            case 3:
                rc['rc']=runtimeNodeError.adminLogin.adminLoginFail.rc
                rc['msg']=runtimeNodeError.adminLogin.adminLoginFail.msg+`，今天还剩下${result[1]}次重试次数`
                return cb(null,rc)
        }

    })
}

//value:{adminName:'xxxx',adminPassword:'yyyy'}
var setUserNamePassword=function(genUserName,genPassword,cb){
    ioredisclient.evalsha(LuaSHA.adminLogin.adminLogin_saveUserPassword,2,"user","password",genUserName,genPassword,function(err,result){
        if(err){
            console.log(err)
            return cb(null, runtimeRedisError.general.luaFail)
        }
        return cb(null,rightResult)
    })
}


exports.dbOperation={
    getAdminLoginState:getAdminLoginState,
    adminLogin:adminLogin,
/*    getAdminFailLoginTimes:getAdminFailLoginTimes,
    userNamePasswordExist:userNamePasswordExist,
    setAdminFailLoginTimes:setAdminFailLoginTimes,
    getUserNamePassword:getUserNamePassword,*/
    setUserNamePassword:setUserNamePassword,
    //setExistFlag:setExistFlag,
}

/*
setUserNamePassword('zw','1234',function(err,setResult){
    //if(0<setResult){
        console.log(setResult)
        //return 999
    //}
    checkAdminLogin('abcd1234','zw','1234',function(err,checkResult){
        //if(0<checkResult.rc){
            console.log(checkResult)
            //return 9999
        //}
        //console.log(checkResult)
    })
})*/
