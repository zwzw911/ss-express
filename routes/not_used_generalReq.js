/**
 * Created by zw on 2015/10/4.
 */
var express = require('express');
var router = express.Router();


router.post('/quit',function(req,res,next){
    //无需检查，直接把session对应的数据清空
    req.session.userId=undefined
    req.session.userName=undefined
    return res.json({rc:0})
})
module.exports = router;
