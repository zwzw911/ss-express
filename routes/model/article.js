/**
 * Created by zw on 2015/7/7.
 */
var dbStructure=require('./db_structure');
var articleModel=dbStructure.articleModel;
var keyModel=dbStructure.keyModel;
var userModel=dbStructure.userModel;
var attachmentModel=dbStructure.attachmentModel;
var commentModel=dbStructure.commentModel;
var innerImageModel=dbStructure.innerImageModel;

var hash=require('../express_component/hashCrypt');
var async=require('async')

var errorRecorder=require('../express_component/recorderError').recorderError;

//var articleError=require('../assist/server_error_define').articleError;
//var mongooseError=require('../assist/3rd_party_error_define').mongooseError;
//var mongooseValidateError=require('./assist/3rd_party_error_define').mongooseValidateError;
var validateDb=require('../assist/3rd_party_error_define').validateDb;
//var inputDefine=require('../assist/input_define').inputDefine;
var input_validate=require('../error_define/input_validate').input_validate;
var runtimeDbError=require('../error_define/runtime_db_error').runtime_db_error;
var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error;

var article=new articleModel();
var createNewArticle=function(title,authorId,callback){
    //var article=new articleModel();
    article.title=title
    article.author=authorId

    var hashID=hash.hash('sha1',article.title);
    articleModel.count({_id:hashID},function(err,result){
        if(err){
            errorRecorder(err.code,err.errmsg,'article','createNewArticle')
            return callback(err,runtimeDbError.article.count)
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
                if(0===validateResult.rc){
                    article.save(function(err,article){
                        if(err){
                            errorRecorder({rc:err.code,msg:err.errmsg},'article','createNewArticle')
                            return callback(err,runtimeDbError.article.save)
                        }else{
                            return callback(null,{rc:0,msg:article._id})
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
var updateArticleContent=function(_id,obj,callback){
    //var article=new articleModel();


    articleModel.findById({_id:_id},function(err,article){
        if(err){
            errorRecorder({rc:err.code,msg:err.errmsg},'article','findArticle')
            return callback(err,runtimeDbError.article.findById)
        }
        var field=['title','keys','pureContent','htmlContent'];
        var curFieldName;

        for(var i=0;i<field.length;i++){
            curFieldName=field[i];
            if(undefined!=obj[curFieldName] || null!=obj[curFieldName]){
                article[curFieldName]=obj[curFieldName];
            }
        }
//console.log(article)
        validateDb.article(article,'article','updateArticleContent',function(validateErr,validateResult){
            if(0===validateResult.rc){
                article.save(function(err){
                    if(err){
                        errorRecorder({rc:err.code,msg:err.errmsg},'article','updateArticleContent')
                        return callback(err,runtimeDbError.article.save)
                    }else{
                        return callback(null,{rc:0,msg:null})
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
        return callback(null,{rc:0,msg:null})
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
                errorRecorder({rc:err.code,msg:err.errmsg},'article','updateArticleKey')
                return callback(err,runtimeDbError.article.findById)
            }else{
//console.log(article)

                article.keys=keyArray;
                article.save(function(err){
                    if(err){
                        errorRecorder({rc:err.code,msg:err.errmsg},'article','saveArticleKey')
                        return callback(err,runtimeDbError.article.save)
                    }else{
                        return callback(null,{rc:0,msg:null})
                    }
                })
            }
        })
        //callback(err,keyArray)
    })
}


/*
 *   innerImgOjb:{_id, name, storePath, size}
 * */
var addInnerImage=function(articleID,innerImageObj,callback){

    articleModel.findById(articleID,'innerImage',function(err,document){
        if(err){
            if(express().get('env')==='development'){
                throw err;
            }
            if(express().get('env')==='production'){
                //clientResult=articleError.notExist.error//this show to client
                errorRecorder({rc:err.code,msg:err.errmsg},'article','addArticleAttachment')
                /*                dbResult=mongooseError.findByIDArticle//this is save into db
                 errorRecorder(dbResult.rc,dbResult.msg,'查找文档'+articleID+'出错','article')*/
                return callback(err,runtimeDbError.article.findById)
            }

        }
//console.log(document)
        if(null===document){

            return callback(null,runtimeDbError.article.findByIdNull)
        }else{
            if(document.length>1){

                return callback(null,runtimeDbError.article.findByIdMulti)
            }

            var innerImage=new innerImageModel();
            innerImage._id=innerImageObj._id;
            innerImage.name=innerImageObj.name
            innerImage.storePath=innerImageObj.storePath
            innerImage.size=innerImageObj.size
            innerImage.cDate=new Date()

            validateDb.innerImage(innerImage,'article','addInnerImage',function(validateErr,validateResult){
                //console.log(validateResult)
                if(0===validateResult.rc){
                    innerImage.save(function(err,newInnerImage){
                        //console.log(err)
                        if(err){
                            errorRecorder({rc:err.code,msg:err.errmsg},'article','innerImage');
                            return callback(err,runtimeDbError.innerImage.save)
                        }else{
                            document.innerImage.push(innerImage._id)
                            document.save(function(err){
                                if(err){
                                    errorRecorder({rc:err.code,msg:err.errmsg},'article','article');
                                    return callback(err,runtimeDbError.article.save)
                                }else{
//console.log(newInnerImage)
                                    return callback(null,{rc:0,msg:newInnerImage})
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

/*
 *   attachmentOjb:{_id, name, storePath, size}
 * */
var addAttachment=function(articleID,attachmentObj,callback){
    //var attachments=new attachmentModel();


    articleModel.findById(articleID,'attachment',function(err,document){
        if(err){
            if(express().get('env')==='development'){
                throw err;
            }
            if(express().get('env')==='production'){
                //clientResult=articleError.notExist.error//this show to client
                errorRecorder({rc:err.code,msg:err.errmsg},'article','addArticleAttachment')
                /*                dbResult=mongooseError.findByIDArticle//this is save into db
                 errorRecorder(dbResult.rc,dbResult.msg,'查找文档'+articleID+'出错','article')*/
                return callback(err,runtimeDbError.article.findById)
            }

        }
//console.log(document)
        if(null===document){

            return callback(null,runtimeDbError.article.findByIdNull)
        }else{
            if(document.length>1){

                return callback(null,runtimeDbError.article.findByIdMulti)
            }

            var attachment=new attachmentModel();
            attachment._id=attachmentObj._id;
            attachment.name=attachmentObj.name
            attachment.storePath=attachmentObj.storePath
            attachment.size=attachmentObj.size
            attachment.cDate=new Date()
            validateDb.attachment(attachment,'article','addAttachment',function(validateErr,validateResult){
                if(0===validateResult.rc){
                    attachment.save(function(err){
                        //console.log(err)
                        if(err){
                            errorRecorder({rc:err.code,msg:err.errmsg},'article','attachment');
//console.log(err)
                            return callback(err,runtimeDbError.attachment.save)
                        }else{
                            document.attachment.push(attachmentObj._id)
                            document.save(function(err){
                                if(err){
                                    errorRecorder({rc:err.code,msg:err.errmsg},'article','article');
                                    return callback(err,runtimeDbError.article.save)
                                }else{
                                    return callback(null,{rc:0,msg:null})
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
            errorRecorder({rc:err.code,msg:err.errmsg},'article','delAttachment');

            return callback(err,runtimeDbError.attachment.findByIdAndRemove)
        }

        articleModel.findById(articleID,'attachment',function(err,article){
            if(err)
            {
                errorRecorder({rc:err.code,msg:err.errmsg},'article','findArticle')
                return callback(err,runtimeDbError.article.findById)
            }
            var idx=article.attachment.indexOf(attachment._id);
            if(-1!=idx){
                article.attachment.splice(idx,idx+1);
                article.save(function(err){
                    if(err){
                        errorRecorder({rc:err.code,msg:err.errmsg},'article','delArticleAttachment')
                        return callback(err,runtimeDbError.article.save)
                    }else{
                        return callback(null,{rc:0,msg:null})
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
            errorRecorder({rc:err.code,msg:err.errmsg},'article','findArticle')
            return callback(err,runtimeDbError.article.findById)
        }
        var comment=new commentModel()
//console.log('in')
        comment.user=userId;
        comment.content=content;
        comment.articleId=articleID;
        validateDb.comment(comment,'article','addComment',function(validateErr,validateResult){
//console.log(validateErr)
//console.log(validateResult)
            if(0!=validateResult.rc){
                return callback(validateErr,validateResult)
            }else{
                comment.save(function(err,comment,affectedNum){

                    var comment=comment.toObject()
//console.log(comment)
                    if(err)
                    {
                        errorRecorder({rc:err.code,msg:err.errmsg},'article','saveComment')
                        return callback(err,runtimeDbError.comment.save)
                    }
                    if(null===article.comment || undefined===article.comment){
                        article.comment=[]
                    }
//console.log(article.comment)
                    article.comment.push(comment._id);
//console.log(article.comment)
                    article.save(function(err){
                        if(err){
                            errorRecorder({rc:err.code,msg:err.errmsg},'article','updateArticleComment')
                            return callback(err,runtimeDbError.article.save)
                        }else{
                            userFindById(userId,function(err,result){
//console.log(result)
                                //comment 需要返回
                                //var comment=comment.toObject();
                                var user=result.msg.toObject();

                                if(0!=result.rc){
                                    return callback(err,result)
                                }else{
                                    comment.user=user
                                    comment.articleId=undefined

                                    //最终返回的结果，应该是populate user的
                                    //console.log(comment)
                                    return callback(null,{rc:0,msg:comment})
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
            errorRecorder({rc:err.code, msg:err.errmsg}, 'article', 'findArticle')
            return callback(err, runtimeDbError.article.findById)
        }
        commentModel.findByIdAndRemove(commentID,function(err,comment){
            if (err) {
                errorRecorder({rc:err.code, msg:err.errmsg}, 'article', 'removeComment')
                return callback(err, runtimeDbError.comment.findByIdAndRemove)
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
                        errorRecorder({rc:err.code, msg:err.errmsg}, 'article', 'findArticle')
                        return callback(err, runtimeDbError.article.save)
                    }else{
                        callback(null,{rc:0,msg:null})
                    }
                })

            }

        })
    })

}

var userFindById=function(userId,callback){
    userModel.findById(userId,'name thumbnail cDate',function(err,findedUser){
        if(err ){
            errorRecorder({rc:err.code,msg:err.errmsg},'article','readArticle')
            return callback(err,runtimeDbError.user.findById)

            //return callback(err,{result:false,content:mongooseError.findByIdUser})
        }
        if(null===findedUser){
            errorRecorder(runtimeDbError.user.findByIdNull,'article','readArticle')
            return callback(err,runtimeDbError.user.findByIdNull)
        }
        return callback(null,{rc:0,msg:findedUser})
    })
}

var readArticle=function(articleID,callback){
    //console.log('start')
    articleModel.findById(articleID,function(err,doc){
        if (err) {
            errorRecorder({rc:err.code, msg:err.errmsg}, 'article', 'findArticle')
            return callback(err, runtimeDbError.article.findById)
        }
        if(null===doc){
            return callback(null,runtimeDbError.article.findByIdNull)//没有err，但是结果为false，那么需要重定向
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
                errorRecorder({rc:err.code,msg:err.errmsg},'article','readArticle')
                return callback(err,runtimeDbError.article.findById)
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
                            errorRecorder({rc:err.code,msg:err.errmsg},'article','readArticle')
                            cb(err,runtimeDbError.user.findById)
                            //return callback(err,{result:false,content:mongooseError.findByIdUser})
                        }else{
                            if(null===findedUser){
                                doc1.comment[key].user=undefined//userId没有查找到对应的记录，则把user改成undefine
                                errorRecorder(runtimeDbError.user.findByIdNull,'article','readArticle')
                                cb(err,runtimeDbError.user.findByIdNull)
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
                           return callback(null,err)
                        }else{
                            //console.log(doc1)
                            return callback(null,{rc:0,msg:doc1.toObject()})
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
    readArticle:readArticle,
    addInnerImage:addInnerImage


}