/**
 * Created by ada on 2015/5/30.
 */
var express = require('express');
var router = express.Router();

var generalFunc=require('./express_component/generalFunction').generateFunction

router.get('/',function(req,res,next){
    if(undefined===req.session.state){req.session.state=2}

    res.render('main',{title:'首页',year:new Date().getFullYear()});
})

router.post('/',function(req,res,next){
    if(undefined===req.session.state || (1!=req.session.state && 2!=req.session.state)){
        res.json({rc:2,msg:'请重新载入页面'});
        return;
    }
    var result={
        lastWeekCollect:[],
        lastWeekClick:[],
        latestArticle:[]
        //userInfo:generalFunc.getUserInfo(req)
    };
    result.userInfo=generalFunc.getUserInfo(req)
    return res.json({rc:0,msg:result})
})
module.exports = router;
