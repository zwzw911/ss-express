/**
 * Created by zw on 2016/2/10.
 * checkAllSetting:check if all value valid
 * setAllSetting: save to redis if all value are valid
 */
'use strict'
var defaultSetting=require('../../assist/defaultGlobalSetting').defaultSetting
//use redis to save get golbalSetting
var redisClient=require('./redis_connections').redisClient
var miscFunc=require('../../assist_function/miscellaneous').func
//var redisClient = require("redis").createClient()
//var async=require('async')
var settingError=require('../../error_define/runtime_node_error').runtime_node_error.setting
var runtimeRedisError=require('../../error_define/runtime_redis_error').runtime_redis_error

var rightResult={rc:0}

/*redisClient.on('ready',function(){
    console.log(2)
            redisClient.multi().set("test1",202).expire('test1',90)
     .exec(function(err,replies){
         console.log(replies)

     })

})*/


var setDefault=function(){
       //redisClient.on('ready',function(){
        for(let item of Object.keys(defaultSetting)){

            for (let subItem of  Object.keys(defaultSetting[item])){
                //Is object but not an array, then change value to string
                //for array, change to string automatically
                let val=defaultSetting[item][subItem].define
                if(typeof val =='object' && !miscFunc.isArray(val)){
                    val=JSON.stringify(val)
                    //console.log(val.toString())
                }
                redisClient.hset([item,subItem,val])
            }
        }
    //})

}

//直接返回subItem的值
var getSingleSetting=function(item,subItem,cb){
    //redisClient.on('ready',function(){
        redisClient.hexists(item,subItem,function(err,exist){
//console.log(exist)
            if(1===exist){
                redisClient.hget(item,subItem,function(err,result){
                    if(err){return cb(null,runtimeRedisError.setError)}
                    //redis value are string, check if object(JSON)

                    if(0===result.indexOf('{') && result[ result.length-1]=='}'){

                        result=JSON.parse(result)
                        //console.log(result)
                    }
                    //array
                    else if(-1!==result.indexOf(',')){
                        result=Array.from(result.split(','))
                    }

                    return cb(null,{rc:0,msg:result})
                })
            }else{
                return cb(null,runtimeRedisError.keyNotExist)
            }
        })

    //})
}

//获得数据项下所有子项的数据,并构成{item:{subItem1:value1,subItem2;value2}}的格式
var getItemSetting=function(item,cb){
    var wholeResult={};
    //计算item总数，以便确定合适可以返回全部（因为每读一次，都是异步）
    var totalSubItemNum=0;
    //获得数据项下所有子项的数量
    if(undefined!==defaultSetting[item]){
        wholeResult[item]={}
        for (let subItem of  Object.keys(defaultSetting[item])){
            totalSubItemNum++
        }
    }else{
        return cb(null,{rc:0,msg:wholeResult})
    }
//console.log(new Date().getTime())
    //redisClient.on('ready',function(){
//console.log(new Date().getTime())
        for (let subItem of  Object.keys(defaultSetting[item])){
            getSingleSetting(item,subItem,function(err,result){
//console.log(result)
                if(result.rc && result.rc>0){
                    return cb(null,result)
                }
                wholeResult[item][subItem]=result.msg
                totalSubItemNum--
                if(0===totalSubItemNum){
                    cb(null,{rc:0,msg:wholeResult})
                }
                //console.log(wholeResult)
            })
        }
    //})
}
var getAllSetting=function(cb){
	var wholeResult={};
    //计算item总数，以便确定合适可以返回全部（因为每读一次，都是异步）
    var totalSubItemNum=0;
    for(let item of Object.keys(defaultSetting)){
        for (let subItem of  Object.keys(defaultSetting[item])){
            totalSubItemNum++
        }
    }
    //console.log(totalSubItemNum)
    //redisClient.on('ready',function(){
        for(let item of Object.keys(defaultSetting)){
			if(undefined===wholeResult[item]){
                wholeResult[item]={}
			}
            for (let subItem of  Object.keys(defaultSetting[item])){
                getSingleSetting(item,subItem,function(err,result){
                    if(result.rc && result.rc>0){
                        return cb(null,result)
                    }
					wholeResult[item][subItem]=result.msg
                    totalSubItemNum--
                    if(0===totalSubItemNum){
                        cb(null,{rc:0,msg:wholeResult})
                    }
                    //console.log(wholeResult)
                })
            }
        }
		
    //})
}

