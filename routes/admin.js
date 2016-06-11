/**
 * Created by zw on 2016/2/12.
 */
    'use strict'
var express = require('express');
var router = express.Router();

var settingGeneralError=require('./error_define/runtime_node_error').runtime_node_error.setting
var defaultSetting=require('./inputDefine/adminLogin/defaultGlobalSetting').defaultSetting
var internalSetting=require('./inputDefine/adminLogin/defaultGlobalSetting').internalSetting
//var miscFunc=require('./assist_function/miscellaneous').func
//var runtimeRedisError=require('./error_define/runtime_redis_error').runtime_redis_error
var dataOperation=require('./model/redis/CRUDGlobalSetting').globalSetting
var rightResult={rc:0}

var inputValidateFunc=require('./assist_function/inputValid').inputValid

var inputRuleDefine=require('./inputDefine/adminLogin/inputRuleDefine').inputRuleDefine
var adminLoginDbOperation=require('./model/redis/adminLogin').dbOperation

var runtimeNodeError=require('./error_define/runtime_node_error').runtime_node_error

var runtimeRedisError=require('./error_define/runtime_redis_error').runtime_redis_error
var miscFunc=require('./assist_function/miscellaneous').func

var fs=require('fs')
var path=require('path')
var multiparty = require('multiparty');

var assistFunc=require('./admin_assist_func').admin_assist_func

var Upload=require('./express_component/upload').Upload
/****************************************/
/****************************************/
/*             GlobalSetting            */
/****************************************/
/****************************************/
//检查上传的数据是否是预定义的item/subItem
//上传的数据是setting:{
// inner_image:{
//  uploadPath:{value:xxx}
// }
// }
//有错: 1. 返回是{ inner_image:{ uploadPath:{ rc:xx,msg:xxx}}}或者setting:{ inner_image:{ rc:xxx,msg:xxx}}
//      2. {rc:xxxx,msg}
//无错,返回{rc:0}
var checkDataDefined=function(req){

    var errorFlag=false;//根据errorFlag决定是否返回{rc:0}
    var result={}
    if(miscFunc.isEmpty(req.body.setting)){
        return settingGeneralError.itemNotDefined
    }
    var setting=req.body.setting
    for(let item in setting){
        if(miscFunc.isEmpt(defaultSetting[item])){
            result[item]=settingGeneralError.itemNotDefined
            return result
        }
        result[item]={}
        for(let subitem in setting[item]){
            if(undefined===defaultSetting[item][subitem]){
                result[item][subitem]=settingGeneralError.subitemNotDefined
                errorFlag=true
                //return result
            }else{
                result[item][subitem]=rightResult
            }

        }
    }
    return errorFlag ? result:rightResult;

}

//对应的值是不是存在
var checkUploadDataExist=function(req){

    if(miscFunc.isEmpty(req.body.setting)){
        return settingGeneralError.itemNotDefined
    }
    var setting=req.body.setting
    var errorFlag=false;
    var result={};
    for(let item in setting){
        result[item]={}
        for(let subitem in setting[item]){
            if(undefined===setting[item][subitem]['value'] || null===setting[item][subitem]['value'] || ''===setting[item][subitem]['value']){
                result[item][subitem]=settingGeneralError.emptyGlobalSettingValue;
                errorFlag=true;
            }else{
                result[item][subitem]=rightResult
            }
        }

    }
    return errorFlag ? result:rightResult;
}

