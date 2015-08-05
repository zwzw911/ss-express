/**
 * Created by ada on 2015/7/31.
 * classed by db
 */
var errorRecorder=require('../express_component/recorderError').recorderError;

var mongooseError={

   /*user*/
    countUser:{rc:10000,msg:'用户不存在'},
    saveUser:{rc:10002,msg:'用户保存失败'},

    saveAttachment:{rc:10200,msg:'保存附件错误'},
    findByIdAndRemoveAttachment:{rc:10202,msg:'查找并删除文档附件错误'},
    delAttachment:{rc:10204,msg:"删除文档附件错误"},

    saveCommnent:{rc:10400,msg:'保存文档评论错误'},

    /*article/attachment/comment*/
    findByIDArticle:{rc:10500,msg:'文档查找错误'},
    updateArticleAttachment:{rc:10502,msg:'文档的附件更新错误'},
    updateArticleComment:{rc:10504,msg:'文档的评论更新错误'},
    addArticle:{rc:10506,msg:'添加新文档失败'},
    updateArticleContent:{rc:10508,msg:'文档的评论更新错误'},
    addArticleContent:{rc:10510,msg:'更新文档内容失败'},
    addArticleAttachment:{rc:10512,msg:'文档的附件添加错误'},
    readArticle:{rc:10514,msg:'读取文档错误'},
    updateArticleKey:{rc:10564,msg:'文档的关键字更新错误'}
}

var mongooseValidateError={
    user:{
        name:{rc:13002,msg:'用户名出错'},
        password:{rc:13004,msg:'用户密码出错'},
        mobilePhone:{rc:13006,msg:'手机号码出错'}
    },
    key:{
        key:{rc:13100,msg:'关键字出错'}
    },
    attachment:{
        _id:{rc:13200,msg:'附件哈希名出错'},
        name:{rc:13202,msg:'附件名字出错'},
        storePath:{rc:13204,msg:'附件存储路径出错'},
        size:{rc:13206,msg:'附件大小出错'}
    },
    innerImage:{
        _id:{rc:13300,msg:'图片哈希名出错'},
        name:{rc:13302,msg:'图片名字出错'},
        storePath:{rc:13304,msg:'图片存储路径出错'},
        size:{rc:13306,msg:'图片大小出错'}
    },
    comment:{
        content:{rc:13400,msg:'评论内容出错'}
    },
    article:{
        _id:{rc:13500,msg:'文档哈希名出错'},
        title:{rc:13502,msg:'文档名字出错'},
        pureContent:{rc:13504,msg:'文档内容出错'},
        htmlContent:{rc:13506,msg:'文档html内容出错'}
    }
}

/*
*  validate
* */

var validateUser=function(user,category,subCategory,callback){
    user.validate(function(err){
        if(err){
            if(err.errors.name){
                errorRecorder(mongooseValidateError.user.name.rc,err.message,category,subCategory)
                return callback(err,mongooseValidateError.user.name)
            }
            if(err.errors.passowrd){
                errorRecorder(mongooseValidateError.user.passowrd.rc,err.message,category,subCategory)
                return callback(err,mongooseValidateError.user.passowrd)
            }
            if(err.errors.mobilePhone){
                errorRecorder(mongooseValidateError.user.mobilePhone.rc,err.message,category,subCategory)
                return callback(err,mongooseValidateError.user.mobilePhone)
            }
        }else{
            callback(null,true)
        }
    })
}

var validateArticle=function(article,category,subCategory,callback){
    article.validate(function(err){
        if(err){
            //console.log(err)
            if(err.errors._id){
                errorRecorder(mongooseValidateError.article._id.rc,err.message,category,subCategory)
                return callback(err,mongooseValidateError.article._id)
            }
            if(err.errors.name){
                errorRecorder(mongooseValidateError.article.title.rc,err.message,category,subCategory)
                return callback(err,mongooseValidateError.article.title)
            }
            if(err.errors.pureContent){
                errorRecorder(mongooseValidateError.article.pureContent.rc,err.message,category,subCategory)
                return callback(err,mongooseValidateError.article.pureContent)
            }
            if(err.errors.htmlContent){
                errorRecorder(mongooseValidateError.article.htmlContent.rc,err.message,category,subCategory)
                return callback(err,mongooseValidateError.article.htmlContent)
            }
        }else{
            callback(null,true)
        }
    })
}

var validateAttachment=function(attachment,category,subCategory,callback){
    attachment.validate(function(err){
        if(err){
            if(err.errors._id){
                errorRecorder(mongooseValidateError.attachment._id.rc,err.message,category,subCategory)
                return callback(err,mongooseValidateError.attachment._id)
            }
            if(err.errors.name){
                errorRecorder(mongooseValidateError.attachment.name.rc,err.message,category,subCategory)
                return callback(err,mongooseValidateError.attachment.name)
            }
        }else{
            callback(null,true)
        }
    })
}

var validateComment=function(comment,category,subCategory,callback){
    comment.validate(function(err){
        if(err){
            if(err.errors.content){
                errorRecorder(mongooseValidateError.comment.content.rc,err.message,category,subCategory)
                return callback(err,mongooseValidateError.comment.content)
            }
        }else{
            callback(null,true)
        }
    })
}
exports.mongooseError=mongooseError;
exports.mongooseValidateError=mongooseValidateError;
exports.validateDb={
    user:validateUser,
    article:validateArticle,
    attachment:validateAttachment,
    comment:validateComment
}
