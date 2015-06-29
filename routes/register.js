/**
 * Created by wzhan039 on 2015-06-29.
 */
var express = require('express');
var router = express.Router();

/* GET users listing. */
//session.state; null=hack(no get);1=already login;2=not login
router.get('/', function(req, res, next) {
    if(req.session.state==undefined){
        //res.render('index',{title:'SS'});
    }else if(req.session.state===1){
        res.redirect('/');
    }else if(req.session.state===2) {
        res.render('register', {title: '注册'})
    }
}

router.post('/common', function(req, res, next) {
    var user=req.body.user;
    var password=req.body.password;
}
router.post('/vendor', function(req, res, next) {
    var user=req.body.user;
    var password=req.body.password;
    var mobilePhone=req.body.mobilePhone;

}
router.post('/checkUser', function(req, res, next) {
    /*res.cookie('f',1,cookieSessionClass.cookieOptions);
     req.session.num=1;*/
    //console.log('login.js 2 app');
    //res.redirect(302,'../users/api');
    //return;
    if(req.session.state==undefined){
        //res.redirect(303,'../users/api');
        //res.send('test');
        //res.render('api',{title:'test'});
        //return;
        //res.redirect(301,'http://www.baidu.com');
        //window.location.href='/users/api';
        res.json({newurl:'/users/api'});
    }else if(req.session.state===1){
        res.json({newurl:'/'});
    }else if(req.session.state===2){
        //console.log(req.session.test);
        var postUserName = req.body.name;
        //console.log(postUserName);


        //var instUser=new user({name:'test',password:'test'});
        //instUser.save(function(err){console.log(err)});
        user.count({'name': postUserName}, function (err, result) {
            if (err) {
                res.json({rc: 1, msg: '用户检查失败'})
            }
            //console.log(result);
            var userExists;
            if (result > 0) {
                userExists = true
            }
            else {
                userExists = false
            }
            ;
            res.json({rc: 0, exists: userExists});
        });
    } else{
        res.json({newurl:'/'});
    }
    //res.json({ rc:0});
});