//数据是否存在和是否合格分成2个函数,以便调试
var checkDataValid=function(req){
    if(miscFunc.isEmpty(req.body.setting)){
        return settingGeneralError.itemNotDefined
    }
    var setting=req.body.setting
    var errorFlag=false;
    var result={};
    for(let item in setting){
        result[item]={}
        for(let subItem in setting[item]){
            let newValue=setting[item][subItem]['value']
            //根据类型进行检测，没有type定义，直接pass
            if(defaultSetting[item][subItem]['type']){
                switch (defaultSetting[item][subItem]['type']){
                    case 'int':
                        //console.log()
                        if(false===miscFunc.isInt(newValue)){
                            result[item][subItem]=settingGeneralError.settingValueNotInt;
                            errorFlag=true;
                        }
                        if(defaultSetting[item][subItem]['max']){
                            let newValueInt=parseInt(newValue)
                            if(newValueInt>defaultSetting[item][subItem]['max']){
                                result[item][subItem]=settingGeneralError.settingValueExceedMaxInt;
                                errorFlag=true;
                            }
                            //最小值检查包含在最大值检查中
                            // 最小值没有定义，默认是0
                            let definedMinValue=0
                            if(defaultSetting[item][subItem]['min']){
                                definedMinValue=parseInt(defaultSetting[item][subItem]['min'])
                            }
                            if(newValueInt<definedMinValue){
                                result[item][subItem]=settingGeneralError.settingValueExceedMinInt
                                errorFlag=true;
                            }
                        }
                        break;
                    case 'path':
                        if(false===miscFunc.isFolder(newValue)){
                            result[item][subItem]=settingGeneralError.settingValuePathNotExist
                            errorFlag=true;
                        }
                        if(defaultSetting[item][subItem]['maxLength']){
                            let definedMaxLength=defaultSetting[item][subItem]['maxLength']
                            if(newValue.length>definedMaxLength){
                                result[item][subItem]=defaultSetting[item][subItem]['client']['maxLength']
                                errorFlag=true;
                            }
                            //check min
                            let definedMinLength=0
                            if(defaultSetting[item][subItem]['minLength']){
                                definedMinLength=defaultSetting[item][subItem]['minLength']
                            }
                            if(newValue.length<definedMinLength){
                                result[item][subItem]=defaultSetting[item][subItem]['client']['minLength']
                                errorFlag=true;
                            }
                        }
                        break;
                    case 'file':
                        if(false===miscFunc.isFile(newValue)){
                            result[item][subItem]=settingGeneralError.settingValueFileNotExist
                            errorFlag=true;
                        }
                        if(defaultSetting[item][subItem]['maxLength']){
                            let definedMaxLength=defaultSetting[item][subItem]['maxLength']
                            if(newValue.length>definedMaxLength){
                                result[item][subItem]=defaultSetting[item][subItem]['client']['maxLength']
                                errorFlag=true;
                            }
                            //check min
                            let definedMinLength=0
                            if(defaultSetting[item][subItem]['minLength']){
                                definedMinLength=defaultSetting[item][subItem]['minLength']
                            }
                            if(newValue.length<definedMinLength){
                                result[item][subItem]=defaultSetting[item][subItem]['client']['minLength']
                                errorFlag=true;
                            }
                        }
                        break;
                }
            }
        }
    }
    return errorFlag ? result:rightResult;
}

//客户端传来的数据是setting:{item:{subItem1:{value:val1},item:{subItem2:{value:val2}}}
//需要转换成setting:{item:{subItem1:val1,item:value:val2}},以便redis保存(hash set)
var dataConvertToServer=function(req){
    if(miscFunc.isEmpty(req.body.setting)){
        return settingGeneralError.itemNotDefined
    }
    var setting=req.body.setting
    let convertedData={}
    for(let item in setting){
        if(!convertedData[item]){
            convertedData[item]={}
        }
        for(let subItem in setting[item]){
            convertedData[item][subItem]=setting[item][subItem]['value']
        }
    }
    return convertedData
}

