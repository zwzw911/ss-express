var express=require("express"),router=express.Router(),hashCrypt=require("./express_component/hashCrypt"),input_validate=require("./error_define/input_validate").input_validate,runtimeDbError=require("./error_define/runtime_db_error").runtime_db_error,runtimeNodeError=require("./error_define/runtime_node_error").runtime_node_error,userModel=require("./model/db_structure").userModel,generalFunc=require("./express_component/generalFunction").generateFunction,hackerPage="/users/api",mongooseError=require("./error_define/3rd_party_error_define").mongooseError,errorRecorder=require("./express_component/recorderError").recorderError,general=require("./assist/general").general,userDbOperation=require("./model/user").userDbOperation,personalArticleDbOperation=require("./model/personalArticle").personalArticleDbOperation,pemFilePath=generalFunc.getPemFile(general.pemPath);router.get("/",function(a,b,c){void 0==a.session.state&&(a.session.state=2);var d=generalFunc.preCheck(a,!1);return d.rc>0?b.json(d):void b.render("register",{title:"注册",year:(new Date).getFullYear()})}),router.post("/common",function(a,b,c){var d=generalFunc.preCheck(a,!1);if(d.rc>0)return b.json(d);a.body.user,a.body.password;b.render("register",{title:"注册"})}),router.post("/vendor",function(a,b,c){var d=generalFunc.preCheck(a,!1);if(d.rc>0)return b.json(d);a.body.user,a.body.password,a.body.mobilePhone}),router.post("/checkUser",function(a,b,c){var d=generalFunc.preCheck(a,!1);if(d.rc>0)return b.json(d);var e=a.body.name;return void 0===e?b.json(input_validate.user.name.require.client):input_validate.user.name.type.define.test(e)?void userModel.count({name:e},function(a,c){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"register","countUser"),b.json(runtimeDbError.user.count)):void(c>0?b.json(runtimeNodeError.user.userAlreadyExist):b.json({rc:0}))}):b.json(input_validate.user.name.type.client)}),router.post("/addUser",function(a,b,c){var d=generalFunc.preCheck(a,!1);if(d.rc>0)return b.json(d);var e=a.body.name,f=a.body.password,g=a.body.repassword,h=a.body.mobilePhone;return!input_validate.user.name.require.define||void 0!==e&&null!==e&&""!==e?input_validate.user.name.type.define.test(e)?!input_validate.user.password.require.define||void 0!==f&&null!==f&&""!==f?input_validate.user.password.type.define.test(f)?g!=f?b.json(runtimeNodeError.user.rePasswordFail):!input_validate.user.mobilePhone.require.define&&(input_validate.user.mobilePhone.require.define||void 0===h||null===h||""!==h)||input_validate.user.mobilePhone.type.define.test(h)?(f=hashCrypt.hmac("sha1",f,pemFilePath),void userModel.count({name:e},function(c,d){return c?(errorRecorder({rc:c.code,msg:c.errmsg},"register","countUser"),b.json(runtimeDbError.user.count)):d>0?b.json(runtimeNodeError.user.userAlreadyExist):void userDbOperation.addUser(e,f,h,function(c,d){if(0!==d.rc)return b.json(d);a.session.userId=d.msg,a.session.userName=e,a.session.state=1;var f=general.defaultRootFolderName;personalArticleDbOperation.createRootFolder(d.msg,f[0],function(a,c){return 0<c.rc?b.json(c):void personalArticleDbOperation.createRootFolder(d.msg,f[1],function(a,c){return 0<c.rc?b.json(c):b.json({rc:0,msg:null})})})})})):b.json(input_validate.user.mobilePhone.type.client):b.json(input_validate.user.password.type.client):b.json(input_validate.user.password.require.client):b.json(input_validate.user.name.type.client):b.json(input_validate.user.name.require.client)}),module.exports=router;