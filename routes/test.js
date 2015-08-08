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
router.get('/', function (req, res, next) {
    /*   articleDbOperation.readArticle('34c77218da50255ae31083068cbe29f51d1dc50f',function(err,result){
     if(false===result.result){
     if(null===result.content){
     return res.render('error_page/article/articleNotExist',{title:'错误',message:"文档不存在"})
     }else{
     return res.json(result.content)
     }

     }
     if(true===result.result){
     assistFunc.eliminateId(result.content.keys)
     //assistFunc.eliminateId(result.content.comment)
     assistFunc.eliminateId(result.content.comment)
     assistFunc.eliminateId(result.content.innerImage)
     return res.json(result.content)
     }
     })*/


//console.log('in')

    var password='11';
    password=hashCrypt.hmac('sha1',password,pemFilePath);
//console.log(password)
    registerDbOperation.addUser('asdf',password,'',function(err,userResult) {
//console.log(err)
//console.log(userResult)
        //顶级文件，只要传递自定义错误即可，原始error已在最底层文件处理
        if (false === userResult.result) {
            return res.json(userResult.content)
        }
        if (true === userResult.result) {

            //return res.json(err,userResult.content)}
//console.log(userResult.content)
            articleDbOperation.createNewArticle('new_doc', userResult.content, function (err, article) {
                if (false===article.result) {
                    return res.json( article.content)
                }
//console.log(userResult.content)
                articleDbOperation.addComment(article.content, userResult.content, 'content1', function (err, commentResult) {
//console.log(err)
                    console.log(commentResult)
                    if (false===commentResult.result) {
                        return res.json( commentResult.content)
                    }
//console.log('comment added')
                    return res.json({rc: 0})
                })
            })
        }
    })

/*    articleDbOperation.addComment('34c77218da50255ae31083068cbe29f51d1dc50f', '55c4096740f0a0d025917528', 'content1', function (err, commentResult) {
//console.log(err)
//        console.log(commentResult)
        if (false===commentResult.result) {
            return res.json( commentResult.content)
        }
//console.log('comment added')
        return res.json({rc: 0})
    })*/
/*dbOperation.articleDboperation.updateArticleKey('b444ac06613fc8d63795be9ad0beaf55011936ac',['key5','key6'],function(err,result){
     if(true===result.result){
     return res.json({rc:0})
     }
     if(false===result.result && null!=result.content){
     return res.json(result.content)
     }
     })*/
/*    createNewArticle('test1','55c16361770d21f4344aeaa2',function(err,result){
     if(true===result){
         addComment('b444ac06613fc8d63795be9ad0beaf55011936ac','comment1',function(err1,result1){
             if(true===result1){
                 return res.json({rc:0})
             }else{
                 return res.json(result1)
             }
         })
        //return res.json({rc:0})
     }else{
         //console.log(result)
         return res.json(result)
     }
     })*/

/**/
/*    addComment('b444ac06613fc8d63795be9ad0beaf55011936ac','comment1',function(err1,result1){
        if(true===result1){
            return res.json({rc:0})
        }else{
            return res.json(result1)
        }
    })*/

    //article.save()
    /*    updateArticleContent('b444ac06613fc8d63795be9ad0beaf55011936ac','title',{title:'new'},function(err,result){
     if(true===result){
     res.json({rc:0})
     }else{
     res.json(result)
     }
     })*/
//console.log('test')

    /*    articleModel.findOne({_id:'b444ac06613fc8d63795be9ad0beaf55011936ac'},function(err,article){
     if(err){console.log(err)}

     getKeyId(['key1','key2'],function(err,keyArray){
     //console.log(keyArray)
     article.keys=keyArray
     article.save()
     })
     })*/
    /*    addAttachment('b444ac06613fc8d63795be9ad0beaf55011936ac',{_id:'b444ac06613fc8d63795be9ad0beaf55011936ac',name:'test',storePath:'d:/',size:11111},function(err,result){
     if(result===true){
     return res.json({rc:0})
     } else{
     console.log(result)
     }
     })*/

    /*    delAttachment('b444ac06613fc8d63795be9ad0beaf55011936ac', 'b444ac06613fc8d63795be9ad0beaf55011936ac', function (err, result) {
     if (true === result) {
     return res.json({rc: 0})
     } else {
     console.log(result)
     }
     })*/



/*
        delComment('b444ac06613fc8d63795be9ad0beaf55011936ac', '55be0e5915553a08c0c1830f', function (err, result) {
     if (true === result) {
     res.json({rc: 0})
     } else {
     res.json(result)
     }

     })
*/

});

module.exports = router;
