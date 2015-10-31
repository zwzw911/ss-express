/**
 * Created by wzhan039 on 2015-09-29.
 */
var userModel=require('./db_structure').userModel;
var errorRecorder=require('../express_component/recorderError').recorderError;
var input_validate=require('../error_define/input_validate').input_validate
var runtimeDbError=require('../error_define/runtime_db_error').runtime_db_error
var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error
var validateDb=require('../error_define/3rd_party_error_define').validateDb;

var checkUserValidate=function(name,cryptPwd,callback){
    userModel.find({'name':name,'password':cryptPwd},function(err,result){
        //throw err
        if(err) {
            //throw err
            errorRecorder({rc:err.code,msg:err.errmsg},'login','countUser')
            return callback(err,runtimeDbError.user.findUser)
        }
//console.log(result)
        if(0===result.length){
            return callback(null,runtimeDbError.user.findNoUserWhenLogin)
        }
        if(1<result.length){
            return callback(null,runtimeDbError.user.findMultiUserWhenLogin)
        }
//console.log(result[0])
        if(1===result.length){
            return callback(null,{rc:0,msg:result[0]})
        }

    })
}

var addUser=function(name,password,mobilePhone,callback){
    var user=new userModel();
    user.name=name
    user.password=password;
//console.log(user)
    if(null!=mobilePhone || undefined!=mobilePhone){
        user.mobilePhone=mobilePhone;
    }

    user.cDate=new Date();

    validateDb.user(user,'register','addUser',function(validateErr,validateResult){
console.log(validateErr)
console.log(validateResult)
        if(0<validateResult.result){
            return callback(validateErr,validateResult);
        }
//console.log(user)
        userModel.count({'name': name}, function (err, result) {
            if (err) {
                errorRecorder(err.code,err.errmsg,'register','countUser')
                return callback(err,runtimeDbError.user.count)
                //return res.json(mongooseError.countUser)
            }
//console.log(result)
//                if(null===result){
//                    return callback(null,true)
//                }
            if(result.rc>0){
                return callback(null,runtimeNodeError.user.userAlreadyExist)               //return res.json({rc: 3, msg:"用户名已存在"})
            }
            user.save(function(err,addedUser,num){
                if (err){
                    errorRecorder({rc:err.code,msg:err.errmsg},'register','saveUser')
                    return callback(err,runtimeDbError.user.save)
                }
                    return callback(null,{rc:0,msg:addedUser._id})

            });

        });

    })


};

exports.userDbOperation={
    checkUserValidate:checkUserValidate,
    addUser:addUser
}