/**
 * Created by wzhan039 on 2015-09-08.
 */
/*                              db                                */
var dbStructure=require('./db_structure');
var userModel=dbStructure.userModel;

/*                         validate and error                           */
var validateDb=require('../assist/3rd_party_error_define').validateDb;
var input_validate=require('../error_define/input_validate').input_validate;
var errorRecorder=require('../express_component/recorderError').recorderError;
var runtimeDbError=require('../error_define/runtime_db_error').runtime_db_error;
var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error;

/*                          MISC                                    */
var hashCrypt=require('../express_component/hashCrypt');
var async=require('async')
var general=require('../assist/general').general
var generalFunc=require('../express_component/generalFunction').generateFunction
var pemFilePath=generalFunc.getPemFile(general.pemPath); //相对于网站根目录（此处是h:/ss_express/ss_express/)
/********************************************************************/
/*                          function                                */
/********************************************************************/

var getBasicInfo=function(userId,callback){
    userModel.findById(userId,function(err,findedUser){
        if(err){
            errorRecorder({rc: err.code, msg: err.errmsg}, 'getBasicInfo', 'findById');
            return callback(err, runtimeDbError.user.findById)
        }
        return callback(null,{rc:0,msg:findedUser})
    })
}
var saveBasicInfo=function(userId,userName,mobilePhone,callback){
    userModel.findById(userId,function(err,findedUser){
        if(err){
            errorRecorder({rc: err.code, msg: err.errmsg}, 'getBasicInfo', 'findById');
            return callback(err, runtimeDbError.user.findById)
        }
        findedUser.name=userName;
        findedUser.mobilePhone=mobilePhone;
//console.log(findedUser)
        validateDb.user(findedUser,'saveBasicInfo','validate',function(err,validateResult){
            if(0<validateResult.rc){
                return callback(null,validateResult)
            }
            findedUser.save(function(err){
                if(err){
                    errorRecorder({rc: err.code, msg: err.errmsg}, 'getBasicInfo', 'save');
                    return callback(err, runtimeDbError.user.save)
                }
                return callback(null,{rc:0,msg:null})
            })
        })
    })
}
var savePasswordInfo=function(userId,oldPassword,newPassword,callback){
    var encryptedPassword=hashCrypt.hmac('sha1',oldPassword,pemFilePath);
//console.log(encryptedPassword)
    userModel.find({_id:userId,password:encryptedPassword},function(err,findedUser){
        if(err){
            errorRecorder({rc: err.code, msg: err.errmsg}, 'savePasswordInfo', 'find');
            return callback(err, runtimeDbError.user.findUser)
        }
        if(0===findedUser.length){
            return callback(null,runtimeDbError.user.findUserByPwd)
        }
        if(1<findedUser.length){
            return callback(null,runtimeDbError.user.findUserMulti)
        }

        var user=findedUser[0]
        var newEncryptPassword=hashCrypt.hmac('sha1',newPassword,pemFilePath);
        user.password=newEncryptPassword;
        user.save(function(err){
            if(err){
                errorRecorder({rc: err.code, msg: err.errmsg}, 'savePasswordInfo', 'save');
                return callback(err, runtimeDbError.user.save)
            }
            return callback(null,{rc:0,msg:null})
        })
    })
}

exports.personalInfoDbOperation={
    getBasicInfo:getBasicInfo,
    saveBasicInfo:saveBasicInfo,
    savePasswordInfo:savePasswordInfo
}