/**
 * Created by ada on 2015/8/30.
 */
    'use strict'
var general=require('../assist/general').general
var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error
var input_validate=require('../error_define/input_validate').input_validate
var fs=require('fs')
var rightResult={rc:0,msg:null}

//解析GM返回的文件大小，返回数值和单位（GM返回Ki，Mi，Gi.没有单位，是Byte。除了Byte，其他都只保留1位小数，并且四舍五入。例如：1.75Ki=1.8Ki）
//1.8Ki，返回1.8和“ki”；900，返回900
//解析失败，或者单位是Gi，返回对应的错误
//{ rc: 0, msg: { sizeNum: '200', sizeUnit: 'Ki' } }
var parseGmFileSize=function(fileSize){
    var p=/(\d{1,}\.?\d{1,})([KkMmGg]i)?/ //1.8Ki
    var parseResult=fileSize.match(p)
    if(parseResult[0]!==fileSize ){
        return runtimeNodeError.image.cantParseFileSize
    }
    var fileSizeNum=parseFloat(parseResult[1])
    if(isNaN(fileSizeNum)){
        return runtimeNodeError.image.cantParseFileSizeNum
    }
    //单位是Gi，直接返回大小超限
    if('Gi'===parseResult[2]){
        return runtimeNodeError.image.exceedMaxFileSize
    }
    return {rc:0,msg:{sizeNum:parseResult[1],sizeUnit:parseResult[2]}}
}

