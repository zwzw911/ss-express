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
/*fs.readFile('../model/redis/lua_test.lua','utf8',function(err,result){
        //console.log(err)
     //console.log(result)
    ioredisclient.script('load',result,function(err,sha){
                //console.log(err)
         console.log(sha)
/!*        for(let i=0;i<1;i++){
            console.log(`${i} start:${new Date().getTime()}`)
            ioredisclient.evalsha(sha,1,'192.168.1.1',new Date().getTime(),function(err,checkResult){
                if(err){
                    console.log(err)
                }
                console.log(`${i} end:${new Date().getTime()}`)

                console.log(checkResult)
            })
        }*!/

    })
})*/

var checkInterval=function(ip,cb){
    ioredisclient.evalsha(LuaSHA.Lua_check_interval,1,ip,new Date().getTime(),function(err,checkResult){
    //ioredisclient.evalsha('3e6c87747bf7116fdbdf74392ec95ae6d936e8c9',1,ip,new Date().getTime(),function(err,checkResult){
        if(err){
            //console.log(err)
            return cb(null,runtimeRedisError.general.luaFail)
        }
        //let result=checkResult.split(':')
        //if(result[0]==checkResult){
            switch (checkResult[0]){
                case 0:
                    return cb(null,{rc:0})
                case 10:
                    let rc={}
                    rc['rc']=intervalCheckBaseIPNodeError.tooMuchReq.rc
                    rc['msg'] = `${intervalCheckBaseIPNodeError.forbiddenReq.msg}，请在${checkResult[1]}秒后重试`
                    //console.log(rc)
                    return cb(null,rc)
                case 11:
                    //console.log(intervalCheckBaseIPNodeError.between2ReqCheckFail)
                    return cb(null,intervalCheckBaseIPNodeError.between2ReqCheckFail)
                    break;
                case 12:
                    //console.log(intervalCheckBaseIPNodeError.exceedMaxTimesInDuration)
                    return cb(null,intervalCheckBaseIPNodeError.exceedMaxTimesInDuration)
                    break;
                default:
            }
/*        //}
        if(result[0]==='10'){
            let rc={}
            rc['rc']=intervalCheckBaseIPNodeError.tooMuchReq.rc
            rc['msg'] = `${intervalCheckBaseIPNodeError.forbiddenReq.msg}，请在${result[1]}秒后重试`
            //console.log(rc)
            return cb(null,rc)
        }*/
    })
}
exports.checkInterval=checkInterval
/*for(let i=0;i<10;i++){
    checkInterval('192.168.1.1',function(err,result){
        console.log(result)
    })
}*/


