/**
 * Created by ada on 2015/8/30.
 */
var general=require('../assist/general').general
var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error

var rightResult={rc:0,msg:null}

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

var checkInterval=function(req){
    if(1!=req.session.state && 2!=req.session.state){
        return runtimeNodeError.general.userStateWrong
    }
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
exports.generateFunction={
    generateRandomString:generateRandomString,
    checkInterval:checkInterval
}