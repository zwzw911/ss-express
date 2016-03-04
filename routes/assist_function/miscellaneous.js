/**
 * Created by wzhan039 on 2015-09-07.
 * 可以和generalFunction合并
 */
'use strict'
var fs=require('fs')


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

var isInt=function(value){
    if(typeof value == 'string'){
//console.log('s')
        return parseInt(value).toString()===value
    }
    if(typeof value == 'number'){
//console.log('n')
        return  parseInt(value)===value
    }
    return false
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
exports.func={
    expressFormatLongDate:expressFormatLongDate,
    expressFormatShortDate:expressFormatShortDate,
    objectIndexOf:objectIndexOf,
    extractKey:extractKey,
    isFolder:isFolder,
    isFile:isFile,
    isArray:isArray,
    isInt:isInt,
    isEmpty:isEmpty,
    convertServerResult2CilentResult:convertServerResult2CilentResult,
}