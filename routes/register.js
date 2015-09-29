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


var hackerPage='/users/api';
var pemFilePath='./other/key/key.pem';// ./而不是../  ?


var mongooseError=require('./assist/3rd_party_error_define').mongooseError;
var errorRecorder=require('./express_component/recorderError').recorderError;
var general=require('./assist/general').general;
//var userDbOperation=require('./model/register');
var userDbOperation=require('./model/user').userDbOperation;
//用来创建2个默认目录
var personalArticleDbOperation=require('./model/personalArticle').personalArticleDbOperation;
/* GET users listing. */
//session.state; null=hack(no get);1=already login;2=not login

router.get('/', function(req, res, next) {
    if(req.session.state==undefined){
        //res.render('index',{title:'SS'});
        req.session.state=2
        res.render('register', {title: '注册'})
    }else if(req.session.state===1){
        //res.redirect('/');
        res.render('register', {title: '注册'})
    }else if(req.session.state===2) {
        res.render('register', {title: '注册'})
    }
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
router.post('/checkUser', function(req, res, next) {
    if(req.session.state==undefined){
        res.json({rc:2,url:hackerPage});
    }
    var postUserName = req.body.name;
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
    if(req.session.state==undefined){
        res.json({rc:2,url:hackerPage});
    }else{
        var name = req.body.name;
        var password=req.body.password;
        var repassword=req.body.repassword;
        var mobilePhone=req.body.mobilePhone;


        if(input_validate.user.name.require.define && (undefined===name || null===name || ''===name)){
            return res.json(input_validate.user.name.require.client)
        }
        if(input_validate.user.name.type.define.test(name)){
            return res.json(input_validate.user.name.type.client)
        }

        if(input_validate.user.password.require.define && (undefined===password || null===password || ''===password)){
            return res.json(input_validate.user.password.require.client)
        }
        if(input_validate.user.password.type.define.test(nampassworde)){
            return res.json(input_validate.user.password.type.client)
        }

        if(repassword!=password){
            return res.json(runtimeNodeError.user.rePasswordFail);
            //res.json({rc:5,msg:"两次密码输入不一样"})

        }

        if(inputDefine.mobilePhone.required || (!inputDefine.mobilePhone.required && mobilePhone!='') ){
            var pattern=/\d{11}/
            if(pattern.test(mobilePhone)){
                res.json(errorMsg.mobilePhone.length);
                return
            }
        }
//console.log(password)
        password=hashCrypt.hmac('sha1',password,pemFilePath);

//console.log(password)
        userDbOperation.addUser(name,password,mobilePhone,function(err,result){
            //console.log('test')
            if(true===result.result){
                req.session.user=result.content
                var rootFolderName=general.defaultRootFolderName

                personalArticleDbOperation.createRootFolder(result.content,rootFolderName[0],function(err,result1){
                    if(0<result1.rc){
                        return res.json(result1)
                    }
                    personalArticleDbOperation.createRootFolder(result.content,rootFolderName[1],function(err,result2){
                        //无需返回两个根目录的值
                            return res.json({rc:0,msg:null})
                    })
                })
            }else{
                return res.json(result.content)
            }
        })
    }
});
/*var checkUser=function(userName){

}*/
module.exports = router;