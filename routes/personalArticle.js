/**
 * Created by wzhan039 on 2015-08-25.
 */
var express = require('express');
var router = express.Router();

var runtimeNodeError=require('./error_define/runtime_node_error').runtime_node_error;
var input_validate=require('./error_define/input_validate').input_validate;
var validateFolder=input_validate.folder;
var validateArticleFolder=input_validate.articleFolder;

var general=require('./assist/general').general
var dbOperation=require('./model/personalArticle').personalArticleDbOperation
var articleDbOperation=require('./model/article').articleDboperation;

var generalFunc=require('./express_component/generalFunction').generateFunction

var async=require('async')
//对原始数据进行处理，删除不需要的部分
var sanityFolderAndArticle=function(folder){
    var curLen=folder.length
    for (var i=0;i<curLen;i++){
        var curFolder=folder[i]
        if(undefined!=curFolder.nodes && curFolder.nodes.length>0){
            //console.log(curFolder)
            //
            sanityFolderAndArticle(curFolder.nodes)
        }

        //如果是文档，只需要设置folder=false（文档本身具有title字段）
        if(undefined!=folder[i].title){
            folder[i].folder=false;
            folder[i]._id=undefined
            folder[i].id=folder[i].hashId   //实际使用的是hashId
            folder[i].author=undefined
            folder[i].type='fa-file-o'
        }
        //添加字段，用来判断是folder还是article
        if(undefined!=folder[i].folderName){
            folder[i].level=undefined;
            folder[i].parentId=undefined;
            folder[i].owner=undefined;
            folder[i]._id=undefined
            folder[i].mDate=undefined
            folder[i].folder=true
            //folderName==>title
            folder[i].title=folder[i].folderName;
            folder[i].folderName=undefined;

        }

    }
}

//读取根目录的下级信息(子目录和文档)
router.get('/',function(req,res,next){
    if(1!=req.session.state){
        return res.redirect('/login')
    }
    var checkIntervalResult=generalFunc.checkInterval(req)
    if(checkIntervalResult.rc>0){
        return res.render('error_page/error')
    }
    return res.render('personalArticle',{title:'个人文档'})
})
router.post('/',function(req,res,next){
    if(1!=req.session.state){
        return res.json(runtimeNodeError.folder.notLogin)
    }
    var checkIntervalResult=generalFunc.checkInterval(req)
    if(checkIntervalResult.rc>0){
        return res.json(checkIntervalResult)
    }
    var userId=req.session.userId
    var defaultFolderName=general.defaultRootFolderName;
    var defaultRootFolder=[]

    async.forEachOf(defaultFolderName,function(value,key,cb){

        dbOperation.readRootFolder(userId,value,function(err,result) {
            if (0 < result.rc) {
                return res.json(result)
            }
            var rootFolderObj=result.msg.toObject()
            rootFolderObj.nodes=[]

            //1. 读取子目录
             dbOperation.readFolder(userId,rootFolderObj._id,function(err,result1){
                 if(0<result1.rc){
                    //return res.json(result1)
                    cb(result1)
                 }
                 if(0<result1.length){
                     rootFolderObj.nodes.push(result1.msg)
                 }
                 //2. 读取子文档
                 dbOperation.readArticleInFolder(userId,rootFolderObj._id,function(err,result2){
                     if(0<result2.rc){
                         //return res.json(result2)
                         cb(result2)
                     }
//console.log(result2)
                     articles=result2.msg
                     if(0<articles.length){
                         for(var i=0;i<articles.length;i++){
                             rootFolderObj.nodes.push(articles[i].articleId.toObject())
                         }

                     }
                     //console.log(rootFolderObj)
                     defaultRootFolder.push(rootFolderObj)
                     cb()
                     //return callback(null,{rc:0,msg:rootFolder})
                 })

             })
        })
    }, function(err){
        if(err){
            return res.json(null,err)
        }
        //console.log(defaultRootFolder)
        sanityFolderAndArticle(defaultRootFolder)
            return res.json({rc:0,msg:defaultRootFolder})
    })

})

