/**
 * Created by wzhan039 on 2015-08-10.
 */
/*执行mongoose操作出现的错误*/
var runtime_db_error={
    user:{
        count:{rc:30000,msg:'统计用户出错'},
        save:{rc:30002,msg:'保存用户出错'},
        findById:{rc:30004,msg:'查找用户出错'},
        findByIdNull:{rc:30006,msg:'没有查找到用户'},
        findByIdMulti:{rc:30008,msg:'查找到多个编号相同的用户'},
        findByIdAndRemove:{rc:30010,msg:'查找用户并删除失败'},
        findUser:{rc:30011,msg:'查找用户出错'},
        findUserNull:{rc:30012,msg:'没有查找到用户'},
        findUserMulti:{rc:30014,msg:'查找到多个编号相同的用户'},
        findUserByPwd:{rc:30016,msg:'旧密码不正确'}
    },
    key:{
        count:{rc:30100,msg:'统计关键字出错'},
        save:{rc:30102,msg:'保存关键字出错'},
        findById:{rc:30104,msg:'查找关键字出错'},
        findByIdNull:{rc:30106,msg:'没有查找到关键字'},
        findByIdMulti:{rc:30108,msg:'查找到多个编号相同的关键字'},
        findByIdAndRemove:{rc:30110,msg:'查找关键字并删除失败'},
        aggregateByKeyName:{rc:30112,msg:'查找关键字失败'}
    },
    attachment:{
        count:{rc:30200,msg:'统计附件出错'},
        save:{rc:30202,msg:'保存附件出错'},
        findById:{rc:30204,msg:'查找附件出错'},
        findByIdNull:{rc:30206,msg:'没有查找到附件'},
        findByIdMulti:{rc:30208,msg:'查找到多个编号相同的附件'},
        findByIdAndRemove:{rc:30210,msg:'查找附件并删除失败'}
    },
    innerImage:{
        count:{rc:30300,msg:'统计插图出错'},
        save:{rc:30302,msg:'保存插图出错'},
        findById:{rc:30304,msg:'查找插图出错'},
        findByIdNull:{rc:30306,msg:'没有查找到插图'},
        findByIdMulti:{rc:30308,msg:'查找到多个编号相同的插图'},
        findByIdAndRemove:{rc:30310,msg:'查找插图并删除失败'}
    },
    comment:{
        count:{rc:30400,msg:'统计评论出错'},
        save:{rc:30402,msg:'保存评论出错'},
        findById:{rc:30404,msg:'查找评论出错'},
        findByIdNull:{rc:30406,msg:'没有查找到评论'},
        findByIdMulti:{rc:30408,msg:'查找到多个编号相同的评论'},
        findByIdAndRemove:{rc:30410,msg:'查找评论并删除失败'},
        readComment:{rc:30412,msg:'读取文档评论失败'}
    },
    article:{
        count:{rc:30500,msg:'统计文档出错'},
        save:{rc:30502,msg:'保存文档出错'},
        find:{rc:30503,msg:'查找文档失败'},
        findById:{rc:30504,msg:'查找文档出错'},
        findByIdNull:{rc:30506,msg:'没有查找到文档'},
        findByIdMulti:{rc:30508,msg:'查找到多个编号相同的文档'},
        findByIdAndRemove:{rc:30510,msg:'查找文档并删除失败'},
        findByHashId:{rc:30512,msg:'根据哈希编号查找文档失败'},
        findByHashIdNull:{rc:30514,msg:'此哈希编号没有对应的文档'},
        findByHashIdMulti:{rc:30516,msg:'哈希编号对应一个以上的文档'},
        aggregateByKeyName:{rc:30518,msg:'查找匹配关键字的文档失败'}
    },
    folder:{
        saveRootFolder:{rc:30600,msg:'创建用户根目录失败'},
        readFolder:{rc:30602,msg:'读取子目录信息失败'},
        folderFindById:{rc:30604,msg:'根据编号查找目录失败'},
        folderFindByIdNull:{rc:30605,msg:'没有查找到目录'},
        folderFindByIdMulti:{rc:30606,msg:'查找到重复的目录'},
        saveFolder:{rc:30608,msg:'保存目录失败'},
        removeFolder:{rc:30610,msg:'删除目录失败'},
        countSubFolder:{rc:30612,msg:'统计子目录数量失败'},
        findTrashFolder:{rc:30614,msg:'查找垃圾箱失败'},
        rootFolderNotFind:{rc:40624,msg:'没有找到指定的根目录'},
        rootFolderMulti:{rc:40626,msg:'指定的根目录重复'}

    },
    articleFolder:{
        countSubArticle:{rc:30700,msg:'统计目录中的文档数量失败'},
        findSubArticle:{rc:30702,msg:'读取目录下的文档失败'},
        populateArticle:{rc:30704,msg:'查询文档失败'},
        saveArticleFolder:{rc:30706,msg:'文档移入目录失败'},
        removeArticleFolder:{rc:30708,msg:"从目录中移除文档失败"},
        find:{rc:30710,msg:"从目录中查找文档失败"},
        findNull:{rc:30712,msg:"从目录中查找文档为空"},
        findMulti:{rc:30714,msg:"从目录中查找到多个重复文档"},
        countFail:{rc:30716,msg:'统计目录下文档的数量失败'}
    },
    keyArticle:{
        find:{rc:30800,msg:'查找关键字-文档失败'},
        save:{rc:30802,msg:'保存关键字-文档失败'},
        remove:{rc:30804,msg:'删除关键字-文档失败'}
    }
}
exports.runtime_db_error=runtime_db_error;
/*var mongooseError={

    *//*user*//*
    countUser:{rc:10000,msg:'用户不存在'},
    saveUser:{rc:10002,msg:'用户保存失败'},
    findByIdUser:{rc:10004,msg:'对应的用户ID不存在，无法找到用户'},

    saveAttachment:{rc:10200,msg:'保存附件错误'},
    findByIdAndRemoveAttachment:{rc:10202,msg:'查找并删除文档附件错误'},
    delAttachment:{rc:10204,msg:"删除文档附件错误"},

    saveCommnent:{rc:10400,msg:'保存文档评论错误'},

    *//*article/attachment/comment*//*
    findByIDArticle:{rc:10500,msg:'文档查找错误'},
    updateArticleAttachment:{rc:10502,msg:'文档的附件更新错误'},
    updateArticleComment:{rc:10504,msg:'文档的评论更新错误'},
    addArticle:{rc:10506,msg:'添加新文档失败'},
    updateArticleContent:{rc:10508,msg:'文档的评论更新错误'},
    addArticleContent:{rc:10510,msg:'更新文档内容失败'},
    addArticleAttachment:{rc:10512,msg:'文档的附件添加错误'},
    readArticle:{rc:10514,msg:'读取文档错误'},
    updateArticleKey:{rc:10564,msg:'文档的关键字更新错误'}
}*/
/*
var mongooseError={

    */
