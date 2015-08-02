/**
 * Created by ada on 2015/7/31.
 * classed by db
 */
var mongooseError={
    /*article/attachment/comment*/
    findByIDArticle:{rc:10000,msg:'文档查找错误'},
    updateArticleAttachment:{rc:10002,msg:'文档的附件更新错误'},
    updateArticleComment:{rc:10004,msg:'文档的评论更新错误'},
    addArticle:{rc:10006,msg:'添加新文档失败'},
    addArticleDataFail:{rc:10007,msg:'添加新文档失败，请检查数据'},
    updateArticleContent:{rc:10008,msg:'文档的评论更新错误'},

    addArticleContent:{rc:10010,msg:'更新文档内容失败'},
    addArticleContentDataFail:{rc:10011,msg:'添加文档失败，请检查数据'},

    saveAttachment:{rc:11000,msg:'保存附件错误'},
    findByIdAndRemoveAttachment:{rc:11002,msg:'查找并删除文档附件错误'},
    delAttachment:{rc:11004,msg:"删除文档附件错误"},

    saveCommnent:{rc:12000,msg:'保存文档评论错误'},
   /*user*/
    countUser:{rc:13000,msg:'用户不存在'},
    userNameValidateFail:{rc:13001,msg:'用户名出错'},
    userPwdValidateFail:{rc:13001,msg:'用户密码出错'}
}
exports.mongooseError=mongooseError;