//读取目录的下级信息(子目录和文档)
router.post('/readFolder',function(req,res,next){
    if(1!=req.session.state){
        return res.json(runtimeNodeError.folder.notLogin)
    }
    var checkIntervalResult=generalFunc.checkInterval(req)
    if(checkIntervalResult.rc>0){
        return res.json(checkIntervalResult)
    }
    var userId=req.session.userId
    var folderId=req.body.folderId
    if(undefined===folderId || !validateFolder._id.type.define.test(folderId)){
        return res.json(validateFolder._id.type.client)
    }
    dbOperation.readFolder(userId,folderId,function(err,result){
        return res.json(result)
    })
})
//修改目录名字
router.post('/rename',function(req,res,next){
    if(1!=req.session.state){
        return res.json(runtimeNodeError.folder.notLogin)
    }
    var checkIntervalResult=generalFunc.checkInterval(req)
    if(checkIntervalResult.rc>0){
        return res.json(checkIntervalResult)
    }
    var userId=req.session.userId
//    检查输入参数: folderId/原名/新名字
    var folderId=req.body.folderId;
    var oldFolderName=req.body.oldFolderName;
    var newFolderName=req.body.newFolderName;
    if(undefined===folderId || !validateFolder._id.type.define.test(folderId)){
        return res.json(validateFolder._id.type.client)
    }
    if(undefined===oldFolderName || !validateFolder.folderName.type.define.test(oldFolderName)){
        return res.json(validateFolder.folderName.type.client)
    }
    if(undefined===newFolderName || !validateFolder.folderName.type.define.test(newFolderName)){
        return res.json(validateFolder.folderName.type.client)
    }
    dbOperation.modifyFolderName(userId,folderId,oldFolderName,newFolderName,function(err,result){
        return res.json(result)
    })
})
//移动目录
router.post('/moveFolder',function(req,res,next){
    if(1!=req.session.state){
        return res.json(runtimeNodeError.folder.notLogin)
    }
    var checkIntervalResult=generalFunc.checkInterval(req)
    if(checkIntervalResult.rc>0){
        return res.json(checkIntervalResult)
    }
    var userId=req.session.userId;
    var folderId=req.body.folderId;
    var oldParentFolderId=req.body.oldParentFolderId;
    var newParentFolderId=req.body.newParentFolderId;
    var array=[folderId,oldParentFolderId,newParentFolderId]
    var len=array.length
    for(var i=0;i<len;i++){
        if(undefined===array[i] || !validateFolder._id.type.define.test(array[i])){
            return res.json(validateFolder._id.type.client)
        }
    }
    dbOperation.moveFolder(userId,folderId,oldParentFolderId,newParentFolderId,function(err,result){
        return res.json(result)
    })
})
//新增目录
router.post('/createFolder',function(req,res,next){
    if(1!=req.session.state){
        return res.json(runtimeNodeError.folder.notLogin)
    }
    var checkIntervalResult=generalFunc.checkInterval(req)
    if(checkIntervalResult.rc>0){
        return res.json(checkIntervalResult)
    }
    var userId=req.session.userId;

//    检查输入参数: 父目录Id/新名字
    var parentFolderId=req.body.parentFolderId;
    var folderName=req.body.folderName;
    if(undefined===parentFolderId || !validateFolder._id.type.define.test(parentFolderId)){
        return res.json(validateFolder._id.type.client)
    }
    if(undefined===folderName || !validateFolder.folderName.type.define.test(folderName)){
        return res.json(validateFolder.folderName.type.client)
    }
    dbOperation.createNewFolder(userId,parentFolderId,folderName,function(err,result){
        return res.json(result)
    })
})
//删除目录
router.post('/deleteFolder',function(req,res,next){
    if(1!=req.session.state){
        return res.json(runtimeNodeError.folder.notLogin)
    }
    var checkIntervalResult=generalFunc.checkInterval(req)
    if(checkIntervalResult.rc>0){
        return res.json(checkIntervalResult)
    }
    var userId=req.session.userId;

    var folderId=req.body.folderId;
    if(undefined===folderId || !validateFolder._id.type.define.test(folderId)){
        return res.json(validateFolder._id.type.client)
    }

    var childrenNum=0;
    dbOperation.countSubFolder(userId,folderId,function(err,result){
        if(0<result.rc){
            return res.json(result)
        }
        childrenNum+=result.msg
        dbOperation.countSubArticle(userId,folderId,function(err,result1){
            if(0<result1){
                return res.json(result1)
            }
            childrenNum+=result1.msg
            if(childrenNum>0){
                return res.json(runtimeNodeError.folder.hasChildNotDelete)
            }
            dbOperation.deleteFolder(userId,folderId,function(err,result){
                return res.json(result)
            })
        })
    })
})

