/**
 * Created by wzhan039 on 2016-03-07.
 * 检测请求，间隔是否符合标准
 * 数据存入redis，加快处理速度
 * based on ip
 */

'use strict'
var redisClient=require('./redis_connections').redisClient()
var runtimeRedisError=require('../../error_define/runtime_redis_error').runtime_redis_error
var miscFunc=require('../../assist_function/miscellaneous').func

var getSetting=require('./CRUDGlobalSetting').globalSetting.getSingleSetting
var rightResult={rc:0}

var keyExists=function(keyName,cb){
    redisClient.exists(keyName,function(err,existResult){
        if(err){
            return cb(null,runtimeRedisError.general.existsFail)
        }
        return cb(null,{rc:0,msg:existResult})
    })
}
/*var checkRejectFlagExist=function(req,cb){
    let keyName=`${req.ip}:reject`
    redisClient.exists(keyName,function(err,existResult){
        if(err){
            return cb(null,runtimeRedisError.general.existsFail)
        }
        return cb(null,{rc:0,msg:existResult})
    })
}*/

var setLastReqTTL=function(ip,ttl){
    let keyName=`${ip}:reqLastFlag`
//console.log(`ttl is ${ttl}`)
    redisClient.multi().set(keyName,0).pexpire(keyName,ttl).exec()
}
var setReqListFlagTTL=function(ip,ttl){
    let keyName=`${ip}:reqListFlag`
    redisClient.multi().set(keyName,0).expire(keyName,ttl).exec()
}
var setReqListTTL=function(ip,ttl){
    redisClient.expire(`${ip}:reqList`,ttl)
}
var getRejectFlagTTL=function(ip,cb){
    let keyName=`${ip}:reject`
    redisClient.ttl(keyName,function(err,ttl){
        if(err){
            return cb(null,runtimeRedisError.general.ttlFail)
        }
        return cb(null,{rc:0,msg:ttl})
    })
}
//设置出错次数+重置TTL
var incrRejectTimesAndSetTTL=function(ip,ttl){
    let keyName=`${ip}:rejectTimes`
    redisClient.multi().incr(keyName).expire(keyName,ttl).exec()
}
//然后设置flag以及TTL
var setRejectFlagAndTTL=function(ip,TTL){
    let keyName=`${ip}:reject`
    redisClient.multi().set(keyName,'1').expire(keyName,TTL).exec()
}

var getRejectTimes=function(ip,cb){
    let keyName=`${ip}:rejectTimes`
    redisClient.get(keyName,function(err,rejectTimes){
        if(err){
            return cb(null,runtimeRedisError.general.getError)
        }
        if(null===rejectTimes){
            rejectTimes=0
        }
        return cb(null,{rc:0,msg:rejectTimes})
    })
}

var getReqListLength=function(ip,cb){
    let keyName=`${ip}:reqList`
    redisClient.llen(keyName,function(err,len){
        if(err){
            return cb(null,runtimeRedisError.general.llenFail)
        }
        return cb(null,{rc:0,msg:len})
    })
}
//rpush 同时更新TTL
var pushReqTime=function(ip,ttl){
    let keyName=`${ip}:reqList`
    redisClient.multi().rpush(keyName,new Date().getTime()).expire(keyName,ttl).exec()
}

//不能使用pop，否则会删除
var getFirstReq=function(ip,cb){
    let keyName=`${ip}:reqList`
    redisClient.llen(keyName,function(err,lenResult){
        if(err){
            return cb(null,runtimeRedisError.general.llenFail)
        }
        if(lenResult>0){
            redisClient.lindex(keyName,0,function(err,result){
                if(err){
                    return cb(null,runtimeRedisError.general.lindexFail)
                }
                return cb(null,{rc:0,msg:result})
            })
        }else{
            return cb(null,runtimeRedisError.intervalCheckBaseIP.listIsEmpty)
        }
    })
}

/*//不能使用pop，否则会删除
var getLastReq=function(req,cb){
    let keyName=`${req.ip}:req`
    redisClient.llen(keyName,function(err,lenResult){
        if(err){
            return cb(null,runtimeRedisError.general.llenFail)
        }
        if(lenResult>0){
//console.log(`len is ${lenResult}`)
            redisClient.lindex(keyName,lenResult-1,function(err,result){
                if(err){
                    return cb(null,runtimeRedisError.general.lindexFail)
                }
                return cb(null,{rc:0,msg:result})
            })
        }else{
            return cb(null,runtimeRedisError.interval.listIsEmpty)
        }
    })
}*/

