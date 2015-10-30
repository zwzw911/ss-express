var dbStructure=require("./db_structure"),userModel=dbStructure.userModel,validateDb=require("../error_define/3rd_party_error_define").validateDb,input_validate=require("../error_define/input_validate").input_validate,errorRecorder=require("../express_component/recorderError").recorderError,runtimeDbError=require("../error_define/runtime_db_error").runtime_db_error,runtimeNodeError=require("../error_define/runtime_node_error").runtime_node_error,hashCrypt=require("../express_component/hashCrypt"),async=require("async"),general=require("../assist/general").general,generalFunc=require("../express_component/generalFunction").generateFunction,pemFilePath=generalFunc.getPemFile(general.pemPath),getBasicInfo=function(a,b){userModel.findById(a,function(a,c){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"getBasicInfo","findById"),b(a,runtimeDbError.user.findById)):b(null,{rc:0,msg:c})})},saveBasicInfo=function(a,b,c,d){userModel.findById(a,function(a,e){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"getBasicInfo","findById"),d(a,runtimeDbError.user.findById)):(e.name=b,e.mobilePhone=c,console.log(e),void validateDb.user(e,"saveBasicInfo","validate",function(a,b){return 0<b.rc?d(null,b):void e.save(function(a){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"getBasicInfo","save"),d(a,runtimeDbError.user.save)):d(null,{rc:0,msg:null})})}))})},savePasswordInfo=function(a,b,c,d){var e=hashCrypt.hmac("sha1",b,pemFilePath);userModel.find({_id:a,password:e},function(a,b){if(a)return errorRecorder({rc:a.code,msg:a.errmsg},"savePasswordInfo","find"),d(a,runtimeDbError.user.findUser);if(0===b.length)return d(null,runtimeDbError.user.findUserByPwd);if(1<b.length)return d(null,runtimeDbError.user.findUserMulti);var e=b[0],f=hashCrypt.hmac("sha1",c,pemFilePath);e.password=f,e.save(function(a){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"savePasswordInfo","save"),d(a,runtimeDbError.user.save)):d(null,{rc:0,msg:null})})})};exports.personalInfoDbOperation={getBasicInfo:getBasicInfo,saveBasicInfo:saveBasicInfo,savePasswordInfo:savePasswordInfo};