//直接返回value，其它属性定义直接在client端完成
/*//cilent由2部分组成：数据，属性
//根据redis中获得数据，添加type属性,在client根据type转换成对应的input类型;根据max/maxLength/min/minLength推断maxLength/minLength
//{item:{subItem1:value1,subItem2:value2}}====>{item:{subItem1:{value:value1,type:'text'},subItem2:{value:value2,type:'text'}}
//server:type            client:inputType
//int                      text
//folder                    text
//file                      text
var dataConvertToClient=function(valueObj){
    //和cilent中定义一致
    let  inputTypeEnum={text:'text',password:'password',number:'number'}
    for(let item of Object.keys(valueObj)){
        if(undefined===item){
            return valueObj
        }
        for(let subItem of Object.keys(valueObj[item])){
            //转换子项数据结构,保存value
            let tmpSubItemValue=valueObj[item][subItem]
            valueObj[item][subItem]={}
            valueObj[item][subItem]['value']=tmpSubItemValue

            //保存类型
            if(undefined===defaultSetting[item][subItem]['type']){
                valueObj[item][subItem]['type']=inputTypeEnum.text
            }else{
                switch(defaultSetting[item][subItem]['type']){
                    case 'int':
                        valueObj[item][subItem]['type']=inputTypeEnum.text
                        break;
                    case 'folder':
                        valueObj[item][subItem]['type']=inputTypeEnum.text
                        break
                    case 'file':
                        valueObj[item][subItem]['type']=inputTypeEnum.text
                        break
                    //object不做任何操作,在client扩张,设为bollean
                    case 'object':
                        break
                    default:
                        valueObj[item][subItem]['type']=inputTypeEnum.text
                }
            }

            //推断maxLength/minLength,作为页面input的属性(限制输入)
            //有type,才能进行推断
            //默认max/min,如果没有定义,取此

            if(undefined!==defaultSetting[item][subItem]['type']){
                let defaultMaxLength=40;
                let defaultMinLength=1;
                switch(defaultSetting[item][subItem]['type']){
                    case 'int':
                        (undefined!==defaultSetting[item][subItem]['max']) ?  valueObj[item][subItem]['maxLength']=defaultSetting[item][subItem]['max'].toString().length:valueObj[item][subItem]['maxLength']=defaultMaxLength;
                        (undefined!==defaultSetting[item][subItem]['min']) ? valueObj[item][subItem]['minLength']=defaultSetting[item][subItem]['min'].toString().length:valueObj[item][subItem]['minLength']=defaultMinLength;
                        break;
                    case 'path':
                        (undefined!==defaultSetting[item][subItem]['maxLength']) ?  valueObj[item][subItem]['maxLength']=defaultSetting[item][subItem]['maxLength']:valueObj[item][subItem]['maxLength']=defaultMaxLength;
                        (undefined!==defaultSetting[item][subItem]['minLength']) ? valueObj[item][subItem]['minLength']=defaultSetting[item][subItem]['minLength']:valueObj[item][subItem]['minLength']=defaultMinLength;
                        break
                    case 'file':
                        (undefined!==defaultSetting[item][subItem]['maxLength']) ?  valueObj[item][subItem]['maxLength']=defaultSetting[item][subItem]['maxLength']:valueObj[item][subItem]['maxLength']=defaultMaxLength;
                        (undefined!==defaultSetting[item][subItem]['minLength']) ? valueObj[item][subItem]['minLength']=defaultSetting[item][subItem]['minLength']:valueObj[item][subItem]['minLength']=defaultMinLength;
                        break
                    //object不做任何操作,在client扩张,设为bollean
                    case 'object':
                        break
                    default:
                        valueObj[item][subItem]['type']=inputTypeEnum.text
                }
            }
        }
    }

    return valueObj
}*/

//result 放入value
//{item:{subItem1:value1,subItem2:value2}}====>{item:{subItem1:{value:value1},subItem2:{value:value2}}
var dataConvertToClient=function(valueObj){
    for(let item in valueObj){
        if(undefined===item){
            return valueObj
        }
        for(let subItem in valueObj[item]) {
//console.log(subItem)
            //转换子项数据结构,保存value
            let value=valueObj[item][subItem]
            valueObj[item][subItem]={}
            valueObj[item][subItem]['value']=value
            //valueObj[item][subItem]=undefined
        }
    }
    return valueObj
}
/*****************************************/
/*****************************************/
/*****      adminLogin相关函数        *****/
/*****************************************/
/*****************************************/
var genStoreSendUserPassword=function(cb){
    let user=miscFunc.generateRandomString(4,false)
    let password=miscFunc.generateRandomString(6,false)
    adminLoginDbOperation.setUserNamePassword(user,password,function(err,result){
        if(0===result.rc){
            /*发送用户名密码*/
            return cb(null,rightResult)
        }
        return cb(null,result)
    })
}

