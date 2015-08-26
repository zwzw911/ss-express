/**
 * Created by wzhan039 on 2015-08-26.
 */
var dbStructure=require('./db_structure');
var articleModel=dbStructure.articleModel;
var folderModel=dbStructure.folderModel;
var userModel=dbStructure.userModel;
var articleFolderModel=dbStructure.articleFolderModel;


//var hash=require('../express_component/hashCrypt');
var async=require('async')

var errorRecorder=require('../express_component/recorderError').recorderError;

var general=require('../assist/general').general

var validateDb=require('../assist/3rd_party_error_define').validateDb;
//var inputDefine=require('../assist/input_define').inputDefine;
var input_validate=require('../error_define/input_validate').input_validate;
var runtimeDbError=require('../error_define/runtime_db_error').runtime_db_error;
var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error;

var pagination=require('../express_component/pagination').pagination

var validateFolder=input_validate.folder
var validateArticleFolder=input_validate.articleFolder
//为用户创建初始根目录
/*
 * userId:通过userId直接读取level=1的folder
 * */
var createRootFolder=function(userId,folderName,callback){

    if(undefined===folderName || null===folderName || ''===folderName){
        folderName='我的文件夹'
    }
    if(!validateFolder.folderName.type.define.test(value)){
        return callback(null,validateFolder.folderName.type.client)
    }
    if(!validateFolder.owner.type.define.test(userId)){
        return callback(null,validateFolder.owner.type.client)
    }

    var folder=new folderModel();
    folder.folderName=folderName
    folder.owner=userId
    folder.parentId=null;
    folder.level=1;

    validateDb.folder(folder,'folder','createRootFolder',function(err,result){
        if(0<result.rc){
            return callback(null,result)
        }
        folder.save(function(err,rootFolder){
            if(err){
                errorRecorder({rc:err.code,msg:err.errmsg},'folder','createRootFolder')
                return callback(err,runtimeDbError.folder.saveRootFolder)
            }else{
                return callback(null,{rc:0,msg:rootFolder})
            }
        })
    })
}


//读取用户的根目录以下的目录信息
/*
* userId:通过userId直接读取level=1的folder
* */
var readRootFolder=function(userId,callback){
    if(!validateFolder.owner.type.define.test(userId)){
        return callback(null,validateFolder.owner.type.client)
    }

    folderModel.find({owner:userId,parentId:null,level:1},function(err,recorder){
        if(err){
            errorRecorder({rc:err.code,msg:errmsg},'folder','readRootFolder')
            return callback(err,runtimeDbError.folder.readRootFolder)
        }

        readFolder(userId,recorder._id,function(err,result){
            return callback(null,result)
        })
    })
}

//读取用户指定目录下的目录信息
 var readFolder=function(userId,parentFolderId,callback){
     if(!validateFolder.owner.type.define.test(userId)){
         return callback(null,validateFolder.owner.type.client)
     }
     if(!validateFolder._id.type.define.test(parentFolderId)){
         return callback(null,validateFolder._id.type.client)
     }
     folderModel.find({owner:userId,parentId:parentFolderId},function(err,recorder){
         if(err){
             errorRecorder({rc:err.code,msg:errmsg},'folder','readFolder');
             return callback(err,runtimeDbError.folder.readFolder)
         }else{
             return callback(null,{rc:0,msg:recorder})
         }
     })

}

//修改指定目录的名称
/*
* userId:从塞塞斯哦那种读取,判断是否可以更改folder
* folderId: 要更改的目录
* oldName: 和userId/folder一起,确定要更改的目录
* newName: folder的新名字
* */
var modifyFolderName=function(userId,folderId,oldName,newName,callback){
    if(!validateFolder.owner.type.define.test(userId)){
        return callback(null,validateFolder.owner.type.client)
    }
    if(!validateFolder._id.type.define.test(folderId)){
        return callback(null,validateFolder._id.type.client)
    }
    if(!validateFolder.folderName.type.define.test(oldName)){
        return callback(null,validateFolder.folderName.type.client)
    }
    if(!validateFolder.folderName.type.define.test(newName)){
        return callback(null,validateFolder.folderName.type.client)
    }
    //不用update而用find+save,是为了可以检测参数是不是正确
    folderModel.findById(folderId,function(err,folderRec){
        if(err){
            errorRecorder({rc:err.code,msg:errmsg},'folder','modifyFolderName');
            return callback(null,runtimeDbError.folder.folderFindById)
        }
        if(folderRec.owner!=userId){
            return callback(null,runtimeNodeError.folder.notOwner)
        }
        if(folderRec.folderName!=oldName){
            return callback(null,runtimeNodeError.folder.folderNameNotMatch)
        }
        folderRec.save(function(err,updatedFolder){
            if(err){
                errorRecorder({rc:err.code,msg:errmsg},'folder','modifyFolderName')
                return callback(err,runtimeNodeError.folder.updateFolderNameFail)
            }
            return callback(null,{rc:0,msg:updatedFolder})
        })
    })

}

