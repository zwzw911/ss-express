/**
 * Created by wzhan039 on 2015-07-30.
 */
var express = require('express');
var router = express.Router();
var articleDbOperation=require('./model/article').articleDboperation
var registerDbOperation=require('./model/register')
var hashCrypt=require('./express_component/hashCrypt')
var pemFilePath='./other/key/key.pem';// ./而不是../
var assistFunc=require('./assist_function/article').assistFunc
var errorRecorder=require('./express_component/recorderError').recorderError

var personalArticleDbOperation=require('./model/personalArticle').personalArticleDbOperation
var general=require('./assist/general').general
router.get('/', function (req, res, next) {
//res.render('error_page/error')
    //res.redirect('error_page/error.ejs')
//if( 1===req.session.state){
//    //console.log(req.session.state)
//        var rootFolderName=general.defaultRootFolderName
//
//        personalArticleDbOperation.createRootFolder(req.session.userId,rootFolderName[0],function(err,result1){
//            //console.log(result1)
//            if(0<result1.rc){
//                return res.json(result1)
//            }
//            personalArticleDbOperation.createRootFolder(req.session.userId,rootFolderName[1],function(err,result2){
//                return res.json(result2)
//            })
//        })
//}

    articleDbOperation.createNewArticle('新建文件',req.session.userId,function(err,result){
        return res.json(result)
    })
});

module.exports = router;
