/**
 * Created by ada on 2015/5/30.
 */
var express = require('express');
var router = express.Router();
var mainDbOperation=require('./model/mainModel').mainDboperation

var generalFunc=require('./express_component/generalFunction').generateFunction
var general=require('./assist/general').general
//console.log('main')
router.get('/',function(req,res,next){
    if(undefined===req.session.state){req.session.state=2}
    var preResult=generalFunc.preCheckAll(req)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    res.render('main',{title:'首页',year:new Date().getFullYear()});
})

router.post('/',function(req,res,next){
    //console.log(req.session)
  /*  if(undefined===req.session.state || (1!=req.session.state && 2!=req.session.state)){
        res.json({rc:2,msg:'请重新载入页面'});
        return;
    }*/
    var preResult=generalFunc.preCheckAll(req)
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
