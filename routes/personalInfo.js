/**
 * Created by wzhan039 on 2015-09-08.
 */
var express = require('express');
var router = express.Router();
var personalInfoDbOperation=require('./model/personalInfo').personalInfoDbOperation

var input_valid=require('./error_define/input_validate').input_validate
var runtimeNodeError=require('./error_define/runtime_node_error').runtime_node_error
var generalFunc=require('./express_component/generalFunction').generateFunction
//var personalInfoDbOperation=require('./model/personalInfo').personalInfoDbOperation
router.get('/',function(req,res,next){
    var userInfo=generalFunc.getUserInfo(req)
    if(undefined===userInfo){
        res.redirect('login')
    }
    return res.render('personalInfo',{title:'用户中心',year:new Date().getFullYear()})
})
router.post('/',function(req,res,next){
    var result={}
    result.userInfo=generalFunc.getUserInfo(req)
    return res.json({rc:0,msg:result})
})
router.post('/getBasicInfo',function(req,res,next){
    //console.log(req.session.userId)
    var preResult=generalFunc.preCheck(req)

    if(preResult.rc>0){
        return res.json(preResult)
    }

    personalInfoDbOperation.getBasicInfo(req.session.userId,function(err,result){

        if(result.rc>0){
            return res.json(result)
        }

        var finalData={}

        finalData.name=result.msg.name;
        finalData.mobilePhone=result.msg.mobilePhone

        return res.json({rc:0,msg:finalData})
    })
})

router.post('/saveBasicInfo',function(req,res,next){
    var preResult=generalFunc.preCheck(req)
    if(preResult.rc>0){
        return res.json(preResult)
    }

    var userName=req.body.userName;
    var mobilePhone=req.body.mobilePhone;
    if(undefined===userName){
        return res.json(input_valid.user.name.require.client)
    }
    //console.log(0)
    if(!input_valid.user.name.type.define.test(userName)){
        return res.json(input_valid.user.name.type.client)
    }
//console.log(1)
    if(!input_valid.user.name.type.define.test(mobilePhone)){
        return res.json(input_valid.user.mobilePhone.type.client)
    }
    personalInfoDbOperation.saveBasicInfo(req.session.userId,userName,mobilePhone,function(err,result){

        return res.json(result)
    })
})

router.post('/savePasswordInfo',function(req,res,next){
    var preResult=generalFunc.preCheck(req)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    var oldPassword=req.body.oldPassword;
    var newPassword=req.body.newPassword;
    var rePassword=req.body.rePassword;

    if(undefined===oldPassword){
        return res.json(input_valid.user.oldPassword.require.client)
    }
    if(!input_valid.user.oldPassword.type.define.test(oldPassword)){
        return res.json(input_valid.user.oldPassword.type.client)
    }

    if(undefined===newPassword){
        return res.json(input_valid.user.newPassword.require.client)
    }
    if(!input_valid.user.oldPassword.type.define.test(newPassword)){
        return res.json(input_valid.user.newPassword.type.client)
    }

    if(newPassword!==rePassword){
        return res.json(input_valid.user.rePassword.equal.client)
    }

    //新旧密码一样，直接返回
    if(oldPassword===newPassword){
        return res.json({rc:0,msg:null})
    }
    personalInfoDbOperation.savePasswordInfo(req.session.userId,oldPassword,newPassword,function(err,result){
        return res.json(result)
    })
})

module.exports = router;
