/**
 * Created by ada on 2015/8/30.
 */
var general=require('../assist/general').general
var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error
var input_validate=require('../error_define/input_validate').input_validate
var fs=require('fs')
var rightResult={rc:0,msg:null}

var getPemFile=function(pemPath){
    for(var i= 0,n=pemPath.length;i<n;i++){
        if(true===fileExist(pemPath[i])){
            return pemPath[i]
            //break
        }
    }
    return
}
var fileExist=function(file){
    //console.log(file)
    if(undefined!==fs.statSync(file)){
        return true
    }else{
        return false
    }
}
//1. 搜索字符串中的+转换成空格
//2. 截取规定的字符数量
var convertURLSearchString=function(searchString){
    var tmpStr=searchString.split('+');
    //console.log(tmpStr)
    var totalLen=general.searchTotalKeyLen
    var strNum=tmpStr.length
    var curStrLen=0;//计算当前处理的字符长度
    var curStr='';//转换后的搜索字符串（使用空格分隔）
    for(var i=0;i<strNum;i++){
        //第一个key就超长，直接截取20个字符
        if(0===i && tmpStr[0].length>totalLen){
            curStr=tmpStr[0].substring(0,totalLen)
            return curStr.trim()
        }
        //如果当前已经处理的字符串+下一个要处理的字符串的长度超出，返回当前已经处理的字符串，舍弃之后的字符串
        //-i:忽略空格的长度
        if(curStr.length+tmpStr[i].length-i>totalLen){
            return curStr.trim()
        }
        curStr+=tmpStr[i]
        curStr+=' ';

    }

    return curStr.trim()
}
//获得当前用户的信息，以便在toolbar上显示对应的信息
var getUserInfo=function(req){
    var result
    if(req.session.state===1){
        result={}
        result.logged=true
        result.userName=req.session.userName
        //result.userId=req.session.userId
    }
    //console.log(result)
    return result
}

/*var quit=function(req){
    req.session.state=2
    req.session.userName=undefined
    req.session.userId=undefined

}*/
var generateRandomString=function(num){
    var validString='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var len=validString.length
    var randomIdx,result='';
    for(var i=0;i<num;i++){
        randomIdx=Math.round(Math.random()*(len-1));
        result+=validString[randomIdx]
    }
    return result
}

var checkUserState=function(req){
    //需要检测状态,如果不是1或者2,就没有session,后续的代码也就不必执行
    if(1!=req.session.state && 2!=req.session.state){
        return runtimeNodeError.general.userNotlogin
    }
    return rightResult
}

var checkUserId=function(req){
    return input_validate.user._id.type.define.test(req.session.userId) ? rightResult:input_validate.user._id.type.client
}

var checkUserLogin=function(req){
    return req.session.state===1 ? rightResult:runtimeNodeError.general.userNotlogin
}
var checkInterval=function(req){
    var curTime=new Date().getTime();//毫秒数
    if(true===req.route.methods.post) {
        //是post请求
        //1. 有lastPost，和lastPost比较，得出结果
        //2. 没有lastPost
        //  2.1 有lastGet，和lastGet比较，得出结果
        //  2.2 没有lastGet，直接设置lastPost，返回true
        if( undefined !=req.session.lastPost){
            if ((curTime - req.session.lastPost) > general.sameRequestInterval) {
                req.session.lastPost = curTime
                return rightResult
            } else {
                return runtimeNodeError.general.intervalWrong
            }
        }

        if(undefined === req.session.lastPost && undefined != req.session.lastGet){
                if( (curTime - req.session.lastGet) > general.differentRequestInterval){
                    req.session.lastPost = curTime
                    return rightResult
                }else{
                    return runtimeNodeError.general.intervalWrong
                }
        }
        if(undefined === req.session.lastPost && undefined === req.session.lastGet){
            req.session.lastPost = curTime
            return rightResult
        }
    }
    if(true===req.route.methods.get) {
        //是get请求
        //1. lastPost和lastGet都没有，设置lastGet，返回true
        //2. lastGet没有，lastPost有，设置lastGet，比较lastPost，返回比较结果
        //3. lastGet有，比较lastGet，true，设置lastPost，并返回；否则直接返回false
        if (undefined === req.session.lastPost && undefined === req.session.lastGet) {

            req.session.lastGet = curTime
            return rightResult
        }
        if (undefined === req.session.lastGet && undefined != req.session.lastPost) {

            req.session.lastGet = curTime;
            if( (curTime - req.session.lastPost) > general.differentRequestInterval){
                return rightResult
            }else{
                runtimeNodeError.general.intervalWrong
            }
        }
        if (undefined != req.session.lastGet) {

            if ((curTime - req.session.lastGet) > general.sameRequestInterval) {
                req.session.lastGet = curTime
                return rightResult
            } else {
                return runtimeNodeError.general.intervalWrong
            }
        }
    }
}

var preCheck=function(req){
    var result=checkUserLogin(req)
    if(result.rc>0){
        return result
    }

    result=checkUserId(req)
    if(result.rc>0){
        return result
    }

    return checkInterval(req)
}
exports.generateFunction={
    convertURLSearchString:convertURLSearchString,
    getUserInfo:getUserInfo,
    generateRandomString:generateRandomString,
    checkUserState:checkUserState,
    checkUserId:checkUserId,
    checkInterval:checkInterval,
    preCheck:preCheck,
    fileExist:fileExist,
    getPemFile:getPemFile
}