router.get("/",function(req,res,next){
/*console.log(req.session)
    if(undefined===req.session.id || null===req.session.id){
        req.session.regenerate(function(err){
            if(err){
                console.log(err)
            }

        })
    }*/
    //确认产生cookie，常给客户端，以后后续使用session id
    if(undefined===req.session.state){req.session.state=2}
    res.render('admin',{title:'首页',year:new Date().getFullYear()})
})

//上传的数据是setting:{
// inner_image:{
//  uploadPath:{value:xxx}
// }
// }
//返回是setting:{ inner_image:{ uploadPath:{ rc:xx,msg:xxx}}}
//无论是item还是subItem,都是用同一个函数(只是上传的数据多少)
router.put("/checkData",function(req,res,next){
    adminLoginDbOperation.getAdminLoginState(req.session.id,function(err,login){
        //尚未登录，产生用户名密码
        if(runtimeNodeError.adminLogin.notLogin.rc===login.rc){
            genStoreSendUserPassword(function(err,result){
                if(0<result.rc){
                    return res.json(result)
                }
            })
        }
        //非 没有登录的错误
        if(0<login.rc){
            return res.json(login)
        }

        //数据项/数据子项是否是预定义
        let checkDataDefinedResult=checkDataDefined(req)
//console.log(checkDataDefinedResult)
        if( checkDataDefinedResult.rc && 0!==checkDataDefinedResult.rc){
            return res.json(checkDataDefinedResult)
        }
        //数据是否存在
        let checkUploadDataExistResult=checkUploadDataExist(req)
//console.log(checkUploadDataExistResult)
        if(checkUploadDataExistResult && 0!==checkUploadDataExistResult.rc){
            return res.json(checkUploadDataExistResult)
        }
        //数据是否符合定义的格式
        let checkDataValidResult=checkDataValid(req)
        if(checkDataValidResult && 0!==checkDataValidResult.rc){
            return res.json(checkDataValidResult)
        }
//console.log(checkDataValidResult)
        return res.json(rightResult)
    })

})

//router.post("/checkItemData",function(req,res,next){
//    res.render('admin',{title:'首页',year:new Date().getFullYear()})
//})

//为了节省带宽(其实不必),每次只传输一个item的数据
//格式为items:[itemName]
router.put("/getItemData",function(req,res,next){
    adminLoginDbOperation.getAdminLoginState(req.session.id,function(err,login) {
        //尚未登录，产生用户名密码
        if(runtimeNodeError.adminLogin.notLogin.rc===login.rc){
            genStoreSendUserPassword(function(err,result){
                if(0<result.rc){
                    return res.json(result)
                }
            })
        }
        //非 没有登录的错误
        if(0<login.rc){
            return res.json(login)
        }
        //console.log()
        let items=req.body.items
        //console.log(req.body.items)
        //数据项是否是预定义
        for(let item of items) {
            //console.log(item)
            if (undefined === defaultSetting[item]) {
                return settingGeneralError.itemNotDefined
            }
        }
        //console.log(1)
        dataOperation.getItemSetting(items[0],function(err,result){
            //console.log(result)
            if(result.rc && result.rc>0){
                return res.json(result)
            }
//console.log(dataConvertToClient(result.msg))
            return res.json({rc:0,msg:dataConvertToClient(result.msg)})
        })
    })

})

//客户端传来的数据是setting:{item:{subItem1:{value:val1},item:{subItem2:{value:val2}}}
router.put("/setItemData",function(req,res,next){
    adminLoginDbOperation.getAdminLoginState(req.session.id,function(err,login) {
        //尚未登录，产生用户名密码
        if(runtimeNodeError.adminLogin.notLogin.rc===login.rc){
            genStoreSendUserPassword(function(err,result){
                if(0<result.rc){
                    return res.json(result)
                }
            })
        }
        //非 没有登录的错误
        if(0<login.rc){
            return res.json(login)
        }
        //数据项/数据子项是否是预定义
        let checkDataDefinedResult=checkDataDefined(req)
        if(checkDataDefinedResult && 0!==checkDataDefinedResult.rc){
            return res.json(checkDataDefinedResult)
        }
//console.log(1)
        //数据是否存在
        let checkUploadDataExistResult=checkUploadDataExist(req)
        if(checkUploadDataExistResult && 0!==checkUploadDataExistResult.rc){
            return res.json(checkUploadDataExistResult)
        }
//console.log(1)
        //数据是否符合定义的格式
        let checkDataValidResult=checkDataValid(req)
        if(checkDataValidResult && 0!==checkDataValidResult.rc){
            return res.json(checkDataValidResult)
        }

        //数据转换成redis格式
        let settingObj=dataConvertToServer(req)
//console.log(settingObj)
        //保存虽然异步,但是不care返回值
        dataOperation.setAllSetting(settingObj)
        return res.json(rightResult)
    })

})

