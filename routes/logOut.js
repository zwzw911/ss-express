/**
 * Created by zw on 2015/10/2.
 */
var express = require('express');
var router = express.Router();

var generalFunc=require('./express_component/generalFunction').generateFunction

router.post('/',function(req,res,next){
//用户退出
    var preResult=generalFunc.preCheck(req,false)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    req.session.userId=undefined
    req.session.userName=undefined
    req.session.state=2;//匿名用户
    return res.json({rc:0,msg:null})
})
module.exports = router;
