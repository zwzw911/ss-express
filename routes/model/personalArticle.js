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
var pagination=require('../express_component/pagination').pagination

var validateDb=require('../error_define/3rd_party_error_define').validateDb;
//var inputDefine=require('../assist/input_define').inputDefine;
var input_validate=require('../error_define/input_validate').input_validate;
var runtimeDbError=require('../error_define/runtime_db_error').runtime_db_error;
var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error;

var pagination=require('../express_component/pagination').pagination

var validateFolder=input_validate.folder
var validateArticleFolder=input_validate.articleFolder
var validateArticle=input_validate.article
//判断是否为目录的创建者
var ifFolderOwner=function(userId,folderId, callback){
    folderModel.findById(folderId,'owner',function(err,folder) {
        if (err) {
            errorRecorder({rc: err.code, msg: err.errmsg}, 'articleFolder', 'moveArticle');
            return callback(err, runtimeDbError.folder.findById)
        }
        if(folder.owner!=userId){
            return callback(null,runtimeNodeError.folder.notFolderOwner)
        }
        return callback(null,{rc:0,msg:null})
    })
}

//读取根目录的Id,及其所有字段(除了root，其他都可以通过readFolder获得下级item的所有数据）
var readRootFolderId=function(userId,folderName,callback){
    if(!validateFolder.owner.type.define.test(userId)){
        return callback(null,validateFolder.owner.type.client)
    }
    var defaultFolderName=general.defaultRootFolderName
    if(-1===defaultFolderName.indexOf(folderName)){
        return callback(null,runtimeNodeError.folder.invalidateRootFolderName)
    }
    folderModel.find({owner:userId,level:1,folderName:folderName,parentId:null},function(err,folder){
        if(err){
            errorRecorder({rc:err.code,msg:err.err.errmsg},'folder','readRootFolderId')
            return callback(err,runtimeDbError.folder.findTrashFolder)
        }
        if([]===folder){
            return callback(null,runtimeDbError.folder.rootFolderNotFind)
        }
        if(1<folder.length){
            return callback(null,runtimeDbError.folder.rootFolderMulti)
        }
//console.log(folder[0])
        return callback(null,{rc:0,msg:folder[0]})
    })
}

var ifDefaultFolder=function(folder){
    return ((-1!=general.defaultRootFolderName.indexOf(folder.folderName) && (null===folder.parentId) && validateFolder.level.range.define.min===folder.level))
}

//根据Id读取数据库,判断folder是不是根目录
var checkIfRootFolder=function(folderId,callback){
    folderModel.findById(folderId,function(err,folderRec){
//console.log(folderRec)
        if(err){
            errorRecorder({rc:err.code,msg:err.errmsg},'folder','modifyFolderName');
            return callback(null,runtimeDbError.folder.folderFindById)
        }
        if(null===folderRec){
            return callback(null,runtimeDbError.folder.folderFindByIdNull)
        }
        //if(1<folderRec.length){
        //    return callback(null,runtimeDbError.folder.folderFindByIdMulti)
        //}
        //console.log(ifDefaultFolder(folderRec))
        if(ifDefaultFolder(folderRec)){
            //return callback(null,runtimeNodeError.folder.cantMoveDefaultFolder)
            return callback(null,{rc:0,msg:true})
        }
        return callback(null,{rc:0,msg:false})
    })

}
//为用户创建初始根目录和垃圾箱目录(都是level为1的目录,无法删除)
/*
 * userId:通过userId直接读取level=1的folder
 * */
