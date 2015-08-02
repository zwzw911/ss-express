/**
 * Created by wzhan039 on 2015-06-29.
 */
var express = require('express');
var router = express.Router();

var hashCrypt=require('../public/javascripts/express_component/hashCrypt');
var errorMsg=require('./assist/input_error').registerLoginErrorMsg;
var inputDefine=require('./assist/input_define').inputDefine;

var userModel=require('../public/javascripts/model/db_structure').user;


var hackerPage='/users/api';
var pemFilePath='./other/key/key.pem';


var mongooseError=require('./assist/3rd_party_error_define').mongooseError;
var errorRecorder=require('../public/javascripts/express_component/recorderError').recorderError;
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
    }else{
        var postUserName = req.body.name;
        userModel.count({'name': postUserName}, function (err, result) {
            if (err) {
                errorRecorder(err.code,err.errmsg,'register','countUser')
                return res.json(mongooseError.countUser)
                //res.json({rc: 1, msg: '用户检查失败'})
            }
            //var userExists;
            //console.log(result)
            result>0 ? res.json({rc: 3, msg:"用户名已存在"}):res.json({rc: 0});
            //res.json({rc: 0, exists: userExists});
        });
    }
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


        if(inputDefine.name.required || (!inputDefine.name.required && name!='')){
            if(name.length<2 || name.length>20) {
                //console.log(errorMsg.name.length)
                res.json(errorMsg.name.length);
                //res.json({rc:3,msg:"用户名由2到20个字符组成"})
                return
            }
        }

        if(inputDefine.password.required || (!inputDefine.password.required && password!='') )
        {
            if(password.length<2 || password.length>20){
                res.json(errorMsg.password.length);
                //res.json({rc:4,msg:"密码由2到20个字符组成"})
                return
            }
            var pattern=/^[A-Za-z0-9\~\\!\@\#\$\%\^\&\*\)\(\_\+\=\-\`\}\{\:\"\|\?\>\<\,\./;'\\\[\]]$/;
            for (var i=0;i<password.length;i++){
                if(password.charCodeAt(i)>255 || false===pattern.test(password[i]) ){
                    res.json(errorMsg.password.length);
                    //res.json({rc:4,msg:"密码由字母、数字和特殊符号组成"})
                    return
                }
            }
        }


        if(repassword!=password){
            res.json(errorMsg.repassowrd.content);
            //res.json({rc:5,msg:"两次密码输入不一样"})
            return
        }

        if(inputDefine.mobilePhone.required || (!inputDefine.mobilePhone.required && mobilePhone!='') ){
            var pattern=/\d{11}/
            if(pattern.test(mobilePhone)){
                res.json(errorMsg.mobilePhone.length);
                return
            }
        }

//console.log(userModel)

        //db side check
        password=hashCrypt.hmac('sha1',password,pemFilePath);
        var newUser=new userModel({name:name,password:password,cDate:new Date(),mDate:new Date()});
        newUser.validate(function(err){
            if(err){
                //console.log(err.errors)
                //console.log(err.errors.name.path)
                if(err.errors.name){
                    errorRecorder(mongooseError.userNameValidateFail,err.message,'register','addUser')
                    return res.json(mongooseError.userNameValidateFail);
                }
                if(err.errors.password){
                    errorRecorder(mongooseError.userPwdValidateFail,err.message,'register','addUser')
                    return res.json(mongooseError.userPwdValidateFail);//cause password should be hashed then stored
                    ;
                }

            }


        });
        userModel.count({'name': name}, function (err, result) {
            if (err) {
                errorRecorder(err.code,err.errmsg,'login','countUser')
                return res.json(mongooseError.countUser)
            }
            //var userExists;
            //console.log(result)
            if(result>0){
                return res.json({rc: 3, msg:"用户名已存在"})
            } else{

                newUser.save();
//console.log('here')
               return res.json({rc: 0});
            }
            //res.json({rc: 0, exists: userExists});
        });
    }
});
/*var checkUser=function(userName){

}*/
module.exports = router;