//
var checkSingleSetting=function(item,subItem,newValue){
    if(!newValue){
        return settingError.emptyGlobalSettingValue
    }
    if(!defaultSetting[item][subItem]){
        return settingError.invalidSettingParam
    }
    //根据类型进行检测，没有type定义，直接pass
    if(defaultSetting[item][subItem][type]){
        switch (defaultSetting[item][subItem][type]){
            case 'int':
                if(false===miscFunc.isInt(newValue)){
                    return settingError.settingValueNotInt
                }
                if(defaultSetting[item][subItem][max]){
                    let newValueInt=parseInt(newValue)
                    if(newValueInt>defaultSetting[item][subItem][max]){
                        return settingError.settingValueExceedMaxInt
                    }
                    //最小值检查包含在最大值检查中
                    // 最小值没有定义，默认是0
                    let definedMinValue=0
                    if(defaultSetting[item][subItem][min]){
                        definedMinValue=parseInt(defaultSetting[item][subItem][min])
                    }
                    if(newValueInt<definedMinValue){
                        return settingError.settingValueExceedMinInt
                    }
                }
                break;
            case 'path':
                if(false===miscFunc.isFolder(newValue)){
                    return settingError.settingValuePathNotExist
                }
                if(defaultSetting[item][subItem][maxLength]){
                    let definedMaxLength=defaultSetting[item][subItem][maxLength]
                    if(newValue.length>definedMaxLength){
                        return defaultSetting[item][subItem][client][maxLength]
                    }
                    //check min
                    let definedMinLength=0
                    if(defaultSetting[item][subItem][minLength]){
                        definedMinLength=defaultSetting[item][subItem][minLength]
                    }
                    if(newValue.length<definedMinLength){
                        return defaultSetting[item][subItem][client][minLength]
                    }
                }
                break;
            case 'file':
                if(false===miscFunc.isFile(newValue)){
                    return settingError.settingValueFileNotExist
                }
                if(defaultSetting[item][subItem][maxLength]){
                    let definedMaxLength=defaultSetting[item][subItem][maxLength]
                    if(newValue.length>definedMaxLength){
                        return defaultSetting[item][subItem][client][maxLength]
                    }
                    //check min
                    let definedMinLength=0
                    if(defaultSetting[item][subItem][minLength]){
                        definedMinLength=defaultSetting[item][subItem][minLength]
                    }
                    if(newValue.length<definedMinLength){
                        return defaultSetting[item][subItem][client][minLength]
                    }
                }
                break;
        }
    }
    return rightResult
}
var checkAllSetting=function(valueObj){
    for(let item of Object.keys(defaultSetting)) {
        for (let subItem of  Object.keys(defaultSetting[item])) {
            let checkResult=checkSingleSetting(item,subItem,valueObj[item][subItem])
            if(checkResult.rc!==0){
                return checkResult
            }
        }
    }
    return rightResult
}

var setSingleSetting=function(item,subItem,newValue){
    //redisClient.on('ready',function(){
        if(typeof newValue =='object' && !miscFunc.isArray(newValue)){
            newValue=JSON.stringify(newValue)
        }
        //console.log(item+subItem+newValue)
        redisClient.hset([item,subItem,newValue])
    //})
}
//setAllSetting不能代替setDefault，因为setAllSetting读取的是{item1:{subItem1:val1}},而setDefault读取的是{item1:{subItem1:{define:val1,type:'int',max:'',client:{}}}}
var setAllSetting=function(newValueObj){
    //redisClient.on('ready',function() {
        //读取固定键
        for (let item of Object.keys(newValueObj)) {
            for (let subItem of  Object.keys(newValueObj[item])) {
                let newValue=newValueObj[item][subItem];
/*                if (!newValueObj[item][subItem]) {
                    newValue = newValueObj[item][subItem]
                }*/
                //判断是否对象
                if (typeof newValue == 'object' && !miscFunc.isArray(newValue)) {
                    newValue = JSON.stringify(newValue)
                }
                setSingleSetting(item, subItem, newValue)
            }
        }
    //})
}
//redisClient.on('ready',function(){
//    setDefault(defaultSetting)
//    getAllSetting(function(err,result){
//        console.log(result['attachment']['validSuffix'])
//    })
//})

//set

exports.globalSetting={
    setDefault:setDefault,
    getItemSetting:getItemSetting,//用来获得当个item下所有数据
    getAllSetting:getAllSetting,
    setAllSetting:setAllSetting
};