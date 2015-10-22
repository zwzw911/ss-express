/**
 * Created by wzhan039 on 2015-06-29.
 */
var express = require('express');
var router = express.Router();

var hashCrypt=require('./express_component/hashCrypt');
//var errorMsg=require('./assist/input_error').registerLoginErrorMsg;
//var inputDefine=require('./assist/input_define').inputDefine;


var input_validate=require('./error_define/input_validate').input_validate
var runtimeDbError=require('./error_define/runtime_db_error').runtime_db_error
var runtimeNodeError=require('./error_define/runtime_node_error').runtime_node_error

var userModel=require('./model/db_structure').userModel;
var generalFunc=require('./express_component/generalFunction').generateFunction

var hackerPage='/users/api';
;// ./而不是../  ?


var mongooseError=require('./assist/3rd_party_error_define').mongooseError;
var errorRecorder=require('./express_component/recorderError').recorderError;
var general=require('./assist/general').general;
//var userDbOperation=require('./model/register');
var userDbOperation=require('./model/user').userDbOperation;
//用来创建2个默认目录
var personalArticleDbOperation=require('./model/personalArticle').personalArticleDbOperation;
/* GET users listing. */
//session.state; null=hack(no get);1=already login;2=not login
var pemFilePath=generalFunc.getPemFile(general.pemPath)
router.get('/', function(req, res, next) {

    if(req.session.state==undefined){
        //res.render('index',{title:'SS'});
        req.session.state=2
    }
    var preResult=generalFunc.preCheckNotLogin(req)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    res.render('register', {title: '注册',year:new Date().getFullYear()})
})

router.post('/common', function(req, res, next) {
    var user=req.body.user;
    var password=req.body.password;
    res.render('register', {title: '注册'});
});
router.post('/vendor', function(req, res, next) {
    var user=req.body.user;
    var password=req.body.password;
    var mobilePhone=req.body.mobilePhone;

})

/*
* 1 mongoose error 2 state wrong  3 user exists   3
* */
router.post('/checkUser', function(req, res, next){
//console.log(req.session)

    var preResult=generalFunc.preCheckNotLogin(req)
    if(preResult.rc>0){
        return res.json(preResult)
    }

    var postUserName = req.body.name;
    if(undefined===postUserName){
        return res.json(input_validate.user.name.require.client)
    }
    if(!input_validate.user.name.type.define.test(postUserName)){
        return res.json(input_validate.user.name.type.client)
    }
    userModel.count({'name': postUserName}, function (err, result) {
        if (err) {
            errorRecorder({rc:err.code,msg:err.errmsg},'register','countUser')
            return res.json(runtimeDbError.user.count)
            //res.json({rc: 1, msg: '用户检查失败'})
        }
        //var userExists;
        //console.log(result)
        result>0 ? res.json(runtimeNodeError.user.userAlreadyExist):res.json({rc: 0});
        //res.json({rc: 0, exists: userExists});
    });

});


/*
* 1 mongoose error 2 state wrong
* 100 name length wrong
* 102 password lenghth wrong 103 password content wrong
* 105 repassword wrong
* 107 mobilePhone length wrong   108 mobilePhone content wrong
*
* */

router.post('/addUser', function(req, res, next) {
    var preResult=generalFunc.preCheckNotLogin(req)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    var name = req.body.name;
    var password=req.body.password;
    var repassword=req.body.repassword;
    var mobilePhone=req.body.mobilePhone;


    if(input_validate.user.name.require.define && (undefined===name || null===name || ''===name)){
        return res.json(input_validate.user.name.require.client)
    }

    if(!input_validate.user.name.type.define.test(name)){
        return res.json(input_validate.user.name.type.client)
    }

    if(input_validate.user.password.require.define && (undefined===password || null===password || ''===password)){
        return res.json(input_validate.user.password.require.client)
    }
    if(!input_validate.user.password.type.define.test(password)){
        return res.json(input_validate.user.password.type.client)
    }

    if(repassword!=password){
        return res.json(runtimeNodeError.user.rePasswordFail);
        //res.json({rc:5,msg:"两次密码输入不一样"})

    }
//console.log(mobilePhone)
    if(input_validate.user.mobilePhone.require.define || (!input_validate.user.mobilePhone.require.define && (undefined!==mobilePhone && null!==mobilePhone && ''===mobilePhone)) ){
        if(!input_validate.user.mobilePhone.type.define.test(mobilePhone)){
            return res.json(input_validate.user.mobilePhone.type.client)
        }
    }
//console.log(password)
    password=hashCrypt.hmac('sha1',password,pemFilePath);

//console.log(password)
    userDbOperation.addUser(name,password,mobilePhone,function(err,result){
        //console.log(result)
        if(0===result.rc){
            req.session.userId=result.msg
            req.session.userName=name
            req.session.state=1//注册完毕直接生效
            var rootFolderName=general.defaultRootFolderName

            personalArticleDbOperation.createRootFolder(result.msg,rootFolderName[0],function(err,result1){
                //console.log(result1)
                if(0<result1.rc){
                    return res.json(result1)
                }
                personalArticleDbOperation.createRootFolder(result.msg,rootFolderName[1],function(err,result2){
                    //无需返回两个根目录的值
                    if(0<result2.rc){
                        return res.json(result2)
                    }
                    return res.json({rc:0,msg:null})
                })
            })
        }else{
            return res.json(result)
        }
    })

});
/*var checkUser=function(userName){

}*/
module.exports = router;