//移动目录
/*
 * userId:从塞塞斯哦那种读取,判断是否可以更改folder
 * folderId: 要更改的目录
 * oldParentFolderId: 从哪里移出
 * newParentFolderId: 移动到哪个目录中
 * */
var moveFolder=function(userId,folderId,oldParentFolderId,newParentFolderId,callback){
    if(!validateFolder.owner.type.define.test(userId)){
        return callback(null,validateFolder.owner.type.client)
    }
    if(!validateFolder._id.type.define.test(folderId)){
        return callback(null,validateFolder._id.type.client)
    }
    if(!validateFolder._id.type.define.test(oldParentFolderId)){
        return callback(null,validateFolder._id.type.client)
    }
    if(!validateFolder._id.type.define.test(newParentFolderId)){
        return callback(null,validateFolder._id.type.client)
    }
    //确定新parentId是当前用户的
    folderModel.findById(newParentFolderId,function(err,parentFolder){
        if(err){
            errorRecorder({rc:err.code,msg:errmsg},'folder','modifyFolderName');
            return callback(null,runtimeDbError.folder.folderFindById)
        }
        if(userId!==parentFolder.owner){
            return callback(null, runtimeNodeError.folder.notNewFolderOwner)
        }
        var parentLevel=parentFolder.level;
        if(validateFolder.folder.level.range.define.max<=parentLevel || validateFolder.folder.level.range.define.min>parentLevel ){
            return callback(null,runtimeNodeError.folder.parentLevelNotInRange)
        }
        folderModel.findById(folderId,function(err,folder){
            if(err){
                errorRecorder({rc:err.code,msg:errmsg},'folder','modifyFolderName');
                return callback(null,runtimeDbError.folder.folderFindById)
            }
            if(userId!==folder.owner){
                return callback(null,runtimeNodeError.folder.notOwner)
            }
            folder.parentId=newParentFolderId
            folder.level=parentLevel+1
            folder.save(function(err,newFolder){
                if(err){
                    errorRecorder({rc:err.code,msg:errmsg},'folder','modifyFolderName');
                    return callback(null,runtimeDbError.folder.saveFolder)
                }
                return callback(null,{rc:0,msg:newFolder})
            })

        })
    })

}
//创建新目录
/*
*   userId;当前用户的Id,从session中读取
*   parentFolderId: 在哪个目录下创建
*   newFolderName: 新创建目录的名称
* */
var createNewFolder=function(userId,parentFolderId,newFolderName,callback){
    if(!validateFolder.owner.type.define.test(userId)){
        return callback(null,validateFolder.owner.type.client)
    }
    if(!validateFolder._id.type.define.test(parentFolderId)){
        return callback(null,validateFolder._id.type.client)
    }
    if(!validateFolder.folderName.type.define.test(newFolderName)){
        return callback(null,validateFolder.folderName.type.client)
    }
    //首先检查父目录的深度
    folderModel.findById(newParentFolderId,function(err,parentFolder) {
        if (err) {
            errorRecorder({rc: err.code, msg: errmsg}, 'folder', 'createNewFolder');
            return callback(null, runtimeDbError.folder.folderFindById)
        }
        if (userId !== parentFolder.owner) {
            return callback(null, runtimeNodeError.folder.notNewFolderOwner)
        }
        var parentLevel = parentFolder.level;
        if (validateFolder.folder.level.range.define.max <= parentLevel || validateFolder.folder.level.range.define.min > parentLevel) {
            return callback(null, runtimeNodeError.folder.parentLevelNotInRange)
        }
        //创建新目录
        var folder=new folderModel();
        folder.folderName=newFolderName;
        folder.owner=userId;
        folder.parentId=parentFolderId
        folder.level=parentLevel+1;

        validateFolder.folder(folder,'folder','createNewFolder',function(err,savedFolder){
            if (err) {
                errorRecorder({rc: err.code, msg: errmsg}, 'folder', 'modifyFolderName');
                return callback(err, runtimeDbError.folder.saveFolder)
            }
            return callback(null,{rc:0,msg:savedFolder})
        })
    })

}
//删除目录
/*
* userId: 从session中读取,判断是否为folder的owner
* folder:要删除的目录
* */
var deleteFolder=function(userId,folderId,callback){
    if(!validateFolder.owner.type.define.test(userId)){
        return callback(null,validateFolder.owner.type.client)
    }
    if(!validateFolder._id.type.define.test(folderId)){
        return callback(null,validateFolder._id.type.client)
    }
    folderModel.findById(folderId,function(err,folder){
        if(err){
            errorRecorder({rc: err.code, msg: errmsg}, 'folder', 'deleteFolder');
            return callback(err, runtimeDbError.folder.folderFindById)
        }
        if(null===folder){
            return callback(null, runtimeDbError.folder.folderFindByIdNull)
        }
        if(1<folder.length){
            return callback(null, runtimeDbError.folder.folderFindByIdMulti)
        }
        countSubFolderAndSubArticle();
        folderModel.remove({_id:folderId},function(err){
            if(err){
                errorRecorder({rc: err.code, msg: errmsg}, 'folder', 'deleteFolder');
                return callback(err, runtimeDbError.folder.removeFolder)
            }
            return callback(null,{rc:0,msg:null})
        })
    })
}

