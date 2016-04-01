/**
 * Created by wzhan039 on 2016-03-07.
 */
'use strict'
var dbOperation=require('../model/redis/not_used_checkReqInterval').dbOperation
var rightResult={rc:0}
var CRUDGlobalSetting=require('../model/redis/CRUDGlobalSetting').globalSetting
var miscFunc=require('../assist_function/miscellaneous').func
//var settingError=require('../error_define/runtime_node_error').runtime_node_error.setting
var runtimeRedisError=require('../error_define/runtime_redis_error').runtime_redis_error
var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error
/*var getIntervalDefinition=function(cb){

}*/

//根据当天被拒的次数，决定rejectFlag的TTL
var calcRejectFlagTTL=function(rejectTimes,rejectTimesThreshold){
    //console.log(rejectTimes)
    //console.log(rejectTimesThreshold)
    let TTL=[30,60,120,240,600]
    let index=rejectTimes-rejectTimesThreshold
    //console.log(index)
    index=(index<0)? -1:index
    index=(index>TTL.length-1)?  TTL.length-1:index
    if(-1===index){
        return -1
    }else{
        return TTL[index]
    }

}

// 检查flag是否被设置
var checkFlagExists=function(ip,keyName,errObj,intervalSetting,cb){
    let redisKeyName=`${ip}:${keyName}`
    dbOperation.keyExists(redisKeyName,function(err,exists){
console.log(`${redisKeyName} ${exists.msg}`)
        if(0<exists.rc){
            return cb(null,exists)
        }
        if(0===parseInt(exists.msg)){
            return cb(null,rightResult)
        }
        if(1===parseInt(exists.msg)){

            let rc={}
            switch (redisKeyName){
                //读取剩余时间，返回给client
                case `${ip}:rejectFlag`:
                    dbOperation.ttl(redisKeyName,function(err,ttl){
                        if(err){
                            return cb(null,runtimeRedisError.general.ttlFail)
                        }
                        rc.rc=errObj.rc
                        rc['msg'] = `${runtimeNodeError.intervalCheckBaseIP.forbiddenReq}，请在${ttl.msg}秒后重试`
                        return cb(null,errObj)
                    })
                    break;
                // 更新TTL
                case `${ip}:reqLastFlag`:
                    let expireTimeOfRejectTimes=parseInt(intervalSetting['expireTimeOfRejectTimes'])
                    dbOperation.incrRejectTimesAndSetTTL(ip,expireTimeOfRejectTimes)//惩罚记录
                    return cb(null,errObj)
                    break;
                //重新计算Flag的TTL
                case `${ip}:reqListFlag`:
                    dbOperation.getFirstReq(redisKeyName,function(err,firstReq){
                        if(0<firstReq.rc){
                            return cb(null,firstReq)
                        }
                        let expireTimeOfRejectTimes=parseInt(intervalSetting['expireTimeOfRejectTimes'])
                        dbOperation.incrRejectTimesAndSetTTL(ip,expireTimeOfRejectTimes)//惩罚记录
/*                        let duration=parseInt(intervalSetting['duration'])*1000//second=>ms
                        let newTTL=Math.ceil((parseInt(firstReq.msg)+duration-new Date().getTime())/1000)
                        let expireTimeOfRejectTimes=parseInt(intervalSetting['expireTimeOfRejectTimes'])
                        dbOperation.setReqListFlagTTL(redisKeyName,newTTL)
                        dbOperation.incrRejectTimesAndSetTTL(redisKeyName,expireTimeOfRejectTimes)*/
                        //newTTl=Math.ceil(newTTL/1000)
                    })

                    break;
                default:
            }


        }
    })
}

// 检测所有flag
var checkAllFlag=function(ip,intervalSetting,cb){
//    1. 检测rejectFlag
    checkFlagExists(ip,'rejectFlag',runtimeNodeError.intervalCheckBaseIP.tooMuchReq,intervalSetting,function(err,rejectFlagExist){
        if(rejectFlagExist.rc>0){
            return cb(null,rejectFlagExist)
        }
    //    2 检测lastReqFlag
        checkFlagExists(ip,'reqLastFlag',runtimeNodeError.intervalCheckBaseIP.between2ReqCheckFail,intervalSetting,function(err,lastReqFlagExist) {
//console.log(`check reqLastFlag time`+ new Date().getTime())
            if (lastReqFlagExist.rc > 0) {
                return cb(null, lastReqFlagExist)
            }
            //为了保证速度，检查完毕，立刻设置

            let expireTimeBetween2Req=parseInt(intervalSetting['expireTimeBetween2Req'])
            dbOperation.setLastReqTTL(ip,expireTimeBetween2Req);
//console.log(`save reqLastFlag time`+ new Date().getTime())
        //    3 检测reqListFlag
            checkFlagExists(ip,'reqListFlag',runtimeNodeError.intervalCheckBaseIP.exceedMaxTimesInDuration,intervalSetting,function(err,reqListFlagExist) {
                if (reqListFlagExist.rc > 0) {
                    return cb(null, reqListFlagExist)
                }
                return cb(null,rightResult)
            })
        })
    })

}

