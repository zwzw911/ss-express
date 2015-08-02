/**
 * Created by wzhan039 on 2015-07-30.
 */
var express = require('express');
var router = express.Router();
var dbStructure=require('../public/javascripts/model/db_structure')
var articleModel=dbStructure.article;
var keyModel=dbStructure.key;
var attachmentModel=dbStructure.attachment;
var commentModel=dbStructure.commentModel

var hash=require('../public/javascripts/express_component/hashCrypt');
var async=require('async')

var errorRecorder=require('../public/javascripts/express_component/recorderError').recorderError;

var articleError=require('./assist/article_define').articleError;
var mongooseError=require('./assist/3rd_party_error_define').mongooseError;


var inputDefine=require('./assist/input_define').inputDefine;

var article=new articleModel();


var clientResult;





var createNewArticle=function(title,callback){

    article.title=title

    var hashID=hash.hash('sha1',article.title);
    articleModel.count({_id:hashID},function(err,result){
        //如果原始title 的hash id已经存在，那么使用当前时间重新生成一个
        if(1===result){
            var date=new Date().getTime()
            hashID=hash.hash('sha1',article.title+date)
            //console.log('r')
        }
        article._id = hashID;
        //article._id = '1111';
        article.cDate=new Date();
        article.mDate=article.cDate;
        article.validate(function(err){
            if(err){
                //console.log(err)
                errorRecorder(mongooseError.addArticleDataFail.rc,err.message,'article','addArticle')
                return callback(err,mongooseError.addArticleDataFail)
                //return res.render({errorMsg:'创建新文档失败，请重试'})
                //console.log(err)
            }
            article.save(function(err){
                if(err){
                    errorRecorder(err.code,err.errmsg,'article','addArticle')
                    return callback(err,mongooseError.addArticle)
                }
            })
            callback(null,true)
                //console.log('save')

        })
    })
}

//更新titl or content
/*
* _id:文档id  type:title or content（更新哪个部分，title和content区分）   obj：要更新的内容
* */
var updateArticleContent=function(_id,type,obj,callback){
    //var article=new articleModel();


    articleModel.findById({_id:_id},function(err,article){
        if(err){
            errorRecorder(err.code,err.errmsg,'article','findArticle')
            return callback(err,mongooseError.findByIDArticle)
        }
        switch (type)
        {
            case 'title':
                article.title=obj.title;
                break
            case 'content':
                article.pureContent=obj.pureContent;
                article.htmlContent=obj.htmlContent
                break
            default:
                return callback(null,articleError.filedOfContentNotExist)
        }
        article.validate(function(err){
            if(err){
                errorRecorder(mongooseError.addArticleContentDataFail,err.errmsg,'article','updateArticleContent')
                return callback(err,mongooseError.updateArticleContent)//in waterfall, if cb(err), next function skipped and direct run final function
            }
            article.save(function(err){
                if(err){
                    errorRecorder(err.code,err.errmsg,'article','updateArticleContent')
                    return callback(err,mongooseError.updateArticleContent)
                }
            })
            callback(null, true)
        })
    })



}


//根据key（string）获得对应id，如果key不存在，直接保存后获得新id
//返回一个数组（key id）
var getKeyId=function(keys,callback){
    var keyword=new keyModel();
    var keyArray=[]
    //console.log(keys)
    if(0===keys.length){
        return []
    }
    //console.log(keys)
    async.forEachOf(keys,function(value,key,cb){
        keyModel.findOne({key:value},'_id',function(err,document){
            //console.log(key)
            if(err){cb(err)}
            if(document===null){
                //console.log(value)
                keyword.key=value;
                keyword.cDate=new Date()
                keyword.mDate=new Date()
                keyword.save(function(err,keyword){
                    keyArray.push(keyword._id)
                })
            }else{
                //console.log(document)
                keyArray.push(document._id)
                //console.log(keyArray)
            }
            cb()//如果没有错误，必须执行cb不带任何参数
        })
    },function(err){
        //console.log(keyArray)
        callback(err,keyArray)
    })
}

