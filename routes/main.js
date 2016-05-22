/**
 * Created by ada on 2015/5/30.
 */
    'use strict'
var express = require('express');
var router = express.Router();
var mainDbOperation=require('./model/mainModel').mainDboperation

var generalFunc=require('./express_component/generalFunction').generateFunction
var general=require('./assist/general').general
var checkInteval=require('./express_component/checkInterval').checkInterval

var async=require('async')
//作为中间件使用
//router.use(function(req,res,next){
//    checkIntevalMid(req,res,next)
//})

//var get=function(preResult,)
router.get('/',function(req,res,next){
    async.waterfall([
        function(cb){
            checkInteval(req,function(err,result){
                if(result.rc>0){
                    return res.render('error_page/error',{errorMsg:result.msg})
                }
                cb(null,null)//no any param need to pass to next function
            })
        },
        function(cb){
            //console.log(req.session.state)
            if(undefined===req.session.state){req.session.state=2}
            //console.log(req.session)
            var preResult=generalFunc.preCheck(req,false)
            //console.log(preResult)
            if(preResult.rc>0){
                return res.json(preResult)
            }
            res.render('main',{title:'首页',year:new Date().getFullYear()});
        }
    ])


})

router.put('/',function(req,res,next){
    //console.log(req.session)
  /*  if(undefined===req.session.state || (1!=req.session.state && 2!=req.session.state)){
        res.json({rc:2,msg:'请重新载入页面'});
        return;
    }*/
    //console.log(req.session)

    var preResult=generalFunc.preCheck(req,false)
    if(preResult.rc>0){
        return res.json(preResult)
    }

    mainDbOperation.getLatestArticle(function(err,result){
        if(0<result.rc){
            return res.json(result)
        }

        if(undefined!==result.msg && 0<result.msg.length){
            result.msg.forEach(function(e){

                if(undefined!==e.pureContent && e.pureContent.length>general.truncatePureContent){
                    e.pureContent= e.pureContent.substr(0,general.truncatePureContent)+' ......'
                }
            })
        }
        var result={
            lastWeekCollect:[],
            lastWeekClick:[],
            latestArticle:result.msg
            //userInfo:generalFunc.getUserInfo(req)
        };
        result.userInfo=generalFunc.getUserInfo(req)
        return res.json({rc:0,msg:result})
    })

})
module.exports = router;