//统计当前目录下子目录的数量
var countSubFolder=function(userId,parentId,callback){
    if(!validateFolder.owner.type.define.test(userId)){
        return callback(null,validateFolder.owner.type.client)
    }
    if(!validateFolder._id.type.define.test(parentId)){
        return callback(null,validateFolder._id.type.client)
    }
    folderModel.count({owner:userId,parentId:parentId},function(err,result){
        if(err){
            errorRecorder({rc: err.code, msg: errmsg}, 'folder', 'countSubFolder');
            return callback(err, runtimeDbError.folder.countSubFolder)
        }
        return callback(null,{rc:0,msg:result})
    })
}
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*******************************                articleFolder      ***************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/

//读取指定folder下的文档(不包含子目录)
/*
 *  userId: 从session中读取,判断是否为folder的owner
 *  folderId:文档要加入(移入)的目录编号
 * */
var readArticleInFolder=function(userId,folderId,callback){
    if(!validateFolder.owner.type.define.test(userId)){
        return callback(null,validateFolder.owner.type.client)
    }
    if(!validateArticleFolder.folderId.type.define.test(folderId)){
        return callback(null,validateArticleFolder.folderId.type.client)
    }
    var opt=[
            {path:'articleId',model:'articles',select:'title author'}//对于tree,只要title
            //{path:'comment',model:'comments',select:'content mDate user',options:{limit:general.commentPageSize}}
    ]
    articleFolderModel.find({folderId:folderId},'articleId',function(err,articleFolder){
        if(err){
            errorRecorder({rc: err.code, msg: errmsg}, 'articleFolder', 'readArticleInFolder');
            return callback(err, runtimeDbError.articleFolder.findSubArticle)
        }
        if(null===articleFolder){
            return callback(null,{rc:0,msg:[]})
        }
        var totalNum=articleFolder.length;
        var populateArray=[];
        for(var i=0;i<totalNum;i++){
            articleFolder[i].populate(opt,function(err,populatedArticle){
                if(err){
                    errorRecorder({rc: err.code, msg: errmsg}, 'articleFolder', 'readArticleInFolder');
                    return callback(err, runtimeDbError.articleFolder.populateArticle)
                }

                if(populatedArticle.author===userId){
                    populateArray.push(populatedArticle)
                }

            })
        }
        return callback(null,{rc:0,msg:populateArray})
    })
}