var checkExceedTimesInDuration=function(ip,intervalSetting,cb){
//    长度
    dbOperation.getReqListLength(ip,function(err,listLen){
        if(0<listLen.rc){
            return cb(null,listLen)
        }
        let currentTimesInDuration=parseInt(listLen.msg)

        let timesInDuration=parseInt(intervalSetting['timesInDuration'])
        if(currentTimesInDuration<timesInDuration){
            dbOperation.pushReqTime(ip,parseInt(intervalSetting['expireTimeOfReqList']))
            return cb(null,rightResult)
        }

        dbOperation.getFirstReq(ip,function(err,firstReq){
            if(0<firstReq.rc){
                return cb(null,firstReq)
            }
            let currentTime=new Date().getTime()
            let duration=parseInt(intervalSetting['duration'])*1000//second=>ms
            let firstReqTime=parseInt(firstReq.msg)
            if(currentTime-duration>firstReqTime){
                dbOperation.delFirstReq(ip,function(err){
                    dbOperation.pushReqTime(ip,parseInt(intervalSetting['expireTimeOfReqList']))
                })
            }else{
                //设置reqListFlag的TTL
                let newTTL=Math.ceil((parseInt(firstReq.msg)+duration-new Date().getTime())/1000)
                dbOperation.setReqListFlagTTL(ip,newTTL)
                let expireTimeOfRejectTimes=parseInt(intervalSetting['expireTimeOfRejectTimes'])
                dbOperation.incrRejectTimesAndSetTTL(ip,expireTimeOfRejectTimes)//惩罚记录
            }

            return cb(null,rightResult)
        })
    })
}

/*//根据rejectTimes设置Flag
var setRejectFlag=function(ip,intervalSetting,cb){
    dbOperation.getRejectTimes(ip,function(err,rejectTimes){
        if(0<rejectTimes.rc){
            return cb(null,rejectTimes)
        }

        calcRejectFlagTTL(ip,parseInt(rejectTimes.msg))
        return cb(null,rightResult)
    })
}*/



//主函数
var checkReqInterval=function(ip,cb){
    //读取设置
    CRUDGlobalSetting.getItemSetting('intervalCheckBaseIP',function(err,intervalSetting) {
        if (0 < intervalSetting.rc) {
            return cb(null, intervalSetting)
        }
        let intervalDefinition = intervalSetting.msg['intervalCheckBaseIP']
//console.log(intervalDefinition)
    //    检查所有flag
        checkAllFlag(ip,intervalDefinition,function(err,flag){
            if(0<flag.rc){
                return cb(null,flag)
            }
//console.log(flag)
        //    设置reqLastFlag，为了保证速度，在flagcheck之后，立刻设置
/*            console.log(`save reqLast flag time`+ new Date().getTime())
            let expireTimeBetween2Req=parseInt(intervalDefinition['expireTimeBetween2Req'])
            dbOperation.setLastReqTTL(ip,expireTimeBetween2Req);*/

        //    检查duration设置
            checkExceedTimesInDuration(ip,intervalDefinition,function(err,timesInDuration){
                if(0<timesInDuration.rc){
                    return cb(null,timesInDuration)
                }
                //根据rejectTimes设置rejectFlag
                dbOperation.getRejectTimes(ip,function(err,rejectTimes){
                    if(0<rejectTimes.rc){
                        return cb(null,rejectTimes)
                    }
//console.log(rejectTimes)
                    let rejectFlagTTL=calcRejectFlagTTL(parseInt(rejectTimes.msg),parseInt(intervalDefinition['rejectTimesThreshold']))
//console.log(rejectFlagTTL)
                    if(-1!==rejectFlagTTL){
                        dbOperation.setRejectFlagAndTTL(ip,rejectFlagTTL)
                    }
//console.log('done'+new Date().getTime())
                   return cb(null,rightResult)
                })
            })
        })
    })
}


















