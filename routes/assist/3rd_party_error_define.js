/**
 * Created by ada on 2015/7/31.
 * classed by db
 */
var errorRecorder=require('../express_component/recorderError').recorderError;
var input_validate=require('../error_define/input_validate').input_validate;



/*var mongooseValidateError={
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
}*/

/*
*  validate
* */


var validateUser=function(user,category,subCategory,callback){
    user.validate(function(err){
        var return_result;
        if(err){
            //var return_result
            if(err.errors.name){
                return_result=input_validate.user.name.validateError.server;
            }
            if(err.errors.password){
                return_result=input_validate.user.password.validateError.server;
            }
            if(err.errors.mobilePhone){
                return_result=input_validate.user.mobilePhone.validateError.server;
            }
            if(err.errors.thumbnail){
                return_result=input_validate.user.thumbnail.validateError.server;
            }
//console.log(err)
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

var validateArticle=function(article,category,subCategory,callback){
    article.validate(function(err){
        var return_result;
        if(err){
            //console.log(err)
/*            if(err.errors._id){
                return_result=input_validate.article._id.validateError.server;
            }*/
            if(err.errors.hashId){
                return_result=input_validate.article.hashId.validateError.server;
            }
            if(err.errors.title){
                return_result=input_validate.article.title.validateError.server;
            }
            if(err.errors.author){
                return_result=input_validate.article.author.validateError.server;
            }
            if(err.errors.keys){
                return_result=input_validate.article.keys.validateError.server;
            }
            if(err.errors.innerImage){
                return_result=input_validate.article.innerImage.validateError.server;
            }
            if(err.errors.attachment){
                return_result=input_validate.article.attachment.validateError.server;
            }
            if(err.errors.pureContent){
                return_result=input_validate.article.pureContent.validateError.server;
            }
            if(err.errors.htmlContent){
                return_result=input_validate.article.htmlContent.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

var validateAttachment=function(attachment,category,subCategory,callback){
    attachment.validate(function(err){
        var return_result;
        if(err){
            if(err.errors._id){
                return_result=input_validate.attachment._id.validateError.server;
            }
            if(err.errors.name){
                return_result=input_validate.attachment.name.validateError.server;
            }
            if(err.errors.storePath){
                return_result=input_validate.attachment.storePath.validateError.server;
            }
            if(err.errors.size){
                return_result=input_validate.attachment.size.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

var validateComment=function(comment,category,subCategory,callback){
    comment.validate(function(err){
        var return_result;
        if(err){
            if(err.errors.articleId){
                return_result=input_validate.comment.articleId.validateError.server;
            }
            if(err.errors.user){
                return_result=input_validate.comment.user.validateError.server;
            }
            if(err.errors.content){
                return_result=input_validate.comment.content.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

var validateKey=function(key,category,subCategory,callback){
    key.validate(function(err){
        var return_result;
        if(err){
            if(err.errors.key){
                return_result=input_validate.key.key.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

var validateInnerImage=function(innerImage,category,subCategory,callback){
    innerImage.validate(function(err){
        var return_result;
        if(err){
            if(err.errors._id){
                return_result=input_validate.innerImage._id.validateError.server;
            }
            if(err.errors.name){
                return_result=input_validate.innerImage.name.validateError.server;
            }
            if(err.errors.storePath){
                return_result=input_validate.innerImage.storePath.validateError.server;
            }
            if(err.errors.size){
                return_result=input_validate.innerImage.size.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

var validateFolder=function(folder,category,subCategory,callback){
    folder.validate(function(err){
        var return_result;
        if(err){
            if(err.errors.folderName){
                return_result=input_validate.folder.folderName.validateError.server;
            }
            if(err.errors.owner){
                return_result=input_validate.folder.owner.validateError.server;
            }
            if(err.errors.parentId){
                return_result=input_validate.folder.parentId.validateError.server;
            }
            if(err.errors.level){
                return_result=input_validate.folder.level.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

var validateFolder=function(folder,category,subCategory,callback){
    folder.validate(function(err){
        var return_result;
        if(err){
            if(err.errors.folderName){
                return_result=input_validate.folder.folderName.validateError.server;
            }
            if(err.errors.owner){
                return_result=input_validate.folder.owner.validateError.server;
            }
            if(err.errors.parentId){
                return_result=input_validate.folder.parentId.validateError.server;
            }
            if(err.errors.level){
                return_result=input_validate.folder.level.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

/********************************************************************************************************************/
/*                                                      relation table                                              */
/********************************************************************************************************************/
var validateKeyArticle=function(keyArticle,category,subCategory,callback){
    keyArticle.validate(function(err){
        var return_result;
        if(err){
            if(err.errors.keyId){
                return_result=input_validate.keyArticle.keyId.validateError.server;
            }
            if(err.errors.articleId){
                return_result=input_validate.keyArticle.articleId.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

var validateArticleFolder=function(articleFolder,category,subCategory,callback){
    articleFolder.validate(function(err){
        var return_result;
        if(err){
            if(err.errors.folderId){
                return_result=input_validate.articleFolder.folderId.validateError.server;
            }
            if(err.errors.articleId){
                return_result=input_validate.articleFolder.articleId.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}
//exports.mongooseError=mongooseError;
//exports.mongooseValidateError=mongooseValidateError;
exports.validateDb={
    user:validateUser,
    article:validateArticle,
    attachment:validateAttachment,
    comment:validateComment,
    key:validateKey,
    innerImage:validateInnerImage,
    folder:validateFolder,
    articleFolder:validateArticleFolder
}
