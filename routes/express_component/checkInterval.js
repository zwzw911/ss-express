/**
 * Created by wzhan039 on 2016-03-21.
 */
    'use strict'
var ioredis=require('ioredis')
var ioredisclient=new ioredis()
var LuaSHA=require('../assist/globalConstantDefine').constantDefine.LuaSHA
var runtimeRedisError=require('../error_define/runtime_redis_error').runtime_redis_error
var intervalCheckBaseIPNodeError=require('../error_define/runtime_node_error').runtime_node_error.intervalCheckBaseIP
var fs=require('fs')
var async=require('async')

var checkInterval=function(req,cb){
    let identify
    if(req.session && req.session.id){
        identify=req.session.id
    }
    //req.ip和req.ips，只有在设置了trust proxy之后才能生效，否则一直是undefined
    if(req.ips && req.ips[0]){
        identify= req.ips[0]
    }
    if(undefined===identify){
        return cb(null,intervalCheckBaseIPNodeError.unknownRequestIdentify)
    }
    ioredisclient.evalsha(LuaSHA.Lua_check_interval,1,identify,new Date().getTime(),function(err,checkResult){
    //ioredisclient.eval('../model/redis/lua_script/Lua_check_interval.lua',1,ip,new Date().getTime(),function(err,checkResult){
    //ioredisclient.script('load','../model/redis/lua_script/Lua_check_interval.lua',function(err,sha){
    //    ioredisclient.evalsha(sha,1,ip,new Date().getTime(),function(err,checkResult) {
            if (err) {
                console.log(err)
                return cb(null, runtimeRedisError.general.luaFail)
            }
            //let result=checkResult.split(':')
            //if(result[0]==checkResult){
        //console.log(checkResult)
            switch (checkResult[0]) {
                case 0:
                    return cb(null, {rc: 0})
                case 10:
                    let rc = {}
                    rc['rc'] = intervalCheckBaseIPNodeError.tooMuchReq.rc
                    rc['msg'] = `${intervalCheckBaseIPNodeError.forbiddenReq.msg}，请在${checkResult[1]}秒后重试`
                    //console.log(rc)
                    return cb(null, rc)
                case 11:
                    //console.log(intervalCheckBaseIPNodeError.between2ReqCheckFail)
                    return cb(null, intervalCheckBaseIPNodeError.between2ReqCheckFail)
                    break;
                case 12:
                    //console.log(intervalCheckBaseIPNodeError.exceedMaxTimesInDuration)
                    return cb(null, intervalCheckBaseIPNodeError.exceedMaxTimesInDuration)
                    break;
                default:
            }
        //})
    })
}

//本来先作为路由句柄，但是此功能无法在router上使用（而只能在app上使用）
//可以作为中间件使用，但是不够灵活（get的时候出错，希望返回页面，post/put/delete的时候返回错误，希望在当前页面跳出对话框提示）。中间件只能对所有方式单一处理。
var checkIntervalMid=function(req,res,next){
    let identify
    if(req.session && req.session.id){
        identify=req.session.id
    }else if(req.ips && req.ips[0]){
        identify= req.ips[0]
    }
    if(undefined===identify){
        //return {rc:}
    }
    ioredisclient.evalsha(LuaSHA.Lua_check_interval,1,identify,new Date().getTime(),function(err,checkResult){
        //ioredisclient.eval('../model/redis/lua_script/Lua_check_interval.lua',1,ip,new Date().getTime(),function(err,checkResult){
        //ioredisclient.script('load','../model/redis/lua_script/Lua_check_interval.lua',function(err,sha){
        //    ioredisclient.evalsha(sha,1,ip,new Date().getTime(),function(err,checkResult) {
        if (err) {
            console.log(err)
            return res.json(null, runtimeRedisError.general.luaFail)
        }
        //let result=checkResult.split(':')
        /*console.log(checkResult)
        //if(result[0]==checkResult){
        switch (checkResult[0]) {
            case 0:
                //console.log('next')
                next()
                break;
                //return cb(null, {rc: 0})
            case 10:
                let rc = {}
                rc['rc'] = intervalCheckBaseIPNodeError.tooMuchReq.rc
                rc['msg'] = `${intervalCheckBaseIPNodeError.forbiddenReq.msg}，请在${checkResult[1]}秒后重试`
                //console.log(rc)
                return res.json(rc)
            case 11:
                //console.log(intervalCheckBaseIPNodeError.between2ReqCheckFail)
                return res.json( intervalCheckBaseIPNodeError.between2ReqCheckFail)
                break;
            case 12:
                //console.log(intervalCheckBaseIPNodeError.exceedMaxTimesInDuration)
                return res.json(intervalCheckBaseIPNodeError.exceedMaxTimesInDuration)
                break;
            default:
        }*/

        //})
    })
}

function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}
exports.checkInterval=checkInterval
exports.checkIntervalMid=checkIntervalMid

var req={}
req.session={}
req.session.id='s'

var count = 0;

/*async.whilst(
    function () { return count < 5; },
    function (callback) {
        count++;
        console.log(count)
        setTimeout(function () {
            callback(null, count);
        }, 1000);
    },
    function (err, n) {
        // 5 seconds have passed, n = 5
    }
);*/
/*async.whilst(
    function(){return count < 10;},
    function(callback){
        setTimeout(
            checkInterval(req,function(err,result){console.log(err)}),
            1000
        )
        sleep(1000)
        count++
        console.log('count '+count)
        checkInterval(req,
            callback(null,count)
            //function(err,result){
            //if(err){
            //    console.log(err)
            //}else{
            //    console.log(result)
            //
            //}
        //}
        )
    },
    function(err,n){
        if(err){
            console.log(err)
        }else{
            console.log('total '+n)
        }
    }
)*/
//for(let i=0;i<10;i++){
/*    checkInterval(req,function(err,result){
        //sleep(1000)
        console.log(result)
    })*/
//}


