/**
 * Created by zw on 2015/7/7.
 */
var dbStructure=require('./db_structure');
var articleModel=dbStructure.articleModel;
var keyModel=dbStructure.keyModel;
var userModel=dbStructure.userModel;
var attachmentModel=dbStructure.attachmentModel;
var commentModel=dbStructure.commentModel;

var hash=require('../express_component/hashCrypt');
var async=require('async')

var errorRecorder=require('../express_component/recorderError').recorderError;

var articleError=require('../assist/not_used_server_error_define').articleError;
var mongooseError=require('../assist/3rd_party_error_define').mongooseError;
//var mongooseValidateError=require('./assist/3rd_party_error_define').mongooseValidateError;
var validateDb=require('../assist/3rd_party_error_define').validateDb;
var inputDefine=require('../assist/input_define').inputDefine;


var article=new articleModel();
var createNewArticle=function(title,authorId,callback){
    //var article=new articleModel();
    article.title=title
    article.author=authorId

    var hashID=hash.hash('sha1',article.title);
    articleModel.count({_id:hashID},function(err,result){
        if(err){
            errorRecorder(err.code,err.errmsg,'article','createNewArticle')
            return callback(err,mongooseError.addArticle)
        }else{
            //如果原始title 的hash id已经存在，那么使用当前时间重新生成一个
            if(1===result){
                var date=new Date().getTime()
                hashID=hash.hash('sha1',article.title+date)
                //console.log('r')
            }
            article._id = hashID;
            //article._id = '1111';
            article.cDate=new Date();
            //article.mDate=article.cDate;
            validateDb.article(article,'article','createNewArticle',function(validateErr,validateResult){
                if(true===validateResult.result){
                    article.save(function(err,article){
                        if(err){
                            errorRecorder(err.code,err.errmsg,'article','createNewArticle')
                            return callback(err,{result:false,content:mongooseError.addArticle})
                        }else{
                            return callback(null,{result:true,content:article._id})
                        }
                    })
                }else{
                    return callback(validateErr,validateResult)//validate err 原样返回
                }
            });
        }

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
            return callback(err,{result:false,content:mongooseError.findByIDArticle})
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
                return callback(null,{result:false,content:articleError.filedOfContentNotExist})
        }

        validateDb.article(article,'article','updateArticleContent',function(validateErr,validateResult){
            if(true===validateResult.result){
                article.save(function(err){
                    if(err){
                        errorRecorder(err.code,err.errmsg,'article','updateArticleContent')
                        return callback(err,{result:false,content:mongooseError.updateArticleContent})
                    }else{
                        return callback(null,{result:true,content:null})
                    }
                })
            }else{
                return callback(validateErr,validateResult)//validate err 原样返回
            }
        });

    })



}


//根据key（string）获得对应id，如果key不存在，直接保存后获得新id
//返回一个数组（key id）
var updateArticleKey=function(articleId,keys,callback){
    var keyword=new keyModel();
    var keyArray=[]
    //console.log(keys)
    if(0===keys.length){
        return callback(null,{result:true,content:null})
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
                //keyword.mDate=new Date()
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
        articleModel.findById(articleId,'keys',function(err,article){
            if(err){
                errorRecorder(err.code,err.errmsg,'article','updateArticleKey')
                return callback(err,{result:false,content:mongooseError.findByIDArticle})
            }else{
//console.log(article)

                article.keys=keyArray;
                article.save(function(err){
                    if(err){
                        errorRecorder(err.code,err.errmsg,'article','saveArticleKey')
                        return callback(err,{result:false,content:mongooseError.updateArticleKey})
                    }else{
                        return callback(null,{result:true,content:null})
                    }
                })
            }
        })
        //callback(err,keyArray)
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
                return callback(err,{result:false,content:mongooseError.saveAttachment})
            }

        }
