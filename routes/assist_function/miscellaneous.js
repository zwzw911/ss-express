/**
 * Created by wzhan039 on 2015-09-07.
 * 可以和generalFunction合并
 */
//   以下2个函数仅仅格式化mongodb中显示的数据
/*var formatLongDate=function(date){
    var reg=/T/g
    var reg1=/\.\d{3}Z/g
    return date.toString().replace(reg,' ').replace(reg1,' ');
}
var formatShortDate=function(date){
    var reg=/T.+/g
    //var reg1=/\.\d{3}Z/g
    return date.toString().replace(reg,' ');
}*/

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
exports.func={
/*    formatLongDate:formatLongDate,
    formatShortDate:formatShortDate,*/
    expressFormatLongDate:expressFormatLongDate,
    expressFormatShortDate:expressFormatShortDate,
    objectIndexOf:objectIndexOf,
    extractKey:extractKey
}