var createRootFolder=function(userId,folderName,callback){
    var defaultFolderName=general.defaultRootFolderName
    if(-1===defaultFolderName.indexOf(folderName)){
        return callback(null,runtimeNodeError.folder.invalidateRootFolderName)
    }
    folderModel.find({owner:userId,folderName:folderName,level:1,parentId:null},function(err,folder){
        if(err) {
            errorRecorder({rc: err.code, msg: err.errmsg}, 'folder', 'createRootFolder');
            return callback(err, runtimeDbError.folder.createRootFolder)
        }
//console.log(runtimeDbError.folder.rootFolderMulti)
        if(1<folder.length){
            return callback(null,runtimeDbError.folder.rootFolderMulti)
        }
        if(1===folder.length){
            return callback(null,{rc:0,msg:folder})
        }
        if(0===folder.length){
            var folder=new folderModel();
            folder.folderName=folderName
            folder.owner=userId
            folder.parentId=null;
            folder.level=1;
            folder.cDate=new Date()

            validateDb.folder(folder,'folder','createRootFolder',function(err,result){
                if(0<result.rc){
                    return callback(null,result)
                }
                folder.save(function(err,rootFolder){
                    if(err){
                        errorRecorder({rc:err.code,msg:err.err.errmsg},'folder','createRootFolder')
                        return callback(err,runtimeDbError.folder.saveRootFolder)
                    }else{
                        return callback(null,{rc:0,msg:rootFolder})
                    }
                })
            })
        }
    })

}