//console.log(document)
        if(null===document){

            return callback(null,{result:false,content:articleError.notExist.error})
        }else{
            if(document.length>1){

                return callback(null,{result:false,content:articleError.duplicateArticle.error})
            }

            var attachment=new attachmentModel();
            attachment._id=attachmentObj._id;
            attachment.name=attachmentObj.name
            attachment.storePath=attachmentObj.storePath
            attachment.size=attachment.size
            attachment.cDate=new Date()
            validateDb.attachment(attachment,'article','addAttachment',function(validateErr,validateResult){
                if(true===validateResult.result){
                    attachment.save(function(err){
                        //console.log(err)
                        if(err){
                            errorRecorder(err.code,err.errmsg,'article','attachment');
                            return callback(err,{result:false,content:mongooseError.saveAttachment})
                        }else{
                            document.attachment.push(attachmentObj._id)
                            document.save(function(err){
                                if(err){
                                    errorRecorder(err.code,err.errmsg,'article','article');
                                    return callback(null,{result:false,content:mongooseError.addArticleAttachment})
                                }else{
                                    return callback(null,{result:true,content:null})
                                }
                            })
                        }
                    })
                }else{
                    return callback(validateErr,validateResult)
                }
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

            return callback(err,{result:false,content:mongooseError.findByIdAndRemoveAttachment})
        }

        articleModel.findById(articleID,'attachment',function(err,article){
            if(err)
            {
                errorRecorder(err.code,err.errmsg,'article','findArticle')
                return callback(err,{result:false,content:mongooseError.findByIDArticle})
            }
            var idx=article.attachment.indexOf(attachment._id);
            if(-1!=idx){
                article.attachment.splice(idx,idx+1);
                article.save(function(err){
                    if(err){
                        errorRecorder(err.code,err.errmsg,'article','delArticleAttachment')
                        return callback(err,{result:false,content:mongooseError.updateArticleAttachment})
                    }else{
                        return callback(null,{result:true,content:null})
                    }
                })
            }

        })
    })
}


var addComment=function(articleID,userId,content,callback){
    articleModel.findById(articleID,'comment',function(err,article){
        if(err)
        {
            errorRecorder(err.code,err.errmsg,'article','findArticle')
            return callback(err,{result:false,content:mongooseError.findByIDArticle})
        }
        var comment=new commentModel()
//console.log('in')
        comment.user=userId;
        comment.content=content;
        comment.articleId=articleID;
        validateDb.comment(comment,'article','addComment',function(validateErr,validateResult){
//console.log(validateErr)
//console.log(validateResult)
            if(false===validateResult.result){
                return callback(validateErr,validateResult)
            }else{
                comment.save(function(err,comment,affectedNum){
//console.log(err)
                    if(err)
                    {
                        errorRecorder(err.code,err.errmsg,'article','saveComment')
                        return callback(err,{result:false,content:mongooseError.saveCommnent})
                    }
                    if(null===article.comment || undefined===article.comment){
                        article.comment=[]
                    }
//console.log(article.comment)
                    article.comment.push(comment._id);
//console.log(article.comment)
                    article.save(function(err){
                        if(err){
                            errorRecorder(err.code,err.errmsg,'article','updateArticleComment')
                            return callback(err,{result:false,content:mongooseError.updateArticleComment})
                        }else{
                            userFindById(userId,function(err,result){
//console.log(result)
                                if(false===result.result){
                                    return callback(err,result)
                                }else{
                                    comment.user=result.content
                                    comment.articleId=undefined
                                    //最终返回的结果，应该是populate user的
                                    console.log(comment)
                                    return callback(null,{result:true,content:comment})
                                }
                            })

                        }
                    })

                })
            }

        })

    })
}

var delComment=function(articleID,commentID,callback){
    articleModel.findById(articleID,'comment',function(err,article) {
        if (err) {
            errorRecorder(err.code, err.errmsg, 'article', 'findArticle')
            return callback(err, {result:false,content:mongooseError.findByIDArticle})
        }
        commentModel.findByIdAndRemove(commentID,function(err,comment){
            if (err) {
                errorRecorder(err.code, err.errmsg, 'article', 'removeComment')
                return callback(err, {result:false,content:mongooseError.findByIDArticle})
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
                        return callback(err, {result:false,content:mongooseError.updateArticleComment})
                    }else{
                        callback(null,{result:true,content:null})
                    }
                })

            }

        })
    })

}

