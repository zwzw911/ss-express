/**
 * Created by zw on 2015/9/20.
 */
var express = require('express');
var router = express.Router();

var searchResultDbOperation=require('./model/searchResult').searchResultDbOperation
var general=require('./assist/general').general
var miscellaneous=require('./assist_function/miscellaneous').func
var generalFunc=require('./express_component/generalFunction').generateFunction

var runtimeNodeError=require('./error_define/runtime_node_error').runtime_node_error
//var test=require('./model/db_Maintain').func
var colorfulResult=function(keyArray,results){
    //console.log(results)
    var len=results.length
    //console.log(len)
    if(0===len){
        return true
    }
    //构建RE
    var keyLen=keyArray.length
    var p,p4Content,tmp;
    for(var i=0;i<keyLen;i++){
        if(0==i){
            tmp=keyArray[i]
        }else{
            tmp+='|';
            tmp+=keyArray[i]
        }

    }
    //console.log(tmp)
    //p=new RegExp(tmp,'gi')
    p=new RegExp('('+tmp+')','gi')
    p4Content=new RegExp('('+tmp+')','i')//为了获得第一个匹配字符串的长度，去掉

    var startIdx,endIdx,calcStartIdx,calcEndIdx;//计算content的开始/结束idx，因为只要显示部分内容即可（其中包含至少一个匹配字符）
//console.log(p)
//    对所有文档进行替换
    for(var i=0;i<len;i++){
        //title
        results[i].title= results[i].title.replace(p,'<span class="text-danger">$1</span>')
        //keys
        var articleKesLen=results[i].keys.length
        for(j=0;j<articleKesLen;j++){
            results[i].keys[j]=results[i].keys[j].replace(p,'<span class="text-danger">$1</span>')
            //results[i].keys[j]=results[i].keys[j].replace(p,"p $1 p")
            //console.log(results[i].keys[j])
        }
    //    pureContent
    //    console.log(p4Content)
    //    console.log(results[i].pureContent)
        if(undefined!==results[i].pureContent) {
            var matchedContent = results[i].pureContent.match(p4Content)

            //内容没有匹配，则取
            if (null === matchedContent) {
                results[i].pureContent = results[i].pureContent.substr(0, general.showContentLength)
            } else {

                calcStartIdx = matchedContent.index - parseInt(general.showContentLength / 2)
                startIdx = ( calcStartIdx > 0) ? calcStartIdx : 0
                calcEndIdx = matchedContent.index + parseInt(general.showContentLength / 2)
                endIdx = (calcEndIdx > results[i].pureContent.length) ? results[i].pureContent.length : calcEndIdx
                results[i].pureContent = results[i].pureContent.substring(startIdx, endIdx)
                results[i].pureContent = results[i].pureContent.replace(p, '<span class="text-danger">$1</span>')
            }
        }
    }

    //console.log(results)

}

//因为model中返回的是aggregate后又populate的数据，无法toObject，所以mDate一直是Date（mongodb）格式，无论输入什么，都会转换成mongodb-》date
//为了正确的显示日期，只能把result的结果复制给一个object
var convertDate=function(results){


    var convertedResult=[]
    if(0===results.length){
        return convertedResult
    }

    var tmpSingleResult
    var fields=['hashId', 'author', 'title', 'htmlContent', 'pureContent', 'keys', 'mDate']
    results.forEach(function(singleResult){
        tmpSingleResult={}
        fields.forEach(function(singleField){
            if('mDate'===singleField){
                tmpSingleResult[singleField]=miscellaneous.expressFormatLongDate(singleResult[singleField])
            }else{
                tmpSingleResult[singleField]=singleResult[singleField]
            }
        })
        convertedResult.push(tmpSingleResult)
    })

    return convertedResult
}
router.get('/',function(req,res,next){
    //只负责显式页面(而不做任何判断和跳转,判断留给POST,跳转留给client. server端的跳转会导致原始页面的js脚本无法正确读取)
    if(undefined===req.session.state){
        req.session.state=2
    }
    var preResult=generalFunc.preCheckNotLogin(req)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    return res.render('searchResult',{title:'搜索结果',year:new Date().getFullYear()})
})

router.post('/',function(req,res,next){
    if(undefined===req.session.state){
        req.session.state=2
    }
    var preResult=generalFunc.preCheckNotLogin(req)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    var wd=req.body.wd
//console.log(wd)
    var curPage=req.body.curPage
    //处理关键字:'key1 key2 key3'
    if(''===wd || undefined===wd || null===wd){
        //console.log(typeof (wd))
        return res.redirect('searchPage')
    }

    if(undefined===curPage || curPage.toString()!==parseInt(curPage).toString()){
        return res.json(runtimeNodeError.searchResult.pageNumWrong)
    }

    //只查找关键字
    /*    var keyArray=wd.split(/\s+/)
     searchResultDbOperation.getSearchResult(keyArray,function(err,result){
     return res.json(result)
     })*/
    wd=generalFunc.convertURLSearchString(wd)
//    对title/pureContent/Key进行文本查找
    searchResultDbOperation.getSearchResult1(wd,curPage,function(err,result){
        //查询字符串装换成数组，以便调用colorfulResult
        if(0===result.rc && undefined!==result.msg && undefined!==result.msg.results){
            //var tmpResults=result.msg.toObject()
            var keyArray=wd.split(/\s+/)
            colorfulResult(keyArray,result.msg.results)
            result.msg.userInfo=generalFunc.getUserInfo(req)
            result.msg.results=convertDate(result.msg.results)
        }
        return res.json(result)
    })
})

module.exports = router;