/**
 * Created by zw on 2015/10/2.
 */
var express = require('express');
var router = express.Router();

/*router.post('/',function(req,res,next){
    //获取当前用户的状态，显示 登录|注册，还是用户名|退出



        return res.json({rc:0,msg:result})
})*/

router.post('/',function(req,res,next){
//用户退出
    req.session.userId=undefined
    req.session.userName=undefined
    req.session.state=2;//匿名用户
    return res.json({rc:0,msg:null})
})
module.exports = router;
