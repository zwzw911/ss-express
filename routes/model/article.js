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
var keyArticleModel=dbStructure.keyArticleModel;

var hash=require('../express_component/hashCrypt');
var async=require('async')
var generalFunction=require('../express_component/generalFunction').generateFunction
var miscellaneous=require('../assist_function/miscellaneous').func//可以和generalFunction合并
var errorRecorder=require('../express_component/recorderError').recorderError;

var general=require('../assist/general').general
var ueConfig=require('../assist/ueditor_config').ue_config
//var articleError=require('../assist/server_error_define').articleError;
//var mongooseError=require('../assist/3rd_party_error_define').mongooseError;
//var mongooseValidateError=require('./assist/3rd_party_error_define').mongooseValidateError;
var validateDb=require('../error_define/3rd_party_error_define').validateDb;
//var inputDefine=require('../assist/input_define').inputDefine;
var input_validate=require('../error_define/input_validate').input_validate;
var runtimeDbError=require('../error_define/runtime_db_error').runtime_db_error;
var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error;

var pagination=require('../express_component/pagination').pagination

var fs=require('fs')

//var article=new articleModel();
//根据hashId获得Id
var hashId2Id=function(articleHashId,callback){
    articleModel.find({hashId:articleHashId},'_id',function(err,articleId){
        if(err){
            errorRecorder({rc:err.code,msg:err.errmsg},'article','hashId2Id')
            return callback(err,runtimeDbError.article.findByHashId)
        }
//console.log(articleId)
        if(0===articleId.length){
            return callback(null,runtimeDbError.article.findByHashIdNull)
        }
        if(1<articleId.length){
            return callback(null,runtimeDbError.article.findByHashIdMulti)
        }
        return callback(null,{rc:0,msg:articleId[0]._id})
    })
}
var readComment=function(articleHashId,curPage,callback){
    articleModel.find({hashId:articleHashId},'comment mDate cDate',function(err,article){
        if(err){
            errorRecorder({rc:err.code,msg:err.errmsg},'article','readComment')
            return res.json(err,runtimeDbError.article.findByHashId)
        }
        if(null==article){
            return res.json(err,runtimeDbError.article.findByHashIdNull)
        }
//console.log(article)
        var findedArticle=article[0]
        var paginationInfo=pagination(findedArticle.comment.length,curPage,general.commentPageSize,general.commentPageLength)
//console.log(paginationInfo)
//
//                 {path:'comment',model:'comments',select:'content  mDate user',options:{limit:general.commentPageSize}}
//        console.log(general.commentPageSize)
        var opt=[{path:'comment',model:'comments',select:' content mDate user',options:{limit:general.commentPageSize,skip:(paginationInfo.curPage-1)*general.commentPageSize}}]
        findedArticle.populate(opt,function(err,article1){
            if(err){
                errorRecorder({rc:err.code,msg:err.errmsg},'article','readComment')
                return callback(err,runtimeDbError.comment.readComment)
            }
            //console.log(opt)
            //console.log(article1)
            //读取comment的用户信息
            async.forEachOf(article1.comment,function(value,key,cb){
                //'name thumbnail cDate mDate mDateConv',
                userModel.findById(value.user,' name thumbnail  mDate',function(err,findedUser){
                    if(err ){
                        errorRecorder({rc:err.code,msg:err.errmsg},'article','readComment')
                        cb(err,runtimeDbError.user.findById)
                    }else{
                        if(null===findedUser){
                            article1.comment[key].user=undefined//userId没有查找到对应的记录，则把user改成undefine
                            errorRecorder(runtimeDbError.user.findByIdNull,'article','readArticle')
                            cb(err,runtimeDbError.user.findByIdNull)
                        }else{
                            article1.comment[key].user=undefined//为了替换user(_id)->user(name/phone/cDate...),先要undefined，否则doc1会记住user的原始类型
                            article1.comment[key].user=findedUser
//console.log(findedUser)
                            article1.comment[key].user._id=undefined//删除_id，应为无需传递到客户端
                            cb()
                        }
                    }
                })
            },function(err){
                if(err){
                    return callback(null,runtimeDbError.user.findById)
                }else{
                    //console.log(article1)
                    var finalResult={comment:article1.toObject().comment};
                    //console.log(paginationInfo)
                    finalResult.pagination=paginationInfo;
//console.log(finalResult)
                    return callback(null,{rc:0,msg:finalResult})
                }
            })

        })
    })
}