/*// 如果存在，返回错误rc和msg，不存在，rc＝0
var checkRejectFlagExist=function(req,cb){
    let rc={}
    dbOperation.checkRejectFlagExist(req,function(err,rejectExist) {
        if (0 < rejectExist.rc) {
            return cb(null, rejectExist)
        }

        //rejectFlag存在，获得flag的TTL，并返回
        if (1 === rejectExist.msg) {
            //rejectFlag剩余时间
            dbOperation.getRejectFlagTTL(req, function (err, ttl) {
                if (0 < ttl.rc) {
                    return cb(null, ttl)
                }
                rc['rc'] = runtimeNodeError.intervalCheckBaseIP.forbiddenReq
                rc['msg'] = `${runtimeNodeError.intervalCheckBaseIP.forbiddenReq}，请在${ttl.msg}秒后重试`
                return cb(null, rc)
            })

        }
    //  flag不存在，返回0
        if(0===rejectExist.msg){
            return cb(null,rightResult)
        }
    })
}
var not_used_checkReqInterval=function(req,cb){
    let rc={}
    // 检查rejectFlag是否存在
/!*    dbOperation.checkRejectFlagExist(req,function(err,rejectExist){
        if(0<rejectExist.rc){
            return cb(null,rejectExist)
        }
        //rejectFlag存在
        if(1===rejectExist.msg){
            //rejectFlag剩余时间
            dbOperation.getRejectFlagTTL(req,function(err,ttl){
                if(0<ttl.rc){
                    return cb(null,ttl)
                }
                rc['rc']=runtimeNodeError.intervalCheckBaseIP.forbiddenReq
                rc['msg']=`${runtimeNodeError.intervalCheckBaseIP.forbiddenReq}，请在${ttl.msg}秒后重试`
                return cb(null, rc)
            })

        }*!/
    checkRejectFlagExist(req,function(err,exist){
        if(0<exist.rc){
            return cb(null,exist)
        }


        //    1 检查${req.ip}:req长度是否大于0（0说明不存在）
        dbOperation.getReqLength(req,function(err,len){
            if(0<len.rc){
                return cb(null,len)
            }
            //console.log(len)
            //${req.ip}:req不存在
            if(0==parseInt(len.msg)){
                dbOperation.pushReqTime(req)
                return cb(null,rightResult)
            }

            // 2 ${req.ip}:req存在，读取所有相关设置，
            CRUDGlobalSetting.getItemSetting('intervalCheckBaseIP',function(err,intervalSetting){
                if(0<intervalSetting.rc){
                    return cb(null,intervalSetting)
                }
                let intervalDefinition=intervalSetting.msg

                //    2.1 读取最后一个时间
                dbOperation.getLastReq(req,function(err,lastReq){
                    if(0<lastReq.rc){
                        return cb(null,lastReq)
                    }

                    let currentTime=new Date().getTime()
                    let lastReqTime=lastReq.msg
console.log(intervalDefinition)
console.log(`cur tiem is ${currentTime}`)
console.log(`last time is ${lastReqTime}`)
                    //2次间隔过小
                    if(currentTime-parseInt(lastReqTime)<parseInt(intervalDefinition.between2Req)){
                        //增加rejectTimes
                        dbOperation.getRejectTimes(req,function(err,times){
                            if(0<times.rc){
                                return cb(null,times)
                            }
                            let newTimes=parseInt(times.msg)+1
                            let newRejectFlagTTL=calcRejectFlagTTL(newTimes)
                            dbOperation.incrRejectTimes(req)
                            dbOperation.setRejectFlagAndTTL(req,newRejectFlagTTL)
                            return cb(null,runtimeNodeError.intervalCheckBaseIP.between2ReqCheckFail)
                        })
                    }else{
                        //    3 检查list中数量是否超过20
                        if(parseInt(intervalDefinition.timesInDuration)<=parseInt(len.msg)){
                            //   3.1 超过20，读取第一个req
                            dbOperation.getFirstReq(req,function(err,firstReq){
                                if(0<firstReq.rc){
                                    return cb(null,firstReq)
                                }

                                let lastReqTime=parseInt(firstReq.msg)
                                if(currentTime-lastReqTime<intervalDefinition.duration){
                                    return cb(null,runtimeNodeError.intervalCheckBaseIP.exceedMaxTimesInDuration)
                                }
                                dbOperation.delFirstReq(req,function(err,del){
                                    if(0<del.rc){
                                        return cb(null,del)
                                    }
                                })
                            })
                        }

                        dbOperation.pushReqTime(req)
                    }


                })
            })
        })
    })


}*/

exports.checkReqInterval=checkReqInterval
/*checkReqInterval('192.168.1.23',function(err,reu){})
checkReqInterval('192.168.1.23',function(err,reu){})
checkReqInterval('192.168.1.23',function(err,reu){})
checkReqInterval('192.168.1.23',function(err,reu){})
checkReqInterval('192.168.1.23',function(err,reu){})
checkReqInterval('192.168.1.23',function(err,reu){})
checkReqInterval('192.168.1.23',function(err,reu){})
checkReqInterval('192.168.1.23',function(err,reu){})
checkReqInterval('192.168.1.23',function(err,reu){})
checkReqInterval('192.168.1.23',function(err,reu){})
checkReqInterval('192.168.1.23',function(err,reu){})
checkReqInterval('192.168.1.23',function(err,reu){})
checkReqInterval('192.168.1.23',function(err,reu){})
checkReqInterval('192.168.1.23',function(err,reu){})
checkReqInterval('192.168.1.23',function(err,reu){})
checkReqInterval('192.168.1.23',function(err,reu){})
checkReqInterval('192.168.1.23',function(err,reu){})
checkReqInterval('192.168.1.23',function(err,reu){})*/
for(let i=0;i<100;i++){
    console.log(`${i} start:${new Date().getTime()}`)
    checkReqInterval('192.168.1.23',function(err,reu){
        console.log(`${i} end:${new Date().getTime()}`)
    })
}
//checkReqInterval({ip:'192.168.1.23'},function(err,reu){})