//把GM返回的fileSize转换成Byte，以便比较
//{ rc: 0, msg: 204800 }
var convertImageFileSizeToByte=function(fileSizeNum,fileSizeUnit){
    var imageFileSizeInByte,imageFileSizeNum //最终以byte为单位的大小； GM得到的size的数值部分
    if(undefined===fileSizeUnit){
        imageFileSizeInByte=parseInt(fileSizeNum)
        return isNaN(imageFileSizeInByte) ? runtimeNodeError.image.cantParseFileSizeNum:{rc:0,msg:imageFileSizeInByte}
    }
    if('Ki'===fileSizeUnit){
//console.log('k')
        imageFileSizeNum =parseFloat(fileSizeNum)
        return isNaN(imageFileSizeNum) ? runtimeNodeError.image.cantParseFileSizeNum:{rc:0,msg:parseInt(fileSizeNum*1024)}
    }
    if('Mi'===fileSizeUnit){
        imageFileSizeNum=parseFloat(fileSizeNum)
        return isNaN(imageFileSizeNum) ? runtimeNodeError.image.cantParseFileSizeNum:{rc:0,msg:parseInt(fileSizeNum*1024*1024)}
    }
}
var getPemFile=function(pemPath){
    for(var i= 0,n=pemPath.length;i<n;i++){
        if(true===fileExist(pemPath[i])){
            //console.log(pemPath[i])
            return pemPath[i]

            //break
        }
    }
    return
}
var fileExist=function(file){
    return fs.existsSync(file)
    //console.log(fs.statSync(file))
    //try{
    //    fs.statSync(file)
    //    return true
    //}catch (e){
    //    console.log(e)
    //    return false
    //}
/*    if(undefined!==fs.statSync(file)){
        return true
    }else{
        return false
    }*/
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

//state只要不是undefine就可以
var checkUserStateNormal=function(req){
    return (1===req.session.state || 2===req.session.state) ? rightResult:runtimeNodeError.general.userStateWrong
}
/*var checkInterval=function(req){
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
}*/
//新版本,使用新的逻辑
//不管是request post还是get,都要和session中的lastPost/lastGet比较(如果session中有),然后保存
var newCheckInterval=function(req){
    //console.log('in')
    var curTime=new Date().getTime();//毫秒数

    var durationSinceLastPost;//当前时间和上次POST的间隔
    var durationSinceLastGet;//当前时间和上次GET的间隔
    var reqType;
    //获得必要的参数
    if (true===req.route.methods.get){
        reqType="GET"
    }
    if (true===req.route.methods.post){
        reqType="POST"
    }
    if(undefined===reqType){
        return runtimeNodeError.general.unknownRequestType;
    }


    if( undefined !=req.session.lastPost){
        durationSinceLastPost=curTime-req.session.lastPost
    }
    if( undefined !=req.session.lastGet){
        durationSinceLastGet=curTime-req.session.lastGet
    }
    //console.log(reqType)
    //console.log(durationSinceLastGet)
    //console.log(durationSinceLastPost)
    //检查

    if("POST"===reqType){
        if(undefined!==durationSinceLastPost){
            if(durationSinceLastPost<general.sameRequestInterval) {
                return runtimeNodeError.general.intervalPostPostWrong
            }
            if( durationSinceLastPost<general.differentRequestInterval){

                return  runtimeNodeError.general.intervalPostGetWrong
            }
        }
        req.session.lastPost=curTime
        return rightResult
    }
    if("GET"===reqType){
/*        console.log(durationSinceLastGet)
        console.log(curTime)
        console.log(req.session.lastGet)*/
        if(undefined!==durationSinceLastGet){
            if(durationSinceLastGet<general.sameRequestInterval) {

                return runtimeNodeError.general.intervalGetGetWrong
            }
            if( durationSinceLastGet<general.differentRequestInterval){
                return  runtimeNodeError.general.intervalGetPostWrong
            }
        }
        req.session.lastGet=curTime
        return rightResult
    }
}

var checkReqType=function(req){
    let reqType
    if (true===req.route.methods.get){
        reqType="GET"
    }
    if (true===req.route.methods.post){
        reqType="POST"
    }
    if (true===req.route.methods.delete){
        reqType="DELETE"
    }
    if (true===req.route.methods.put){
        reqType="PUT"
    }
    if (true===req.route.methods.head){
        reqType="HEAD"
    }
    if(undefined===reqType){
        return runtimeNodeError.general.unknownRequestType;
    }else{
        return {rc:0}
    }
}
// 检查
// 1. 用户是否通过get获得页面(req.session.state=1 or 2)
// 2. 根据user是否已经登陆，决定是否检查用户session中的用户id是否正确
// 3. 检查interval
// forceCheckUserLogin:true：强制检查用户已经登录； false：不检查用户是否已经登录
var preCheck=function(req, forceCheckUserLogin){
    var result=checkUserStateNormal(req)
    //console.log(result)
    if(result.rc>0){
        return result
    }

    if(true===forceCheckUserLogin){
        if(1!==req.session.state){
            return runtimeNodeError.general.userNotlogin
        }
    }

    if(1===req.session.state){
        result=checkUserId(req)
        if(result.rc>0){
            return result
        }
    }

    let typeResult=checkReqType(req)
    if(typeResult.rc && typeResult.rc>0){
        return typeResult
    }

    return {rc:0}
}

//根据page名和预定义，直接产生一个URL，用作Referer
var generateReferer=function(page){
    let validatePage=general.validatePage
    let newPage=(-1===validatePage.indexOf(page) ? 'main':page)
    let newPort=('80'===general.reqPort ? '':':'+general.reqPort)
    //console.log(newPage)
    return general.reqProtocol[0]+'://'+general.reqHostname+newPort+'/'+newPage
}

//判别URL是否为本网站的URL
//通过/进行分解，然后各部分进行比较
//返回boolean
// http://127.0.0.1:3002/article/asdf or http://127.0.0.1:3002/article?id=asdf
var validateOwnSiteURL=function(URL){
    let tmpPart
    if(undefined===URL || null===URL || ''===URL){
        return false
    }
    let tmp=URL.split('/')
    //至少包含http:  空白  和网址（IP地址）3部分
    if(tmp.length<3){
        return false
    }
//    check protocol(if http or https)
    let protocolValidate=false
    //console.log(tmp[0].replace(':',''))
    for(let idx in general.reqProtocol){
        if(-1!==tmp[0].replace(':','').indexOf(general.reqProtocol[idx])){
            protocolValidate=true
        }
    }
    if(false===protocolValidate){
        return false
    }
//    第二个值必须是空
    if(''!==tmp[1]){
        return false
    }
//    check website(IP) and port(127.0.0.1:3002===>127.0.0.1  3002)
    let wtmp=tmp[2].split(':')
    if(1!==wtmp.length && 2!==wtmp.length){
        return false
    }
    //网址或者IP是否正确
    if(undefined===wtmp[0] || null===wtmp[0] || ''===wtmp[0] || general.reqHostname!==wtmp[0]){
        return false
    }
    //如果定义使用80，只有在有port定义，且此定义不为预定义，才返回错（换句话说，如果定义80，那么URL没有port则为true）
    if('80'===general.reqPort.toString()){
        if(2===wtmp.length){
            if(undefined===wtmp[1] || null===wtmp[1] || ''===wtmp[1] || general.reqPort.toString()!==wtmp[1]){
                return false
            }
        }
    }else{
        //非80预定义port，如果URL没有port，false
        if(1===wtmp.length){
            return false
        }
        //说明URL有port:，那么必须必须符合定义的port
        if(2===wtmp.length){
            if(undefined===wtmp[1] || null===wtmp[1] || ''===wtmp[1] || general.reqPort.toString()!==wtmp[1]){
                return false
            }
        }
    }

//    检查网页名称
    if(undefined!==tmp[3] && null!==tmp[3] && ''!==tmp[3]){
        tmpPart=tmp[3]
        //网页不为空
        let validatePage=false
        //if(tmpPart && ''!==tmpPart){
        for(let idx in general.validatePage){

            if(-1!==tmpPart.indexOf(general.validatePage[idx])){
                validatePage=true
            }
        }
        //}
        if(false===validatePage){
            return false
        }
    }

//    没有错误
    return true
}
//和preCheck类似.1. 检查用户是否正常获得页面(通过get) 不检查userId(因为还没有登录)  2. request间隔
/*var preCheckAll=function(req) {
    var result = checkUserStateNormal(req)
    if (result.rc > 0) {
        return result
    }


    return newCheckInterval(req)
}*/
exports.generateFunction={
    parseGmFileSize:parseGmFileSize,
    convertImageFileSizeToByte:convertImageFileSizeToByte,
    convertURLSearchString:convertURLSearchString,
    getUserInfo:getUserInfo,
    generateRandomString:generateRandomString,
    checkUserState:checkUserState,
    checkUserId:checkUserId,
    checkInterval:newCheckInterval,
    preCheck:preCheck,
    fileExist:fileExist,
    getPemFile:getPemFile,
    generateReferer:generateReferer,
    validateOwnSiteURL:validateOwnSiteURL,
    //preCheckAll:preCheckAll
}
/*console.log(validateOwnSiteURL('personalInfo'))
console.log(validateOwnSiteURL('127.0.0.1:3002'))
console.log(validateOwnSiteURL('http://127.0.0.1:3002/asdv?adf'))
console.log(validateOwnSiteURL('http://127.0.0.1:80'))
console.log(validateOwnSiteURL('http://127.0.0.1'))
console.log(validateOwnSiteURL('http://127.0.0.1:3002:80'))
console.log(validateOwnSiteURL('http://127.0.0.1:3002'))
console.log(validateOwnSiteURL('http://127.0.0.1:3002/'))
console.log(validateOwnSiteURL('http://127.0.0.1:3002/article/adf'))*/