//和readArticle类似，只是读取的内容要以table的方式显示
var readArticleInFolderForPagination=function(userId,folderId,callback){
    if(!validateFolder.owner.type.define.test(userId)){
        return callback(null,validateFolder.owner.type.client)
    }
    if(!validateArticleFolder.folderId.type.define.test(folderId)){
        return callback(null,validateArticleFolder.folderId.type.client)
    }
    var opt=[
        {path:'articleId',model:'articles',select:'title author cDate mDate'}//对于tree,只要title
        //{path:'comment',model:'comments',select:'content mDate user',options:{limit:general.commentPageSize}}
    ]
    articleFolderModel.find({folderId:folderId},'articleId',function(err,articleFolder){
        if(err){
            errorRecorder({rc: err.code, msg: errmsg}, 'articleFolder', 'readArticleInFolder');
            return callback(err, runtimeDbError.articleFolder.findSubArticle)
        }
        if(null===articleFolder){
            return callback(null,{rc:0,msg:[]})
        }
        var totalNum=articleFolder.length;
        var populateArray=[];
        for(var i=0;i<totalNum;i++){
            articleFolder[i].populate(opt,function(err,populatedArticle){
                if(err){
                    errorRecorder({rc: err.code, msg: errmsg}, 'articleFolder', 'readArticleInFolder');
                    return callback(err, runtimeDbError.articleFolder.populateArticle)
                }

                if(populatedArticle.author===userId){
                    populateArray.push(populatedArticle)
                }

            })
        }
        return callback(null,{rc:0,msg:populateArray})
    })
}
//在folder下创建一个文档,或者从其他folder移动到当前文档
/*
*  userId: 从session中读取,判断是否为folder的owner
*  articleId:要添加的文档Id
*  folderId:文档要加入(移入)的目录编号
* */
var createArticleFolder=function(userId,articleId,folderId,callback){
    if(!validateFolder.owner.type.define.test(userId)){
        return callback(null,validateFolder.owner.type.client)
    }
    if(!validateArticleFolder.articleId.type.define.test(articleId)){
        return callback(null,validateFolder._id.type.client)
    }
    if(!validateArticleFolder.folderId.type.define.test(folderId)){
        return callback(null,validateArticleFolder.folderId.type.client)
    }
    folderModel.findById(folderId,function(err,folder){
        if(err){
            errorRecorder({rc: err.code, msg: errmsg}, 'articleFolder', 'createArticleFolder');
            return callback(err, runtimeDbError.folder.folderFindById)
        }
        if(userId!=folder.owner){
            return callback(null,runtimeNodeError.articleFolder.notFolderOwner)
        }
        var articleFolder=new articleFolderModel()
        articleFolder.articleId=articleId;
        articleFolder.folderId=folderId;
        validateDb.articleFolder(articleFolder,'articleFolder','createArticleFolder',function(err,result){
            if(0<result.rc){
                return callback(null,result)
            }
            articleFolder.save(function(err,savedrecorder){
                if(err){
                    errorRecorder({rc: err.code, msg: errmsg}, 'articleFolder', 'createArticleFolder');
                    return callback(err, runtimeDbError.articleFolder.saveArticleFolder)
                }
                return callback(null,{rc:0,msg:savedrecorder})
            })
        })
    })
}


//从当前folder中移除一个文档
/*
*  userId: 从session中读取,判断是否为folder的owner
*  articleId:要从folder中移除的文档Id
*  folderId:文档要从中移除的目录编号
* */
var removeArticleFolder=function(userId,articleId,folderId,callback){
    if(!validateFolder.owner.type.define.test(userId)){
        return callback(null,validateFolder.owner.type.client)
    }
    if(!validateArticleFolder.articleId.type.define.test(articleId)){
        return callback(null,validateFolder._id.type.client)
    }
    if(!validateArticleFolder.folderId.type.define.test(folderId)){
        return callback(null,validateArticleFolder.folderId.type.client)
    }
    folderModel.findById(folderId,function(err,folder){
        if(err){
            errorRecorder({rc: err.code, msg: errmsg}, 'articleFolder', 'removeArticleFolder');
            return callback(err, runtimeDbError.folder.folderFindById)
        }
        if(userId!=folder.owner){
            return callback(null,runtimeNodeError.articleFolder.notFolderOwner)
        }

        articleFolderModel.remove({folderId:folderId,articleId:articleId},function(err,removedRecorder){
            if(err){
                errorRecorder({rc: err.code, msg: errmsg}, 'articleFolder', 'removeArticleFolder');
                return callback(err, runtimeDbError.articleFolder.removeArticleFolder)
            }
            return callback(null,{rc:0,msg:null})
        })


}

//统计当前目录下文档的数量
var countSubArticle=function(userId,folderId,callback){
    if(!validateFolder._id.type.define.test(folderId)){
        return callback(null,validateArticleFolder.folderId.type.client)
    }
    articleFolderModel.count({folderId:folderId},function(err,result){
        if(err){
            errorRecorder({rc: err.code, msg: errmsg}, 'articleFolder', 'countSubArticle');
            return callback(err, runtimeDbError.articleFolder.countSubArticle)
        }
        return callback(null,{rc:0,msg:result})
    })
}
exports.personalArticleDbOperation={
    readRootFolder:readRootFolder,
    readFolder:readFolder,
    modifyFolderName:modifyFolderName,
    moveFolder:moveFolder,
    createNewFolder:createNewFolder,
    deleteFolder:deleteFolder,

    readArticleInFolder:readArticleInFolder,
    createArticleFolder:createArticleFolder,
    removeArticleFolder:removeArticleFolder
}