/**
 * Created by wzhan039 on 2015-07-30.
 */
var express = require('express');
var router = express.Router();
var dbOperation=require('./model/article')
router.get('/', function (req, res, next) {
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
/*   readArticle('b444ac06613fc8d63795be9ad0beaf55011936ac',function(err,result){
        if(false===result.result){
            if(null===result.content){
                return res.render('error_page/article/articleNotExist',{title:'错误',message:"文档不存在"})
            }else{
                return res.json(result.content)
            }

        }
       if(true===result.result){
           return res.json(result.content)
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