var createNewArticle=function(title,authorId,callback){
    var article=new articleModel();
    article.title=title;
    article.author=authorId

    //console.log(article)
    var hashID=hash.hash('sha1',article.title);//避免同名冲突(考虑到"新文件"
//console.log(hashID)
    articleModel.count({hashId:hashID},function(err,result){
        if(err){
            errorRecorder({rc:err.code,msg:err.errmsg},'article','createNewArticle')
            return callback(err,runtimeDbError.article.count)
        }else{
            //如果原始title 的hash id已经存在，那么使用当前时间重新生成一个
            //console.log(result)
            if(0<result){
                var randomString=new Date().getTime()
                randomString+=generalFunction.generateRandomString(4)
//console.log(randomString)
                hashID=hash.hash('sha1',article.title+randomString)
//console.log(hashID)
            }
            article.hashId = hashID;
            //console.log(article._id)
            //article._id = '1111';
            article.cDate=new Date();
            //article.mDate=article.cDate;
//console.log(article)
            validateDb.article(article,'article','createNewArticle',function(validateErr,validateResult){
                if(0===validateResult.rc){
                    article.save(function(err,savedArticle){
                        if(err){
//console.log(err)
                            errorRecorder({rc:err.code,msg:err.errmsg},'article','createNewArticle')
                            return callback(err,runtimeDbError.article.save)
                        }else{
//console.log(savedArticle)
							var obj=savedArticle.toObject();
                            return callback(null,{rc:0,msg:obj})
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
var updateArticleContent=function(articleHashId,obj,callback){
    //var article=new articleModel();


    articleModel.find({hashId:articleHashId},function(err,articleResult){
        if(err){
            errorRecorder({rc:err.code,msg:err.errmsg},'article','findArticle')
            return callback(err,runtimeDbError.article.findByHashId)
        }
        if('[]'===JSON.stringify(articleResult)){
            return callback(null,runtimeDbError.article.findByHashIdNull)
        }
        if(1<articleResult.length){
            return callback(null,runtimeDbError.article.findByHashIdMulti)
        }
        var field=['title','keys','pureContent','htmlContent'];
        var curFieldName;
        var article=articleResult[0]

        for(var i=0;i<field.length;i++){
            curFieldName=field[i];
            if(undefined!=obj[curFieldName] || null!=obj[curFieldName]){
                article[curFieldName]=undefined
                article[curFieldName]=obj[curFieldName];
            }
        }
        article['mDate']=new Date()
        //console.log(article)
        //2015-09-07    新增state状态
        if(undefined!=obj['state'] && -1===general.state.indexOf(obj['state'])){
            article['state']=general.state[0]
        }else{
            article['state']=obj['state']
        }
//console.log(article)
        //2015-10-10    遍历article.innerImage，在innerImage表中查找对应的记录(hashName). 如果
        //1.    innerImage不存在,对应的innerImage object存入notExistInnerImageKey
        //2.    如果innerImage存在,但是在htmlContent中不存在,object存入notExistInnerImageKey.
        // notExistInnerImageKey是对象数组,存储idx(article.innerImage的index,方便删除),id(objectid, 以便删除innerImage的记录)和标志位deDelOnly. 如果dbDelOnly,只要删除article.innerImage中的数值,否则,还要加上innerImage和disk
        if( undefined!==article.innerImage && 0<article.innerImage.length){
            var notExistInnerImageKey=[]
            async.forEachOf(article.innerImage,function(value,key,cb){
                innerImageModel.findById(value,'hashName',function(err,findedInnerImage){
                    if(err){
                        errorRecorder({rc:err.code,msg:err.errmsg},'article','findInnerImage')
                        return callback(err,runtimeDbError.innerImage.findById)
                    }
                    //article.innerImage中存在,但是innerImage不存在,直接从article.innerImage中删除
                    if(null===findedInnerImage){
                        var articleInnerImageIdx=article.innerImage.indexOf(value)//重新定位index,因为如果之前删除过,那么index会变化
                        if(-1!==articleInnerImageIdx){
                            article.innerImage.splice(articleInnerImageIdx,1)
                        }
                        //notExistInnerImageKey.push({idx:key,dbDelOnly:true})//只要idx,因为只会在article.innerImage操作
                        //article.innerImage.splice(key,1)
                        //console.log('null'+key)
                    }else{
                       /* console.log(findedInnerImage)
                        console.log(article.htmlContent)*/

                        var idx=article.htmlContent.indexOf(findedInnerImage.hashName)
                        //console.log(idx)
                        if(-1===idx){//innerImage中的hashName已经不存在article.htmlContent了
                            var articleInnerImageIdx=article.innerImage.indexOf(value)//重新定位index,因为如果之前删除过,那么index会变化
                            if(-1!==articleInnerImageIdx){
                                article.innerImage.splice(articleInnerImageIdx,1)
                            }
                            //以下是真正从innerImage中删除
                            innerImageModel.findByIdAndRemove(value,function(err,findedInnerImage1){
                                if(err){
                                    errorRecorder({rc:err.code,msg:err.errmsg},'article','findInnerImage')
                                    return callback(err,runtimeDbError.innerImage.findById)
                                }
                                //console.log(general.ueUploadPath+'/'+ueConfig.imagePathFormat+'/'+findedInnerImage1.hashName)
                                fs.unlinkSync(general.ueUploadPath+'/'+ueConfig.imagePathFormat+'/'+findedInnerImage1.hashName)
                            })
                        }
                    }
                    cb()
                })

            },function(err){
                if(err){
                    return callback(err)
                }
//console.log()
                //article.innerImage是必需操作的
/*                notExistInnerImageKey.sort(function(a,b){return a.idx< b.idx?1:-1})//对数组的idx进行反向排序（升序的话，执行了一次splice后，后续的idx就无法对齐了）
                notExistInnerImageKey.forEach(function(e){
                    article.innerImage.splice(e.idx,1)
                })*/

                //根据dbDelOnly确定是否要操作innerImage和disk
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

        }else{
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
        }


    })



}


//根据key（string）获得对应id，如果key不存在，直接保存后获得新id
//返回一个数组（key id）
var updateArticleKey=function(articleHashId,keys,callback){
    var keyword=new keyModel();
    var keyArray=[]
    //console.log(keys)
    if(0===keys.length){
        return callback(null,{rc:0,msg:null})
    }
    //console.log(keys)
    async.forEachOf(keys,function(value,key,cb){
        keyModel.findOne({key:value},'_id key',function(err,document){
            //console.log(document)
            if(err){cb(err)}
            if(document===null){
                //console.log(value)
                keyword.key=value;
                keyword.cDate=new Date()
                //keyword.mDate=new Date()
                keyword.save(function(err,keyword){
                    //决定保存id还是字符
                    //keyArray.push(keyword._id)
                    keyArray.push(keyword.key)
                })
            }else{
                //决定保存id还是字符
                //keyArray.push(document._id)
                keyArray.push(document.key)
          }
            cb()//如果没有错误，必须执行cb不带任何参数
        })
    },function(err){
        //console.log(keyArray)
        articleModel.find({hashId:articleHashId},'keys',function(err,articleResult){
            if(err){
                errorRecorder({rc:err.code,msg:err.errmsg},'article','updateArticleKey')
                return callback(err,runtimeDbError.article.findById)
            }
            if('[]'===JSON.stringify(articleResult)){
                return callback(null,runtimeDbError.article.findByHashIdNull)
            }
            if(1<articleResult.length){
                return callback(null,runtimeDbError.article.findByHashIdMulti)
            }
            var article=articleResult[0];
            //console.log(article)
            //for(var i=0;i<keyArray.length;i++){
            //    article.keys.push(keyArray[i])
            //}
            //article.keys=undefined;
            article.keys=[];
//console.log(article)
            for(var i=0;i<keyArray.length;i++){
                article.keys.push(keyArray[i])
            }
            //articleResult[0].keys=keyArray
//console.log(keyArray)
//console.log(article)
            article.save(function(err){
                if(err){
                    errorRecorder({rc:err.code,msg:err.errmsg},'article','saveArticleKey')
                    return callback(err,runtimeDbError.article.save)
                }else{
                    return callback(null,{rc:0,msg:null})
                }
            })

        })
        //callback(err,keyArray)
    })
}

/*必需在updateKeyArticle之后执行*/
/*
* 1. 查找文档的keyId(objectId)
* 2. 根据文档的_id查找keyArticle表(key-article对应关系)
* 3. 如果2的结果为0,直接插入1中的记录;否则,循环2中的记录,如果不存在1中,删除(用户更改了key或者删除了key)
* 4. 循环1中的记录,和2中对比,如果不存在,添加到keyArticle中
* */
 //暂时不需要，可以使用aggregate代替
 var updateKeyArticle=function(articleHashId,callback){
    //    因为是在updateArticleKey之后执行,所以不用检测articleHashId
    articleModel.find({hashId:articleHashId},'keys',function(err,findedArticle){
        if(err){
            errorRecorder({rc:err.code,msg:err.errmsg},'article','updateKeyArticle')
            return callback(err,runtimeDbError.article.findByHashId)
        }
        if(0===findedArticle.length){
            return callback(null,runtimeDbError.article.findByHashIdNull)
        }
        if(1<findedArticle.length){
            return callback(null,runtimeDbError.article.findByHashIdMulti)
        }
        var article=findedArticle[0]
        keyArticleModel.find({articleId:article._id},function(err,findedKeyArticle){
            if(err){
                errorRecorder({rc:err.code,msg:err.errmsg},'article','updateKeyArticle')
                return callback(err,runtimeDbError.keyArticle.find)
            }
            //还没有任何key-article,直接插入
            if(0===findedKeyArticle.length){
                var keyInArticle=article.keys;
                //文档没有关键字,无需插入
                if(0===keyInArticle.length){
                    return callback(null,{rc:0,msg:null})
                }
                //有关键字,插入maxKeyNum个关键字
                var maxKeyNum= keyInArticle.length>general.maxKeyNum ? general.maxKeyNum:keyInArticle.length;

                //从article.keys截取出合适数量的key(一般是所有的key)
                var validateKey=keyInArticle.splice(0,maxKeyNum);
                async.forEachOf(validateKey,function(key,value,cb){
                    var keyArticle=new keyArticleModel()
                    keyArticle.articleId=article._id;
                    keyArticle.keyId=value
                    validateDb.keyArticle(keyArticle,'article','updateKeyArticle',function(err,result){
                        if(0!==result.rc){
                            return callback(null,result)
                        }
                        keyArticle.save(function(err){
                            if(err){
                                errorRecorder({rc:err.code,msg:err.errmsg},'article','updateKeyArticle')
                                return callback(err,runtimeDbError.keyArticle.save)
                            }
                            cb()//当前运行结束
                        })
                    })
                },function(err){
                    return callback(null,{rc:0,msg:null})
                })
/*                for(var i=0;i<maxKeyNum;i++){
                    var keyArticle=new keyArticleModel()
                    keyArticle.articleId=article._id;
                    keyArticle.keyId=keyInArticle[i]
                    validateDb.keyArticle(keyArticle,'article','updateKeyArticle',function(err,result){
                        if(0!==result.rc){
                            return callback(null,result)
                        }
                        keyArticle.save(function(err){
                            if(err){
                                errorRecorder({rc:err.code,msg:err.errmsg},'article','updateKeyArticle')
                                return callback(err,runtimeDbError.keyArticle.save)
                            }
                        })
                    })
                }*/


            }

            //有对应的keyarticle,需要进行检测
            if(0<findedKeyArticle.length){
                var keyInArticle=article.keys;
                //key-article存在,
                var maxKeyNum= keyInArticle.length>general.maxKeyNum ? general.maxKeyNum:keyInArticle.length;

                async.forEachOf(findedKeyArticle,function(value,key,cb){
                    //检测key-article是否可以删除
                    if(-1===keyInArticle.indexOf(value.keyId)){
                        keyArticleModel.remove({_id:value._id},function(err){
                            if(err){
                                errorRecorder({rc:err.code,msg:err.errmsg},'article','updateKeyArticle')
                                return callback(err,runtimeDbError.keyArticle.remove)
                            }
                            cb()//当前运行结束
                        })
                    }
                },function(err){

                })

                async.forEachOf(keyInArticle,function(key,value,cb){
                    if(-1===miscellaneous.objectIndexOf('keyId',value,findedKeyArticle)){
                        var keyArticle1=new keyArticleModel()
                        keyArticle1.articleId=article._id;
                        keyArticle1.keyId=value
                        validateDb.keyArticle(keyArticle1,'article','updateKeyArticle',function(err,result){
                            if(0!==result.rc){
                                return callback(null,result)
                            }
                            keyArticle1.save(function(err){
                                if(err){
                                    errorRecorder({rc:err.code,msg:err.errmsg},'article','updateKeyArticle')
                                    return callback(err,runtimeDbError.keyArticle.save)
                                }
                            })
                        })
                    }
                },function(err){

                })
                /*//检测key-article是否可以删除
                for(var i=0;i<findedKeyArticle.length;i++){
                    if(-1===keyInArticle.indexOf(findedKeyArticle[i].keyId)){
                        keyArticleModel.remove({_id:findedKeyArticle[i]._id},function(err){
                            if(err){
                                errorRecorder({rc:err.code,msg:err.errmsg},'article','updateKeyArticle')
                                return callback(err,runtimeDbError.keyArticle.remove)
                            }

                        })
                    }
                }

                //  检测是否需要添加key-article
                for(var i=0;i<keyInArticle.length;i++){
                    //在article中的key还没有保存到key-article中
                    if(-1===miscellaneous.objectIndexOf('keyId',keyInArticle[i],findedKeyArticle)){
                        var keyArticle1=new keyArticleModel()
                        keyArticle1.articleId=article._id;
                        keyArticle1.keyId=keyInArticle[i]
                        validateDb.keyArticle(keyArticle1,'article','updateKeyArticle',function(err,result){
                            if(0!==result.rc){
                                return callback(null,result)
                            }
                            keyArticle1.save(function(err){
                                if(err){
                                    errorRecorder({rc:err.code,msg:err.errmsg},'article','updateKeyArticle')
                                    return callback(err,runtimeDbError.keyArticle.save)
                                }
                            })
                        })
                    }
                }*/

                return callback(null,{rc:0,msg:null})
            }
        })
    })
}
/*
 *   innerImgOjb:{_id, name, storePath, size}
 * */
var addInnerImage=function(articleHashID,innerImageModel,callback){

    articleModel.find({hashId:articleHashID},'innerImage',function(err,document){
        if(err){
            if(express().get('env')==='development'){
                throw err;
            }
            if(express().get('env')==='production'){
                //clientResult=articleError.notExist.error//this show to client
                errorRecorder({rc:err.code,msg:err.errmsg},'article','addArticleAttachment')
                /*                dbResult=mongooseError.findByIDArticle//this is save into db
                 errorRecorder(dbResult.rc,dbResult.msg,'查找文档'+articleID+'出错','article')*/
                return callback(err,runtimeDbError.article.findByHashId)
            }

        }
//console.log(document)
        if(null===document){

            return callback(null,runtimeDbError.article.findByHashIdNull)
        }else{
            if(document.length>1){

                return callback(null,runtimeDbError.article.findByHashIdMulti)
            }

/*            var innerImage=new innerImageModel();
            innerImage.hashName=innerImageObj.hashName;
            innerImage.name=innerImageObj.name
            innerImage.storePath=innerImageObj.storePath
            innerImage.size=innerImageObj.size
            innerImage.cDate=new Date()*/

            validateDb.innerImage(innerImageModel,'article','addInnerImage',function(validateErr,validateResult){
                //console.log(validateResult)
                if(0===validateResult.rc){
                    innerImageModel.save(function(err,savedInnerImage){
                        //console.log(savedInnerImage)
                        if(err){
                            errorRecorder({rc:err.code,msg:err.errmsg},'article','innerImage');
                            return callback(err,runtimeDbError.innerImage.save)
                        }else{
                            document[0].innerImage.push(savedInnerImage._id)
                            document[0].save(function(err,savedDoc){
                                if(err){
                                    errorRecorder({rc:err.code,msg:err.errmsg},'article','article');
                                    return callback(err,runtimeDbError.article.save)
                                }else{
//console.log(savedDoc)
                                    return callback(null,{rc:0,msg:savedInnerImage})
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
//根据attachmentId获得对应的hashName，以便下载附件
var getAttachmentHashName=function(attachmentId,callback){
    attachmentModel.findById(attachmentId,'hashName name',function(err,result){
        if(err){
            errorRecorder({rc:err.code,msg:err.errmsg},'article','getAttachmentHashName')
            return callback(err,runtimeDbError.attachment.findById)
        }
//console.log(result)
        if(undefined===result){
            return callback(null,runtimeNodeError.attachment.attachmentNotFind)
        }

        return callback(null,{rc:0,msg:result})
    })
}
/*
 *   attachmentOjb:{_id, name, storePath, size}
 * */
var addAttachment=function(articleHashID,attachmentModel,callback){
    //var attachments=new attachmentModel();


    articleModel.find({hashId:articleHashID},'attachment',function(err,document){
        if(err){
            if(express().get('env')==='development'){
                throw err;
            }
            if(express().get('env')==='production'){
                //clientResult=articleError.notExist.error//this show to client
                errorRecorder({rc:err.code,msg:err.errmsg},'article','addArticleAttachment')
                /*                dbResult=mongooseError.findByIDArticle//this is save into db
                 errorRecorder(dbResult.rc,dbResult.msg,'查找文档'+articleID+'出错','article')*/
                return callback(err,runtimeDbError.article.findByHashId)
            }

        }
//console.log(document)
        if(null===document){
            return callback(null,runtimeDbError.article.findByHashIdNull)
        }
        if(document.length>1){
            return callback(null,runtimeDbError.article.findByHashIdMulti)
        }

        validateDb.attachment(attachmentModel,'article','addAttachment',function(validateErr,validateResult){
            if(0===validateResult.rc){
                attachmentModel.save(function(err,savedAttachment){
                    //console.log(err)
                    if(err){
                        errorRecorder({rc:err.code,msg:err.errmsg},'article','attachment');
                        return callback(err,runtimeDbError.attachment.save)
                    }

                    document[0].attachment.push(savedAttachment._id)
                    document[0].save(function(err){
                        if(err){
                            errorRecorder({rc:err.code,msg:err.errmsg},'article','article');
                            return callback(err,runtimeDbError.article.save)
                        }
                        //添加附件成功，返回对应的参数（_id,hashName，size，cDate），以便显示在页面上
                        return callback(null,{rc:0,msg:savedAttachment.toObject()})

                    })
                })
            }else{
                return callback(validateErr,validateResult)
            }
        })



    })
    //console.log(keys)
}

var delAttachment=function(articleHashID,attachmentID,callback){
    /*    attachmentModel.count({_id:attachmentID},function(err,result){
     if(err){
     errorRecorder(err.code,err.errmsg,'article','attachment');
     clientResult=mongooseError.countAttachment;
     return callback(err,clientResult)
     }

     if(result)
     })*/
    //mongodb会保证_id的唯一性，所以无需count来再次检测
    attachmentModel.findByIdAndRemove(attachmentID,{select:"_id hashName"},function(err,attachment){
        if(err){
            errorRecorder({rc:err.code,msg:err.errmsg},'article','delAttachment');

            return callback(err,runtimeDbError.attachment.findByIdAndRemove)
        }
//console.log(attachment)
        articleModel.find({hashId:articleHashID},'attachment',function(err,article){
            if(err)
            {
                errorRecorder({rc:err.code,msg:err.errmsg},'article','findArticle')
                return callback(err,runtimeDbError.article.findByHashId)
            }

            //if(null===attachment)
            var idx=article[0].attachment.indexOf(attachment._id);
/*console.log(idx)
            console.log(article)*/
            if(-1!=idx){
                article[0].attachment.splice(idx,1);
                article[0].save(function(err){
                    if(err){
                        errorRecorder({rc:err.code,msg:err.errmsg},'article','delArticleAttachment')
                        return callback(err,runtimeDbError.article.save)
                    }else{
                        //返回文件的hashName，以便在disk中删除文件
                        return callback(null,{rc:0,msg:attachment})
                    }
                })
            }

        })
    })
}


var addComment=function(articleHashID,userId,content,callback){
    articleModel.find({hashId:articleHashID},'comment mDate',function(err,article){
        if(err)
        {
            errorRecorder({rc:err.code,msg:err.errmsg},'article','findArticle')
            return callback(err,runtimeDbError.article.findByHashId)
        }
        var comment=new commentModel()

        comment.user=userId;
        comment.content=content;
        //comment.mDate=Date()
        hashId2Id(articleHashID,function(err,findedArticleId){
//console.log(result)
            if(0<findedArticleId.rc){
                return callback(null,findedArticleId)
            }
            comment.articleId=findedArticleId.msg;
            validateDb.comment(comment,'article','addComment',function(validateErr,validateResult){
                if(0!=validateResult.rc){
                    return callback(validateErr,validateResult)
                }
                comment.save(function(err,comment,affectedNum){
                    if(err)
                    {
                        errorRecorder({rc:err.code,msg:err.errmsg},'article','saveComment')
                        return callback(err,runtimeDbError.comment.save)
                    }
                    var comment=comment.toObject()
                    //console.log(comment)
                    var findedArticle=article[0];
                    if(null===findedArticle.comment || undefined===findedArticle.comment){
                        findedArticle.comment=[]
                    }
//console.log(article.comment)
                    findedArticle.comment.push(comment._id);
//console.log(findedArticle)
                    findedArticle.save(function(err,savedArticle){
                        //console.log(err)
                        //console.log(savedArticle)
                        if(err){
                            errorRecorder({rc:err.code,msg:err.errmsg},'article','updateArticleComment')
                            return callback(err,runtimeDbError.article.save)
                        }else{
                            userFindById(userId,function(err,result){

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

            })
        })



    })
}

var delComment=function(articleHashID,commentID,callback){
    articleModel.findById(articleHashID,'comment',function(err,article) {
        if (err) {
            errorRecorder({rc:err.code, msg:err.errmsg}, 'article', 'findArticle')
            return callback(err, runtimeDbError.article.findByHashId)
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
    userModel.findById(userId,'name thumbnail mDate cDate',function(err,findedUser){
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

var readArticle=function(articleHashID,callback){
    //console.log('start')
    //console.log(articleHashID)
    articleModel.find({hashId:articleHashID},function(err,doc){
        //console.log(articleHashID)
        //console.log(Date().toLocaleString())
        //doc[0].mDate=doc[0].mDate.toLocaleDateString()//+doc[0].mDate.toLocaleTimeString()
        //doc[0].mDate=undefined
        //console.log(doc[0].mDate)
        //console.log(doc[0].mDate.toLocaleTimeString())
        //doc[0].mDate="1980-08-07"
        //console.log(doc[0].mDate)
        //doc[0].mDate=undefined
        //console.log(doc[0].mDate)
        //var tmp=doc[0].toObject()
        //tmp.mDate='1990-08-07'
        //console.log(tmp.mDate)
//miscellaneous.convDBToObj(doc)
        if (err) {
            errorRecorder({rc:err.code, msg:err.errmsg}, 'article', 'findArticle')
            return callback(err, runtimeDbError.article.findByHashId)
        }
        if(null===doc){
            return callback(null,runtimeDbError.article.findByHashIdNull)//没有err，但是结果为false，那么需要重定向
        }
/*        if(undefined!==doc.author && userId!==doc.author){
            return callback()
        }*/
        //赶在populate之前获得comment总数（因为populate中限制了comment总数）
        var totalCommentNum=0
        //console.log(doc)
        if(undefined!==doc[0].comment){
            totalCommentNum=doc[0].comment.length
        };
//console.log(doc)
//        console.log(totalCommentNum,general.commentPageSize,general.commentPageLength)
        var paginationResult=pagination(totalCommentNum,1,general.commentPageSize,general.commentPageLength)
//console.log(paginationResult)
        //(article.comment.length,curPage,pageSize,pageLength)
        var opt=[
            {path:'author',model:'users',select:'name mDate'},
            //{path:'keys',model:'keys',select:'key'},
            {path:'comment',model:'comments',select:'content  mDate user',options:{limit:general.commentPageSize}},//读取最初的几条记录
            {path:'innerImage',model:'innerImages',select:'name storePath cDate mDate'},
            {path:'attachment',model:'attachments',select:'name size cDate',options:{sort:'cDate'}}
        ]
        //console.log(doc)
        doc[0].populate(opt,function(err,doc1){

            if(err){
                errorRecorder({rc:err.code,msg:err.errmsg},'article','readArticle')
                return callback(err,runtimeDbError.article.findById)
            }else{
/*                optComment=[
                    {path:'user',model:'users',select:'name mobile cDate mDate'}
                ]*/
                //mongoos只支持单层populate，多层populate只能手工完成
                async.forEachOf(doc1.comment,function(value,key,cb){
/*                    { _id: 55c40daa8135d6d82f0f2c92,
                        content: 'content1',
                        user: 55c4096740f0a0d025917528 }*/
                    //console.log(value)
                    //0,1,2.......
                    //console.log(value)
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
                            finalResult=doc1.toObject()

                            finalResult.pagination=paginationResult
                            return callback(null,{rc:0,msg:finalResult})
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
    //updateKeyArticle:updateKeyArticle,//可以使用aggregate代替
    getAttachmentHashName:getAttachmentHashName,
    addAttachment:addAttachment,
    delAttachment:delAttachment,
    addComment:addComment,
    delComment:delComment,
    readArticle:readArticle,
    addInnerImage:addInnerImage,
    readComment:readComment


}