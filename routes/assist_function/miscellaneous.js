/**
 * Created by wzhan039 on 2015-09-07.
 * 可以和generalFunction合并
 */
'use strict'
var fs=require('fs')
var general=require('../assist/general').general
var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error
var input_validate=require('../error_define/input_validate').input_validate

//var intervalFunc=require('../model/redis/checkReqInterval').dbOperation
var rightResult={rc:0,msg:null}

var isEmpty=function(value){
    if (undefined===value || null===value ){
        return true
    }
    switch (typeof value){
        case "string":
            return ( ""===value ||  0===value.length || ""===value.trim());
            break;
        case "object":
            if(true===isArray(value)){
                return 0===value.length
            }else {
                return 0===Object.keys(value).length
            }
            break;
    }
    return false
}

var isArray=function(obj){
    return obj && typeof obj==='object' &&
        Array == obj.constructor;
}

//检查是否有效日期
var isDate=function(date){
    //function check(date){
        return (new Date(date).getDate()==date.toString().substring(date.length-2));
    //}
}
var isInt=function(value){
    if(typeof value == 'string'){
/*console.log(`${value} is string`)
console.log(parseInt(value).toString()===value)*/
        return parseInt(value).toString()===value
    }
    if(typeof value == 'number'){
/*console.log(`${value} is number`)*/
        return  parseInt(value)===value
    }
    return false
}

var isPositive=function(value){
    let value=parseFloat(value)
    return value>0
}
var isFolder=function(path){
    return fs.statSync(path).isDirectory()
}

var isFile=function(file){
    return fs.statSync(file).isFile()
}

var formatMonthAndDay=function(md){
    var p=/^\d$/
    return p.test(md) ? '0'+md.toString():md
}
//node会自动把时间从mongodb格式改成Sun Sep 06 2015 16:10:23 GMT+0800 (China Standard Time),但是到了angular又变成mongodb的格式(8小时时差)
//格式化日期
var expressFormatDate=function(date){
    var y=date.getFullYear();
    var m=formatMonthAndDay(date.getMonth()+1);
    var d=formatMonthAndDay(date.getDate());
    return  y+'-'+m+'-'+d
}

var expressFormatTime=function(date){
    var h=formatMonthAndDay(date.getHours());
    var m=formatMonthAndDay(date.getMinutes());
    var s=formatMonthAndDay(date.getSeconds());
    return h+':'+m+':'+s
}
var expressFormatLongDate=function(date){
    return expressFormatDate(date)+' '+expressFormatTime(date)
}
var expressFormatShortDate=function(date){
    return expressFormatDate(date)
}

//对于复杂数组(内容为object)
/*
*  key:要检测的object中的键;value:要检测的key所对应的value;array:要检测的数组
* */
var objectIndexOf=function(key,value,array){
    var len=array.length;
    if(0===len){
        return -1
    }

    var result=-1;
    for(var i=0;i<len;i++){
        if(array[i][key]===value){
            result=i
            break
        }
    }
    return result
}

//提取数组对象中某一个key的值到一个数组
var extractKey=function(key,array){
    var tmp=[]
    if(0===array.length){
        return tmp
    }

    for(var i=0;i<array.length;i++){
        tmp.push(array[i][key])
    }

    return tmp
}

//把从db中读出的的数据转换成对象，同时对date进行转换
//toObject对populate后的结果不起作用，所以需要自建函数进行转换
//var convDBToObj=function(db){
//    console.log(typeof db)
//    for(var i in db){
//        console.log(i)
//    }
//}

//某些情况下，server端产生的错误信息不能直接返回给client端，例如：数据库操作失败，此时，只要给出一个粗略的消息，而不是具体的消息即可
//具体的消息，记录到log中（或者db中）
var convertServerResult2CilentResult=function(result){
//    redis:general
    if(result.rc>=50000 && result.rc<50009){
        result.msg='数据库出错'
        return result
    }
}

//len:产生字符串的长度
//strict: boolean。false：产生字符串只包含字母数字，true；字符数字+特殊符号
var generateRandomString=function(len,strict){
    if(undefined===len || false===isInt(len)){
        len=4
    }
    strict= strict ? true:false
    let validString='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result=''
    if(strict){validString=`${validString}!@#$%^&*()+={}[]|\?/><`}
    let validStringLen=validString.length
    for(let i=0;i<len;i++){
        result+=validString.substr(parseInt(Math.random()*validStringLen,10),1);
    }

    return result
}

//计算当天剩下的毫秒数
var leftMSInDay=function(){
    let day=new Date().toLocaleDateString()
    let endTime='23:59:59'
    //毫秒
    //let ttlTime=parseInt(new Date(`${day} ${endTime}`).getTime())-parseInt(new Date().getTime())
    let ttlTime=new Date(`${day} ${endTime}`).getTime()-new Date().getTime()
    //console.log(ttlTime)
    return ttlTime
}
var leftSecondInDay=function(){
    //console.log(leftMSInDay)
    return Math.round(parseInt(leftMSInDay())/1000)
}


exports.func={
    expressFormatLongDate:expressFormatLongDate,
    expressFormatShortDate:expressFormatShortDate,
    objectIndexOf:objectIndexOf,
    extractKey:extractKey,
    isFolder:isFolder,
    isFile:isFile,
    isArray:isArray,
    isDate:isDate,
    isInt:isInt,
    isPositive:isPositive,
    isEmpty:isEmpty,
    convertServerResult2CilentResult:convertServerResult2CilentResult,
    generateRandomString:generateRandomString,
    leftMSInDay:leftMSInDay,
    leftSecondInDay:leftSecondInDay,

}