//全局定义导出到本地文件
router.get('/exportSetting',function(req,res,next){
    //console.log('tttt')
    adminLoginDbOperation.getAdminLoginState(req.session.id,function(err,login) {
        //尚未登录，产生用户名密码
        if (runtimeNodeError.adminLogin.notLogin.rc === login.rc) {
            genStoreSendUserPassword(function (err, result) {
                if (0 < result.rc) {
                    return res.json(result)
                }
            })
        }
        //非 没有登录的错误
        if (0 < login.rc) {
            return res.json(login)
        }
        dataOperation.getAllSetting(function (err, result) {
            if (0 < result.rc) {
                return res.json(result)
            }
            let setting = JSON.stringify(result.msg)
            fs.open(internalSetting.globalSettingBackupPath, 'w', function (err, fd) {
                if (err) {
                    return res.json(runtimeNodeError.fs.openGlobalSettingFileFailed)
                }
                fs.write(fd, setting, 'utf8', function (err, result) {
                    if (err) {
                        return res.json(runtimeNodeError.fs.writeGlobalSettingFileFailed)
                    }
                    //console.log(path.basename(internalSetting.globalSettingBackupPath))
                    res.download(internalSetting.globalSettingBackupPath, path.basename(internalSetting.globalSettingBackupPath))
                })
            })
        })
    })

//}
})



//全局定义从本地导入到server
router.post('/uploadSettingFile',function(req,res,next){
/*console.log(req.body.data)
    var out=fs.createWriteStream('H:/ss_express/ss-express/test.png')
    out.write(req.body.data)*/
    //console.log(req.body)
    var form = new multiparty.Form({uploadDir:path.dirname(internalSetting.globalSettingBackupPath) ,maxFilesSize:internalSetting.globalSettingBackupSize});
    form.parse(req, function (err, fields, files) {
        var filesTmp = JSON.stringify(files, null, 2);
        var fieldsTemp = JSON.stringify(fields, null, 2);
//console.log(files);
//console.log(err)
        if (err) {
            var msg = '';
            switch (err.status) {
                case 413:
                    return res.json(runtimeNodeError.importSetting.fileExceedMaxSize)
                    break
            }
            //return res.json({rc: err.status, msg: msg})
        }

        //importSetting: input的name
/*        { fieldName: 'importSetting',
            originalFilename: 'setting.txt',
            path: 'h:\\ss_express\\ss-express\\10sGCLLA32u1enHWlf7eV_9T.txt',
            headers:
            { 'content-disposition': 'form-data; name="importSetting"; filename="setting.txt"',
                'content-type': 'text/plain' },
            size: 1716 }*/
        if(files['importSetting'].length>0){
            let uploadFile=files['importSetting'][0]['path']
            //console.log(uploadFile)
            if(0===uploadFile.size){
                fs.unlink(uploadFile)
                return res.json(runtimeNodeError.importSetting.fileContentIsEmpty)
            }

            fs.readFile(uploadFile,'utf8',function(err,data){
                if(err){
                    return res.json(runtimeNodeError.importSetting.fileReadFail)
                }
                fs.unlink(uploadFile)
                return res.json(assistFunc.checkImportSetting(data))
            })
        }

    })
})

