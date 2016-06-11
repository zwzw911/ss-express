/**
 * Created by wzhan039 on 2015-09-08.
 */
    'use strict'
var express = require('express');
var router = express.Router();
var personalInfoDbOperation=require('./model/personalInfo').personalInfoDbOperation

var input_valid=require('./error_define/input_validate').input_validate
var runtimeNodeError=require('./error_define/runtime_node_error').runtime_node_error
var generalFunc=require('./express_component/generalFunction').generateFunction
var CRUDGlobalSetting=require('./model/redis/CRUDGlobalSetting').globalSetting

//var path=require('path')
var Upload=require('./express_component/upload').Upload
var hash=require('./express_component/hashCrypt');
var image=require('./express_component/image');

var fs=require('fs')
//var personalInfoDbOperation=require('./model/personalInfo').personalInfoDbOperation
router.get('/',function(req,res,next){
    var preResult=generalFunc.preCheck(req,true)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    var userInfo=generalFunc.getUserInfo(req)
    //console.log(userInfo)
    if(undefined===userInfo){
        res.redirect('login')
    }
    return res.render('personalInfo',{title:'用户中心',year:new Date().getFullYear()})
})
router.put('/',function(req,res,next){
    var preResult=generalFunc.preCheck(req,true)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    var result={}
    result.userInfo=generalFunc.getUserInfo(req)
    return res.json({rc:0,msg:result})
})
router.put('/getBasicInfo',function(req,res,next){
    var preResult=generalFunc.preCheck(req,true)
    if(preResult.rc>0){
        return res.json(preResult)
    }

    personalInfoDbOperation.getBasicInfo(req.session.userId,function(err,result){

        if(result.rc>0){
            return res.json(result)
        }
        //读取绝对路径，并获得相对目录路径user_icon
        CRUDGlobalSetting.getSingleSetting('userIcon','uploadDir',function(err,dir){
            if(dir.rc>0){
                return res.json(dir)
            }
            //console.log(dir)
            let tmp=dir.msg.split('/')
            //console.log(path.sep)
            let relativeDir=tmp[tmp.length-2] //H:/ss_express/ss-express/user_icon/====>[ 'H:', 'ss_express', 'ss-express', 'user_icon', '' ]=====>user_icon
            let finalData={}

            finalData.name=result.msg.name;
            finalData.mobilePhone=result.msg.mobilePhone
            finalData.thumbnail='/'+relativeDir+'/'+result.msg.thumbnail // /user_icon/b10e366431927231a487f08d9d1aae67f1ec18b4.png

            return res.json({rc:0,msg:finalData})
        })

    })
})

router.put('/saveBasicInfo',function(req,res,next){
    var preResult=generalFunc.preCheck(req,true)
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
    if(undefined!==mobilePhone &&!input_valid.user.mobilePhone.type.define.test(mobilePhone)){
        return res.json(input_valid.user.mobilePhone.type.client)
    }
    personalInfoDbOperation.saveBasicInfo(req.session.userId,userName,mobilePhone,function(err,result){

        return res.json(result)
    })
})

router.put('/savePasswordInfo',function(req,res,next){
    var preResult=generalFunc.preCheck(req,true)
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

router.post('/uploadCroppedImg',function(req,res,next){
    CRUDGlobalSetting.getItemSetting('userIcon',function(err,settingResult){
//console.log(result)
        if(settingResult.rc>0){
            return res.json(settingResult)
        }

        let uploadOption={
            'name':'file',//上传的文件数组名字
            'uploadFolder':settingResult.msg.userIcon.uploadDir,
            'maxSize':settingResult.msg.userIcon.userIconMaxSizeGm*1000,//kB
            'maxFileNum':10
        }
        let uploadIst=Upload.Create(uploadOption)
        let initResult=uploadIst.init()
//console.log(initResult)
        uploadIst.info(req,function(err,result){
//console.log(result)
            if(0<result.rc){
                return res.json(result)
                //console.log(uploadFiles)
            }

            let uploadFiles=result.msg
            let file=uploadFiles[0]
/*            { fieldName: 'file',
                originalFilename: 'blob',
                path: 'H:\\ss_express\\ss-express\\user_icon\\MzpLJEcR1JHxMdH7KoGc-h_Y',
                headers:
                { 'content-disposition': 'form-data; name="file"; filename="blob"',
                    'content-type': 'image/png' },
                size: 9159 }*/
            //检查是否为png(size在Upload中已经check)不符合，则删除，并报错
            image.image.getter.format(file.path,function(err,formatResult){
                if(formatResult.rc>0){
                    return res.json(formatResult)
                }
//console.log(new Date().getTime()+req.session.userName)
                let hashName=hash.hash('sha1',new Date().getTime()+req.session.userName)+'.png'
                fs.renameSync(file.path,settingResult.msg.userIcon.uploadDir+hashName)
                personalInfoDbOperation.saveUserIcon(req.session.userId,hashName,function(err,result){
                    //成功保存，返回0和原始头像文件名
                    if(0===result.rc){
                        //console.log(settingResult.msg.userIcon.uploadDir+result.msg)
                        fs.unlink(settingResult.msg.userIcon.uploadDir+result.msg)
                    }
                    return res.json(result)
                })

                //return res.json({rc:0})
            })


            //console.log(file)

        })
    })

    /*    let result=uploadIst.info(req)
     console.log(result)
     if(0<result.rc){
     return res.json(result)
     //console.log(uploadFiles)
     }
     let uploadFiles=result.msg
     let file=uploadFiles[0]
     console.log(file)
     return {rc:0}*/
})

module.exports = router;