//读取用户的根目录以下的目录信息
/*
* userId:通过userId直接读取level=1的folder(根目录和垃圾箱)
* */
var readRootFolder=function(userId,folderName,callback){
    if(!validateFolder.owner.type.define.test(userId)){
        return callback(null,validateFolder.owner.type.client)
    }
    var defaultFolderName=general.defaultRootFolderName

    if(-1===defaultFolderName.indexOf(folderName)){
        return callback(null,runtimeNodeError.folder.invalidateRootFolderName)
    }
    //获得根目录的信息
    readRootFolderId(userId,folderName,function(err,result){
/*        if(0<result.rc){
            return callback(null,result)
        }*/

        //result.msg=result.msg.toObject()
        return callback(null,result)

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
     ifFolderOwner(userId,parentFolderId,function(err,result){
         if(0<result.rc){
             return callback(null,result)
         }
         folderModel.find({owner:userId,parentId:parentFolderId},function(err,recorder){
             if(err){
                 errorRecorder({rc:err.code,msg:err.errmsg},'folder','readFolder');
                 return callback(err,runtimeDbError.folder.readFolder)
             }else{
                 return callback(null,{rc:0,msg:recorder})
             }
         })
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
            errorRecorder({rc:err.code,msg:err.errmsg},'folder','modifyFolderName');
            return callback(null,runtimeDbError.folder.folderFindById)
        }
        if(null===folderRec){
            return callback(null,runtimeDbError.folder.folderFindByIdNull)
        }
        if(1<folderRec.length){
            return callback(null,runtimeDbError.folder.folderFindByIdMulti)
        }
        if(ifDefaultFolder(folderRec)){
            return callback(null,runtimeNodeError.folder.cantMoveDefaultFolder)
        }
        if(folderRec.owner!=userId){
            return callback(null,runtimeNodeError.folder.notOwner)
        }
        if(folderRec.folderName!=oldName){
            return callback(null,runtimeNodeError.folder.folderNameNotMatch)
        }
        folderRec.folderName=newName
        folderRec.save(function(err,updatedFolder){
            if(err){
                errorRecorder({rc:err.code,msg:err.errmsg},'folder','modifyFolderName')
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
    if(oldParentFolderId===newParentFolderId){
        return callback(null,{rc:0,msg:null})
    }
    //确定当前目录不是根目录(因为根目录不能移动)
    folderModel.findById(folderId,function(err,currentFolder){
        if(err){
            errorRecorder({rc:err.code,msg:err.errmsg},'folder','modifyFolderName');
            return callback(null,runtimeDbError.folder.folderFindById)
        }
        if(null===currentFolder){
            return callback(null,runtimeDbError.folder.folderFindByIdNull)
        }
        if(ifDefaultFolder(currentFolder)){
            return callback(null,runtimeNodeError.folder.cantMoveDefaultFolder)
        }
//确定新parentId是当前用户的
        folderModel.findById(newParentFolderId,function(err,parentFolder){
            if(err){
                errorRecorder({rc:err.code,msg:err.errmsg},'folder','modifyFolderName');
                return callback(null,runtimeDbError.folder.folderFindById)
            }
            if(null===parentFolder){
                return callback(null,runtimeDbError.folder.folderFindByIdNull)
            }
            if(1<parentFolder.length){
                return callback(null,runtimeDbError.folder.folderFindByIdMulti)
            }
/*            if(ifDefaultFolder(parentFolder)){
                return callback(null,runtimeNodeError.folder.cantDeleteDefaultFolderName)
            }*/
            if(userId!=parentFolder.owner){
                return callback(null, runtimeNodeError.folder.notNewFolderOwner)
            }
            var parentLevel=parentFolder.level;
            if(validateFolder.level.range.define.max<=parentLevel || validateFolder.level.range.define.min>parentLevel ){
                return callback(null,runtimeNodeError.folder.parentLevelNotInRange)
            }
            folderModel.findById(folderId,function(err,folder){
                if(err){
                    errorRecorder({rc:err.code,msg:err.errmsg},'folder','modifyFolderName');
                    return callback(null,runtimeDbError.folder.folderFindById)
                }
                if(null===folder){
                    return callback(null,runtimeDbError.folder.folderFindByIdNull)
                }
                if(1<folder.length) {
                    return callback(null, runtimeDbError.folder.folderFindByIdMulti)
                }

                if(userId!=folder.owner){
                    return callback(null,runtimeNodeError.folder.notOwner)
                }
                folder.parentId=newParentFolderId
                folder.level=parentLevel+1
                folder.save(function(err,newFolder){
                    if(err){
                        errorRecorder({rc:err.code,msg:err.errmsg},'folder','modifyFolderName');
                        return callback(null,runtimeDbError.folder.saveFolder)
                    }
                    return callback(null,{rc:0,msg:newFolder})
                })

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
    folderModel.findById(parentFolderId,function(err,parentFolder) {
        if (err) {
            errorRecorder({rc: err.code, msg: err.errmsg}, 'folder', 'createNewFolder');
            return callback(null, runtimeDbError.folder.folderFindById)
        }
        if(null===parentFolder){
            return callback(null,runtimeDbError.folder.folderFindByIdNull)
        }
        if(1<parentFolder.length){
            return callback(null,runtimeDbError.folder.folderFindByIdMulti)
        }
        if (userId != parentFolder.owner) {
            return callback(null, runtimeNodeError.folder.notNewFolderOwner)
        }
        var parentLevel = parentFolder.level;
        if (validateFolder.level.range.define.max <= parentLevel || validateFolder.level.range.define.min > parentLevel) {
            return callback(null, runtimeNodeError.folder.parentLevelNotInRange)
        }
        //创建新目录
        var folder=new folderModel();
        folder.folderName=newFolderName;
        folder.owner=userId;
        folder.parentId=parentFolderId
        folder.level=parentLevel+1;

/*        validateFolder.folder(folder,'folder','createNewFolder',function(err,savedFolder){
            if (err) {
                errorRecorder({rc: err.code, msg: err.errmsg}, 'folder', 'modifyFolderName');
                return callback(err, runtimeDbError.folder.saveFolder)
            }
            return callback(null,{rc:0,msg:savedFolder})
        })*/
        folder.save(function(err,savedFolder){
            if (err) {
                errorRecorder({rc: err.code, msg: err.errmsg}, 'folder', 'modifyFolderName');
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
            errorRecorder({rc: err.code, msg: err.errmsg}, 'folder', 'deleteFolder');
            return callback(err, runtimeDbError.folder.folderFindById)
        }
        if(null===folder){
            return callback(null, runtimeDbError.folder.folderFindByIdNull)
        }
        if(1<folder.length){
            return callback(null, runtimeDbError.folder.folderFindByIdMulti)
        }
        if(ifDefaultFolder(folder)){
            return callback(null,runtimeNodeError.folder.cantDeleteDefaultFolderName)
        }
        if (userId != folder.owner) {
            return callback(null, runtimeNodeError.folder.notNewFolderOwner)
        }

        folderModel.remove({_id:folderId},function(err){
            if(err){
                errorRecorder({rc: err.code, msg: err.errmsg}, 'folder', 'deleteFolder');
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
    ifFolderOwner(userId,parentId,function(err,result){
        if(0<result.rc){
            return callback(null,result)
        }
        folderModel.count({owner:userId,parentId:parentId},function(err,result1){
            if(err){
                errorRecorder({rc: err.code, msg: err.errmsg}, 'folder', 'countSubFolder');
                return callback(err, runtimeDbError.folder.countSubFolder)
            }
            return callback(null,{rc:0,msg:result1})
        })
    })

}
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*******************************                articleFolder      ***************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
//读取目录下所有文档的数量
var readArticleNumInFolder=function(folderId,callback){
    articleFolderModel.count({folderId:folderId},function(err,result){
        if(err){
            return callback(err,runtimeDbError.articleFolder.countFail)
        }
        return callback(null,{rc:0,msg:result})
    })
}

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
            {path:'articleId',model:'articles',select:'title state author hashId mDate'}//对于tree,只要title
            //{path:'comment',model:'comments',select:'content mDate user',options:{limit:general.commentPageSize}}
    ]
    ifFolderOwner(userId,folderId,function(err,result) {
        if (0 < result.rc) {
            return callback(null, result)
        }
        articleFolderModel.find({folderId:folderId},'articleId',function(err,articleFolder){
            if(err){
                errorRecorder({rc: err.code, msg: err.errmsg}, 'articleFolder', 'readArticleInFolder');
                return callback(err, runtimeDbError.articleFolder.findSubArticle)
            }
            if([]===articleFolder){
                return callback(null,{rc:0,msg:[]})
            }
            var totalNum=articleFolder.length;
            var populateArray=[];
            //console.log(articleFolder);
            //console.log(articleFolder);
/*            articleFolder.populate(opt,function(err,populatedArticle) {
                if (err) {
                    console.log(err);
                    return
                }
                console.log(populatedArticle)
            })*/
            async.forEachOf(articleFolder,function(value,key,cb){
//console.log(value)
                value.populate(opt,function(err,populatedArticle){
                    if(err){
                        cb(err)
                    }
                    if(populatedArticle  && populatedArticle.articleId.author==userId){

                        populateArray[key]=populatedArticle
//console.log(key)
                    }
                    cb()
                })
            },function(err){
                if(err){
                    errorRecorder({rc: err.code, msg: err.errmsg}, 'articleFolder', 'readArticleInFolder');
                    return callback(err, runtimeDbError.articleFolder.populateArticle)
                }
//console.log(populateArray)
                return callback(null,{rc:0,msg:populateArray})
            })
/*            for(var i=0;i<totalNum;i++){
                articleFolder[i].populate(opt,function(err,populatedArticle){
                    if(err){
                        errorRecorder({rc: err.code, msg: err.errmsg}, 'articleFolder', 'readArticleInFolder');
                        return callback(err, runtimeDbError.articleFolder.populateArticle)
                    }
                    if(populatedArticle.author===userId){
                        populateArray.push(populatedArticle)
                    }

                })
            }
            return callback(null,{rc:0,msg:populateArray})*/
        })
    })

}

//和readArticle类似，只是读取的内容要以table的方式显示
var readArticleInFolderForPagination=function(userId,folderId,curPage,callback){
    if(!validateFolder.owner.type.define.test(userId)){
        return callback(null,validateFolder.owner.type.client)
    }
    if(!validateArticleFolder.folderId.type.define.test(folderId)){
        return callback(null,validateArticleFolder.folderId.type.client)
    }
    if(input_validate.regex.pageNum.test(curPage)){
        return callback(null,runtimeNodeError.articleFolder.pageNumWrong)
    }
    ifFolderOwner(userId,folderId,function(err,result){
        if(0<result.rc){
            return callback(null,result)
        }
        countSubArticle(userId,folderId,function(err,result1){
            if(0<result1.rc){
                return callback(null.result1)
            }
            var totalNum=result.msg
            var paginationInfo=pagination(totalNum,curPage,general.articleFolderPageSize,general.articleFolderPageLength)
            articleFolderModel.find({folderId:folderId},'articleId',{limit:general.articleFolderPageSize,skip:(paginationInfo.curPage-1)*general.articleFolderPageSize},function(err,articleFolder){
                if(err){
                    errorRecorder({rc: err.code, msg: err.errmsg}, 'articleFolder', 'readArticleInFolder');
                    return callback(err, runtimeDbError.articleFolder.findSubArticle)
                }
                if(null===articleFolder){
                    return callback(null,{rc:0,msg:[]})
                }
                var totalNum=articleFolder.length;
                var populateArray=[];

                var opt=[
                    {path:'articleId',model:'articles',select:'title author cDate mDate'}//对于tree,只要title
                    //{path:'comment',model:'comments',select:'content mDate user',options:{limit:general.commentPageSize}}
                ]
                for(var i=0;i<totalNum;i++){
                    articleFolder[i].populate(opt,function(err,populatedArticle){
                        if(err){
                            errorRecorder({rc: err.code, msg: err.errmsg}, 'articleFolder', 'readArticleInFolder');
                            return callback(err, runtimeDbError.articleFolder.populateArticle)
                        }

                        if(populatedArticle.author===userId){
                            populateArray.push(populatedArticle)
                        }

                    })
                }
                return callback(null,{rc:0,msg:populateArray})
            })
        })

    })

}
//在folder下创建一个文档
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
            errorRecorder({rc: err.code, msg: err.errmsg}, 'articleFolder', 'createArticleFolder');
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
                    errorRecorder({rc: err.code, msg: err.errmsg}, 'articleFolder', 'createArticleFolder');
                    return callback(err, runtimeDbError.articleFolder.saveArticleFolder)
                }
//console.log(savedrecorder)
                return callback(null,{rc:0,msg:{id:savedrecorder._id,title:'新建文件',mDate:savedrecorder.mDate,state:'正在编辑'}})
            })
        })
        //articleModel.findById(articleId,'_id title',function(err,article){
        //    if(err){
        //        errorRecorder({rc: err.code, msg: err.errmsg}, 'articleFolder', 'createArticleFolder');
        //        return callback(err, runtimeDbError.article.findById)
        //    }
        //    if(null===article){
        //        return callback(err, runtimeDbError.article.findByIdNull)
        //    }
        //    if(1<article.length){
        //        return callback(err, runtimeDbError.article.findByIdMulti)
        //    }
        //
        //})

    })
}


//从trash目录移除一个文档(实际删除文档)
/*
*  userId: 从session中读取,判断是否为folder的owner
*  articleId:要从folder中移除的文档Id
*  folderId:文档要从中移除的目录编号
* */
var removeArticleFolder=function(userId,articleId,callback){
    if(!validateFolder.owner.type.define.test(userId)){
        return callback(null,validateFolder.owner.type.client)
    }
    if(!validateArticleFolder.articleId.type.define.test(articleId)){
        return callback(null,validateArticleFolder.articleId.type.client)
    }
/*    if(!validateArticleFolder.folderId.type.define.test(folderId)){
        return callback(null,validateArticleFolder.folderId.type.client)
    }*/

    readRootFolderId(userId,'垃圾箱',function(err,result){
        if(0<result.rc){
            return callback(null, result)
        }
       //console.log( result.msg)
        var trashFolderId=result.msg._id
        ifFolderOwner(userId,trashFolderId,function(err,result){
            if(0<result.rc){
                return callback(null,result)
            }
            articleFolderModel.remove({folderId:trashFolderId,articleId:articleId},function(err,removedArticleFolder){
                if(err){
                    errorRecorder({rc: err.code, msg: err.errmsg}, 'articleFolder', 'removeArticleFolder');
                    return callback(err, runtimeDbError.articleFolder.removeArticleFolder)
                }
                articleModel.findByIdAndRemove(articleId,function(err,removedArticle) {
                    if(err){
                        errorRecorder({rc: err.code, msg: err.errmsg}, 'articleFolder', 'removeArticleFolder');
                        return callback(err, runtimeDbError.article.findByIdAndRemove)
                    }
                })
                return callback(null,{rc:0,msg:null})
            })
        })


    })

}

//把文档从一个目录移动到另外一个目录
/*
 *  userId: 从session中读取,判断是否为folder的owner
 *  articleId:要从folder中移除的文档hashId
 *  oldFolderId:文档所处当前目录编号
 *  newFolderId:文档将要移入目录编号
 * */
var moveArticle=function(userId,articleHashId,oldFolderId,newFolderId,callback) {
    if (!validateFolder.owner.type.define.test(userId)) {
        return callback(null, validateFolder.owner.type.client)
    }
    if (!validateArticle.hashId.type.define.test(articleHashId)) {
        return callback(null, validateArticle.hashId.type.client)
    }
    if (!validateArticleFolder.folderId.type.define.test(oldFolderId)) {
        return callback(null, validateArticleFolder.folderId.type.client)
    }
    if (!validateArticleFolder.folderId.type.define.test(newFolderId)) {
        return callback(null, validateArticleFolder.folderId.type.client)
    }
    if(oldFolderId===newFolderId){
        return callback(null,{rc:0,msg:null})
    }
    //转换hashId到id
    articleModel.find({hashId:articleHashId},function(err,findedArticle){
        if(err){
            errorRecorder({rc: err.code, msg: err.errmsg}, 'articleFolder', 'moveArticle');
            return callback(err, runtimeDbError.article.findByHashId)
        }
        if(0===findedArticle.length){
            return callback(err, runtimeDbError.article.findByHashIdNull)
        }
        if(1<findedArticle.length){
            return callback(err, runtimeDbError.article.findByHashIdMulti)
        }
        var articleId=findedArticle[0]._id
//console.log(findedArticle[0])
        //检查当前目录是否为用户所有
        ifFolderOwner(userId,oldFolderId,function(err,oldResult){
            if(0<oldResult.rc){
                return callback(null,oldResult)
            }
            //检查目标目录是否为用户所有
            ifFolderOwner(userId,newFolderId,function(err,newResult){
                if(0<newResult.rc){
                    return callback(null,newResult)
                }
                //查找原始记录并更新(save)
                articleFolderModel.find({folderId:oldFolderId,articleId:articleId},function(err,articleFolder){
                    if(err){
                        errorRecorder({rc: err.code, msg: err.errmsg}, 'articleFolder', 'moveArticle');
                        return callback(err, runtimeDbError.articleFolder.find)
                    }
                    if([]==articleFolder){
                        return callback(err, runtimeDbError.articleFolder.findNull)
                    }
                    if(1<articleFolder.length){
                        return callback(err, runtimeDbError.articleFolder.findMulti)
                    }
                    articleFolder[0].folderId=newFolderId
                    articleFolder[0].save(function(err,savedArticleFolder){
                        if(err){
                            errorRecorder({rc: err.code, msg: err.errmsg}, 'articleFolder', 'moveArticle');
                            return callback(err, runtimeDbError.articleFolder.save)
                        }
                        return callback(null,{rc:0,msg:savedArticleFolder})
                    })
                })

            })
        })
    })

}


//统计当前目录下文档的数量
var countSubArticle=function(userId,folderId,callback){
    if(!validateFolder._id.type.define.test(folderId)){
        return callback(null,validateArticleFolder.folderId.type.client)
    }
    ifFolderOwner(userId,folderId,function(err,result){
        if(0<result.rc){
            return callback(null,result)
        }
        articleFolderModel.count({folderId:folderId},function(err,num){
            if(err){
                errorRecorder({rc: err.code, msg: err.errmsg}, 'articleFolder', 'countSubArticle');
                return callback(err, runtimeDbError.articleFolder.countSubArticle)
            }
            return callback(null,{rc:0,msg:num})
        })
    })

}


/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*******************************                   exports           *************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
exports.personalArticleDbOperation={
    checkIfRootFolder:checkIfRootFolder,
    createRootFolder:createRootFolder,
    //readRootFolderId:readRootFolderId,
    readRootFolder:readRootFolder,
    readFolder:readFolder,
    modifyFolderName:modifyFolderName,
    moveFolder:moveFolder,
    createNewFolder:createNewFolder,
    deleteFolder:deleteFolder,
    countSubFolder:countSubFolder,

    readArticleNumInFolder:readArticleNumInFolder,
    readArticleInFolder:readArticleInFolder,
    createArticleFolder:createArticleFolder,
    removeArticleFolder:removeArticleFolder,
    moveArticle:moveArticle,
    countSubArticle:countSubArticle
}