var userFindById=function(userId,callback){
    userModel.findById(userId,'name thumbnail cDate',function(err,findedUser){
        if(err ){
            errorRecorder(err.code,err.errmsg,'article','readArticle')
            return callback(err,{result:false,content:mongooseError.findByIdUser})

            //return callback(err,{result:false,content:mongooseError.findByIdUser})
        }
        if(null===findedUser){
            errorRecorder(mongooseError.findByIdUser.rc,mongooseError.findByIdUser.msg,'article','readArticle')
            return callback(err,{result:false,content:mongooseError.findByIdUser})
        }
        return callback(null,{result:true,content:findedUser})
    })
}

var readArticle=function(articleID,callback){
    //console.log('start')
    articleModel.findById(articleID,function(err,doc){
        if (err) {
            errorRecorder(err.code, err.errmsg, 'article', 'findArticle')
            return callback(err, {result:false,content:mongooseError.findByIDArticle})
        }
        if(null===doc){
            return callback(null,{result:false,content:null})//没有err，但是结果为false，那么需要重定向
        }
        //console.log(doc)
        var opt=[
            {path:'author',model:'users',select:'name mDate'},
            {path:'keys',model:'keys',select:'key'},
            {path:'comment',model:'comments',select:'content mDate user'},
            {path:'innerImage',model:'innerImages',select:'name storePath'},
            {path:'attachment',model:'attachments',select:'name storePath size',options:{sort:'cDate'}}
        ]
        //console.log(doc)
        doc.populate(opt,function(err,doc1){
//console.log(doc1)
            if(err){
                errorRecorder(err.code,err.errmsg,'article','readArticle')
                return callback(err,{result:false,content:mongooseError.readArticle})
            }else{
/*                optComment=[
                    {path:'user',model:'users',select:'name mobile cDate mDate'}
                ]*/
                async.forEachOf(doc1.comment,function(value,key,cb){
/*                    { _id: 55c40daa8135d6d82f0f2c92,
                        content: 'content1',
                        user: 55c4096740f0a0d025917528 }*/
                    //console.log(value)
                    //0,1,2.......
                    //console.log(key)
                    userModel.findById(value.user,'name thumbnail cDate mDate',function(err,findedUser){
                        if(err ){
                            errorRecorder(err.code,err.errmsg,'article','readArticle')
                            cb(err,{result:false,content:mongooseError.findByIdUser})
                            //return callback(err,{result:false,content:mongooseError.findByIdUser})
                        }else{
                            if(null===findedUser){
                                doc1.comment[key].user=undefined//userId没有查找到对应的记录，则把user改成undefine
                                errorRecorder(mongooseError.findByIdUser.rc,mongooseError.findByIdUser.msg,'article','readArticle')
                                cb(err,{result:false,content:mongooseError.findByIdUser})
                            }else{
                                doc1.comment[key].user=undefined//为了替换user(_id)->user(name/phone/cDate...),先要undefined，否则doc1会记住user的原始类型
                                doc1.comment[key].user=findedUser
                                doc1.comment[key].user._id=undefined//删除_id，应为无需传递到客户端
                                cb()
                            }
                        }


                    })


                },function(err){
                        if(err){
                           console.log(err)
                        }else{
                            //console.log(doc1)
                            return callback(null,{result:true,content:doc1})
                        }
                })
//                doc1.populate(opt,function(err,docWithCommentUser){
////console.log(docWithCommentUser)
//                    return callback(null,{result:true,content:docWithCommentUser})
//                })

            }
        })
    })
}

exports.articleDboperation={
    createNewArticle:createNewArticle,
    updateArticleContent:updateArticleContent,
    updateArticleKey:updateArticleKey,
    addAttachment:addAttachment,
    delAttachment:delAttachment,
    addComment:addComment,
    delComment:delComment,
    readArticle:readArticle


}