/*user*//*

    countUser:{rc:10000,msg:'用户不存在'},
    saveUser:{rc:10002,msg:'用户保存失败'},
    findByIdUser:{rc:10004,msg:'对应的用户ID不存在，无法找到用户'},

    saveAttachment:{rc:10200,msg:'保存附件错误'},
    findByIdAndRemoveAttachment:{rc:10202,msg:'查找并删除文档附件错误'},
    delAttachment:{rc:10204,msg:"删除文档附件错误"},

    saveCommnent:{rc:10400,msg:'保存文档评论错误'},

    */
/*article/attachment/comment*//*

    findByIDArticle:{rc:10500,msg:'文档查找错误'},
    updateArticleAttachment:{rc:10502,msg:'文档的附件更新错误'},
    updateArticleComment:{rc:10504,msg:'文档的评论更新错误'},
    addArticle:{rc:10506,msg:'添加新文档失败'},
    updateArticleContent:{rc:10508,msg:'文档的评论更新错误'},
    addArticleContent:{rc:10510,msg:'更新文档内容失败'},
    addArticleAttachment:{rc:10512,msg:'文档的附件添加错误'},
    readArticle:{rc:10514,msg:'读取文档错误'},
    updateArticleKey:{rc:10564,msg:'文档的关键字更新错误'}
}*/