//添加文档
router.post('/createArticleFolder',function(req,res,next){
    if(1!=req.session.state){
        return res.json(runtimeNodeError.folder.notLogin)
    }
    var checkIntervalResult=generalFunc.checkInterval(req)
    if(checkIntervalResult.rc>0){
        return res.json(checkIntervalResult)
    }
    var userId=req.session.userId;
    var parentFolderId=req.body.parentFolderId;
    //var articleId=req.body.articleId;
    //var articleName=req.body.articleName;
    if(undefined===parentFolderId || !validateFolder._id.type.define.test(parentFolderId)){
        return res.json(validateFolder._id.type.client)
    }
/*    if(undefined===folderName || !validateFolder.folderName.type.define.test(folderName)){
        return res.json(validateFolder.folderName.type.client)
    }*/
    articleDbOperation.createNewArticle('新建文件',userId,function(err,newArticleResult){
        if(0<newArticleResult.rc){
            return callback(null,newArticleResult)
        }
//console.log(newArticleResult.msg)
        var articleId=newArticleResult.msg

        dbOperation.createArticleFolder(userId,articleId,parentFolderId,function(err,result){
            if(0<result.rc){
                return res.json(result)
            }
            //result.msg=result.msg.toObject()
//console.log(result.msg)
//            var obj=result.msg.toObject()
//            sanityFolderAndArticle(obj)
//            console.log(obj)
            return res.json({rc:0,msg:result.msg})
        })
    })

})
//删除文档(实际删除)
router.post('/removeArticle',function(req,res,next){
    if(1!=req.session.state){
        return res.json(runtimeNodeError.folder.notLogin)
    }
    var checkIntervalResult=generalFunc.checkInterval(req)
    if(checkIntervalResult.rc>0){
        return res.json(checkIntervalResult)
    }
    var userId=req.body.userId;
    var articleId=req.body.articleId;
    if(undefined===articleId || !validateArticleFolder.articleId.type.define.test(articleId)){
        return res.json(validateArticleFolder.articleId.type.client)
    }

    dbOperation.removeArticleFolder(userId,articleId,function(err,result){
        return res.json(result)
    })
})
//删除文档(移入垃圾箱)
router.post('/deleteArticle',function(req,res,next){
    if(1!=req.session.state){
        return res.json(runtimeNodeError.folder.notLogin)
    }
    var checkIntervalResult=generalFunc.checkInterval(req)
    if(checkIntervalResult.rc>0){
        return res.json(checkIntervalResult)
    }
    var userId=req.session.userId;
    var articleId=req.body.articleId;
    var oldParentFolderId=req.body.oldParentFolderId;
    //var newParentFolderId=req.body.newParentFolderId;
    if(undefined===articleId || !validateArticleFolder.articleId.type.define.test(articleId)){
        return res.json(validateArticleFolder.articleId.type.client)
    }
    if(undefined===oldParentFolderId || !validateFolder._id.type.define.test(oldParentFolderId)){
        return res.json(validateFolder._id.type.client)
    }

    //首先读取trashFolder的Id
    var rootFolderName=general.defaultRootFolderName
    dbOperation.readRootFolderId(userId,rootFolderName[1],function(err,result){
        if(0<result.rc){
            return callback(result)
        }
        var trashFolderId=result.msg

        dbOperation.moveArticle(userId,articleId,oldParentFolderId,trashFolderId,function(err,result){
            return res.json(result)
        })
    })
})
//移动文档
router.post('/moveArticle',function(req,res,next){
    if(1!=req.session.state){
        return res.json(runtimeNodeError.folder.notLogin)
    }
    var checkIntervalResult=generalFunc.checkInterval(req)
    if(checkIntervalResult.rc>0){
        return res.json(checkIntervalResult)
    }
    var userId=req.session.userId;
    var articleId=req.body.articleId;
    var oldParentFolderId=req.body.oldParentFolderId;
    var newParentFolderId=req.body.newParentFolderId;
    var array=[oldParentFolderId,newParentFolderId]
    var len=array.length
    for(var i=0;i<len;i++){
        if(undefined===array[i] || !validateFolder._id.type.define.test(array[i])){
            return res.json(validateFolder._id.type.client)
        }
    }
    if(undefined===articleId || !validateArticleFolder.articleId.type.define.test(articleId)){
        return res.json(validateArticleFolder.articleId.type.client)
    }
    dbOperation.moveArticle(userId,articleId,oldParentFolderId,newParentFolderId,function(err,result){
        return res.json(result)
    })
})

module.exports = router;