//使用ltrim
var delFirstReq=function(ip,cb){
    let keyName=`${ip}:req`
    redisClient.llen(keyName,function(err,lenResult){
        if(err){
            return cb(null,runtimeRedisError.general.llenFail)
        }
        if(lenResult>0){
            redisClient.lpop(keyName,function(err,result){
                if(err){
                    return cb(null,runtimeRedisError.general.lpopFail)
                }
                return cb(null,rightResult)
            })
        }else{
            return cb(null,rightResult)
        }
    })
}
/*exports.dbOperation={
    keyExists:keyExists,
    setLastReqTTL:setLastReqTTL,
    setReqListFlagTTL:setReqListFlagTTL,
    setReqListTTL:setReqListTTL,
    //checkRejectFlagExist:checkRejectFlagExist,
    getRejectFlagTTL:getRejectFlagTTL,
    incrRejectTimesAndSetTTL:incrRejectTimesAndSetTTL,
    setRejectFlagAndTTL:setRejectFlagAndTTL,
    getRejectTimes:getRejectTimes,

    getReqListLength:getReqListLength,
    pushReqTime:pushReqTime,
    getFirstReq:getFirstReq,
    //getLastReq:getLastReq,
    delFirstReq:delFirstReq,

}*/

/*
var script="redis.call('set',KEYS[1],ARGV[1])"
redisClient.eval(script,1,'zw6',5,function(err,result){
    console.log(err)
    console.log(result)
})*/
//var script="redis.call('set',KEYS[1],ARGV[1])"
/*redisClient.eval('./lua_test.lua',1,'ww',1,function(err,result){
    console.log(err)
    console.log(result)
})*/

var ioredis=require('ioredis')
var ioredisclient=new ioredis()
var fs=require('fs')
var intervalCheckBaseIPError=require('../../error_define/runtime_redis_error').runtime_redis_error.intervalCheckBaseIP
var intervalCheckBaseIPNodeError=require('../../error_define/runtime_node_error').runtime_node_error.intervalCheckBaseIP
/*fs.readFile('./lua_test.lua','utf8',function(err,result){
/!*    console.log(err)
    console.log(result)*!/
    ioredisclient.script('load',result,function(err,sha){
/!*        console.log(err)
        console.log(sha)*!/
        for(let i=0;i<10;i++){
            console.log(`${i} start:${new Date().getTime()}`)
            ioredisclient.evalsha(sha,1,'192.168.1.1',new Date().getTime(),function(err,sharesult){
                if(err){
                    console.log(err)
                }
                console.log(`${i} end:${new Date().getTime()}`)
console.log(sharesult)
                let result=sharesult.split(':')
                console.log(result)
                if(result[0]==result){
                    switch (result[0]){
                        case '11':
                            console.log(intervalCheckBaseIPNodeError.between2ReqCheckFail)
                            break;
                        case '12':
                            console.log( intervalCheckBaseIPNodeError.exceedMaxTimesInDuration)
                            break;
                        default:
                    }
                }
                if(result[0]==='10'){
                    console.log( intervalCheckBaseIPNodeError.tooMuchReq)
                }
            })
        }

    })
})*/

var user='asdf'
var pwd='qwer'
fs.readFile('./lua_script/adminLogin_saveUserPassword.lua','utf8',function(err,result) {
    /*    console.log(err)
     console.log(result)*/
    ioredisclient.script('load', result, function (err, sha) {
        //console.log(sha)
        ioredisclient.evalsha(sha,2,"user","password",user,pwd,function(err,result){
            if(err){
                console.log(err)
            }
            console.log(result)
        })
    })
})


/*fs.readFile('./lua_script/adminLogin.lua','utf8',function(err,result) {
/!*        console.log(err)
     console.log(result)*!/
    ioredisclient.script('load', result, function (err, sha) {
        if(err){
            console.log(err)
        }
        //console.log(sha)
        let leftTime=miscFunc.leftSecondInDay()
        //console.log(leftTime)
        ioredisclient.evalsha(sha,3,"user","password",'a123ef',user,pwd,leftTime,function(err,result){
            if(err){
                console.log(err)
            }
            console.log(result)
        })
    })
})*/
/*ioredisclient.evalsha('9f13321f53eae13c227060b2589a93af080a7acb',1,'ww1',222,function(err,sharesult){
    console.log(err)
    console.log(sharesult)
})*/