/*
*   attachmentOjb:{_id, name, storePath, size}
* */
var addAttachment=function(articleID,attachmentObj,callback){
    var attachments=new attachmentModel();


    articleModel.findById(articleID,'attachment',function(err,document){
        if(err){
            if(express().get('env')==='development'){
                throw err;
            }
            if(express().get('env')==='production'){
                //clientResult=articleError.notExist.error//this show to client
                errorRecorder(err.code,err.errmsg,'article','addArticleAttachment')
/*                dbResult=mongooseError.findByIDArticle//this is save into db
                errorRecorder(dbResult.rc,dbResult.msg,'查找文档'+articleID+'出错','article')*/
                return callback(err,mongooseError.saveAttachment)
            }

        }
//console.log(document)
        if(null===document){
            clientResult=articleError.notExist.error
            return callback(null,clientResult)
        }else{
            if(document.length>1){
                clientResult=articleError.duplicateArticle.error
                return callback(null,clientResult)
            }

            var attachment=new attachmentModel();
            attachment._id=attachmentObj._id;
            attachment.name=attachmentObj.name
            attachment.storePath=attachmentObj.storePath
            attachment.size=attachment.size
            attachment.cDate=attachment.mDate=new Date()
            attachment.save(function(err){
                //console.log(err)
                if(err){
                    errorRecorder(err.code,err.errmsg,'article','attachment');
                    clientResult=mongooseError.saveAttachment
                    return callback(err,clientResult)
                }
                document.attachment.push(attachmentObj._id)
                document.save(function(err){
                    if(err){
                        errorRecorder(err.code,err.errmsg,'article','article');
                        clientResult=mongooseError.save
                        return callback(null,clientResult)
                    }else{
                        return callback(null,true)
                    }
                })

            })

        }
    })
    //console.log(keys)
}

var delAttachment=function(articleID,attachmentID,callback){
/*    attachmentModel.count({_id:attachmentID},function(err,result){
        if(err){
            errorRecorder(err.code,err.errmsg,'article','attachment');
            clientResult=mongooseError.countAttachment;
            return callback(err,clientResult)
        }

        if(result)
    })*/
    //mongodb会保证_id的唯一性，所以无需count来再次检测
    attachmentModel.findByIdAndRemove(attachmentID,{select:"_id"},function(err,attachment){
        if(err){
            errorRecorder(err.code,err.errmsg,'article','delAttachment');
            clientResult=mongooseError.findByIdAndRemoveAttachment
            return callback(err,clientResult)
        }

        articleModel.findById(articleID,'attachment',function(err,article){
            if(err)
            {
                errorRecorder(err.code,err.errmsg,'article','findArticle')
                return callback(err,mongooseError.findByIDArticle)
            }
            var idx=article.attachment.indexOf(attachment._id);
            if(-1!=idx){
                article.attachment.splice(idx,idx+1);
                article.save(function(err){
                    if(err){
                        errorRecorder(err.code,err.errmsg,'article','delArticleAttachment')
                        return callback(err,mongooseError.updateArticleAttachment)
                    }
                })
            }
            return callback(null,true)
        })
    })
}


var addComment=function(articleID,content,callback){
    articleModel.findById(articleID,'comment',function(err,article){
        if(err)
        {
            errorRecorder(err.code,err.errmsg,'article','findArticle')
            return callback(err,mongooseError.findByIDArticle)
        }
        var comment=new commentModel()
        comment.content=content;
        comment.save(function(err,comment,affectedNum){
            if(err)
            {
                errorRecorder(err.code,err.errmsg,'article','saveComment')
                return callback(err,mongooseError.saveCommnent)
            }
            article.comment.push(comment._id);
            article.save(function(err){
                if(err){
                    errorRecorder(err.code,err.errmsg,'article','updateArticleComment')
                    return callback(err,mongooseError.updateArticleComment)
                }
            })
            callback(null,true)
        })
    })
}

var delComment=function(articleID,commentID,callback){
    articleModel.findById(articleID,'comment',function(err,article) {
        if (err) {
            errorRecorder(err.code, err.errmsg, 'article', 'findArticle')
            return callback(err, mongooseError.findByIDArticle)
        }
        commentModel.findByIdAndRemove(commentID,function(err,comment){
            if (err) {
                errorRecorder(err.code, err.errmsg, 'article', 'removeComment')
                return callback(err, mongooseError.findByIDArticle)
            }
/*            if(null===comment){
                return callback(null,true)
            }*/
            var idx=article.comment.indexOf(commentID)
            //console.log(comment._id)
            //console.log(idx)
            //return callback(null,true)
            if(-1!=idx){
                //var comments=article.comment
                //comments.splice(idx,1)
                //console.log(comments.splice(idx,1))
                //console.log(article.comment)
                article.comment.splice(idx,1)
//console.log(article.comment)
                article.save(function(err){
                    if (err) {
                        errorRecorder(err.code, err.errmsg, 'article', 'findArticle')
                        return callback(err, mongooseError.updateArticleComment)
                    }
                })

            }
            callback(null,true)
        })
    })

}
router.get('/', function (req, res, next) {
    /*    createNewArticle('test1',function(err,result){
     if(true===result){
     res.json({rc:0})
     }else{
     //console.log(result)
     res.json(result)
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

/*        addComment('b444ac06613fc8d63795be9ad0beaf55011936ac','asdfasdfasdf',function(err,result){
     if(true===result){
     res.json({rc:0})
     }else{
     res.json(result)
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