router.post('/uploadFileContent',function(req,res,next){
    if(true===miscFunc.isEmpty(req.body.data)){
        return res.json(runtimeNodeError.importSetting.fileContentIsEmpty)
    }
    if(internalSetting.globalSettingBackupSize<req.body.data.toString().length){
        return res.json(runtimeNodeError.importSetting.fileExceedMaxSize)
    }
    let content=JSON.parse(req.body.data)
    //console.log(content)
    let checkResult=assistFunc.checkImportSetting(content)
    //console.log(checkResult)
    if(0<checkResult.rc){
        return res.json(checkResult)
    }else{
        dataOperation.setAllSetting(content)
        return res.json({rc:0})
    }

/*    for(let item in content){
        dataOperation.setAllSetting(content[item])
    }*/
})
/****************************************/
/****************************************/
/*********      adminLogin    ***********/
/****************************************/
/****************************************/

//执行登录操作
//传入传输：inputUserNamePassword={adminName:'xxxx',adminLogin:'yyyyy'},
router.put('/adminLogin',function(req,res,next){
    let inputValidateResult=inputValidateFunc.checkInput(req.body.inputUserNamePassword,inputRuleDefine.adminLogin)
    if(inputValidateResult.rc>0){
        return res.json(inputValidateResult)
    }
    let inputUserName=req.body.inputUserNamePassword['userName']['value']
    let inputUserPassword=req.body.inputUserNamePassword['password']['value']
    adminLoginDbOperation.adminLogin(req.session.id,inputUserName,inputUserPassword,function(err,result){
        //如果没有用户名，密码（等待时间过长），重新生成用户名密码，并告知用户重新登录
        if(runtimeNodeError.adminLogin.notSaveUserNamePassword.rc===result.rc){
            genStoreSendUserPassword(function(err,genResult){
//console.log(genResult)
                if(0<genResult.rc){
                    return res.json(genResult)
                }
                    let rc={}
                    rc['rc']=runtimeNodeError.adminLogin.notSaveUserNamePassword.rc
                    rc['msg']='重新生成用户名密码，接收到到后请重新输入'
                    return res.json(rc)

            })
        }else{
            return res.json(result)
        }
//console.log(result)

    })
    /*adminLoginDbOperation.getAdminFailLoginTimes(function(err,adminFailLoginTimesResult){
        if(0<adminFailLoginTimesResult.rc){
            return res.json(adminFailLoginTimesResult)
        }
        let adminFailLoginTimes=adminFailLoginTimesResult.msg
        dataOperation.getItemSetting('adminLogin',function(err,adminLoginSetting){
            if(0<adminLoginSetting.rc){
                return res.json(adminLoginSetting)
            }
            let definedAdminFailLoginTimes=adminLoginSetting['maxFailLoginTimes']
            if(adminFailLoginTimes>definedAdminFailLoginTimes){
                return res.json(runtimeNodeError.adminLogin.reachMaxTryTimes)
            }
            adminLoginDbOperation.userNamePasswordExist(function(err,exist){
                if(exist.rc===runtimeRedisError.adminLogin.userPasswordNotExist.rc){
                    let adminUserNamePassword={}
                    adminUserNamePassword['adminName']=miscFunc.generateRandomString(4,false)
                    adminUserNamePassword['adminPassword']=miscFunc.generateRandomString((8,true))
                    //临时存在5min，所以无需加密
                    adminLoginDbOperation.setUserNamePassword(adminUserNamePassword)
                    return res.json(runtimeNodeError.adminLogin.regenUserNamePassword)
                }
                if(0<exist.rc){
                    return res.json(exist)
                }
                adminLoginDbOperation.getUserNamePassword(function(err,userPwd){
                    if(0<userPwd.rc){
                        return res.json(userPwd)
                    }
                    let dbUserName=userPwd['adminName']
                    let dbUserPassword=userPwd['adminPassword']
                    if(inputUserName!==dbUserName || inputUserPassword!==dbUserPassword){
                        definedAdminFailLoginTimes+=1
                        adminLoginDbOperation.setAdminFailLoginTimes(definedAdminFailLoginTimes)
                        return res.json(runtimeNodeError.adminLogin.adminLoginFail)
                    }
                    adminLoginDbOperation.setExistFlag(req)
                    return res.json(rightResult)
                })
            })

        })

    })*/

})



module.exports = router;
//test()