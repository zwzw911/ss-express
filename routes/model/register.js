/**
 * Created by wzhan039 on 2015-08-04.
 */

var dbStructure=require('./db_structure');
var errorRecorder=require('../express_component/recorderError').recorderError;

var userError=require('../assist/server_error_define').userError;
var mongooseError=require('../assist/3rd_party_error_define').mongooseError;
var validateDb=require('../assist/3rd_party_error_define').validateDb;
var userModel=dbStructure.userModel;

var addUser=function(name,password,mobilePhone,callback){
    var user=new userModel();
    user.name=name
    user.password=password;
    if(null!=mobilePhone || undefined!=mobilePhone){
        user.mobilePhone=mobilePhone;
    }

    user.cDate=new Date();

    validateDb.user(user,'register','addUser',function(validateErr,validateResult){
        if(true!=validateResult){
            return callback(validateErr,{result:false,content:validateResult});
        }else{
//console.log(user)
            userModel.count({'name': name}, function (err, result) {
                if (err) {
                    errorRecorder(err.code,err.errmsg,'register','countUser')
                    return callback(err,{result:false,content:mongooseError.countUser})
                    //return res.json(mongooseError.countUser)
                }
//console.log(result)
//                if(null===result){
//                    return callback(null,true)
//                }
                if(result>0){
                    return callback(null,{result:false,content:userError.userExist.error})
                    //return res.json({rc: 3, msg:"用户名已存在"})
                } else{
                    user.save(function(err,addedUser,num){
                        if (err){
                            errorRecorder(err.code,err.errmsg,'register','saveUser')
                            return callback(err,{result:false,content:mongooseError.saveUser})
                        }else{
//console.log(addedUser)
                            return callback(null,{result:true,content:addedUser._id})
                        }
                    });
                }
            });
        }
    })


};

exports.addUser=addUser;