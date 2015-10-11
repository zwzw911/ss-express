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

var miscellaneousFunc=require('./assist_function/miscellaneous').func
//var runtimeNodeError=('./error_define/runtime_node_error').
var async=require('async')

var pagination=require('./express_component/pagination').pagination
//对单个node(object)进行处理
var sanitySingleNode=function(singleNode){
    //如果是文档，只需要设置folder=false（文档本身具有title字段）
    if(undefined!=singleNode.title){
        singleNode.folder=false;
        singleNode.edit=false;//非编辑状态
        singleNode._id=undefined
        singleNode.id=singleNode.hashId   //实际使用的是hashId
        singleNode.hashId=undefined
        singleNode.author=undefined
        singleNode.type='fa-file-o'
        //只是为了显示获得的结果有此属性
        singleNode.state=singleNode.state
        //console.log(singleNode.mDate)
        //singleNode.mDate=miscellaneousFunc.expressFormatLongDate(singleNode.mDate)
        singleNode.mDate=singleNode.mDateConv
        //singleNode.mDate=singleNode.mDate.getHours()
        //显示table中文档处于的状态,以便正确显示按钮[编辑]/[保存]
        singleNode.tableEdit=false
    }
    //如果是目录,添加字段
    if(undefined!=singleNode.folderName){
//console.log('folder')
        singleNode.level=undefined;
        singleNode.parentId=undefined;
        singleNode.owner=undefined;
        singleNode._id=undefined
        singleNode.mDate=undefined
        singleNode.folder=true
        singleNode.edit=false;
        //是folder,并且没有设置nodes,那么nodes设成[],以便ui-tree正确的认识这是folder
        (null===singleNode.nodes || undefined===singleNode.nodes) ? singleNode.nodes=[]:singleNode.nodes
        //folderName==>title
        singleNode.title=singleNode.folderName;
        singleNode.folderName=undefined;

    }
    //console.log(singleNode)
}
//对原始数据进行处理，删除不需要的部分
var sanityFolderAndArticle=function(node){
    if(node.constructor === Object){
//console.log('object')
        sanitySingleNode(node)
    }
    if(node.constructor === Array){
        var curLen=node.length
        for (var i=0;i<curLen;i++){
            var curNode=node[i]
            if(undefined!=curNode.nodes && curNode.nodes.length>0){
                //console.log(curNode)
                //
                sanityFolderAndArticle(curNode.nodes)
            }

            sanitySingleNode(curNode)
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
    //return res.render('personalArticle',{title:'个人文档'})
    return res.render('personalArticle',{title:'个人文档',year:new Date().getFullYear()})
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
//console.log(result.msg)
            defaultRootFolder[key]=result.msg.toObject()
            cb()
            //console.log(result)
/*            var rootFolderObj=result.msg.toObject()
            rootFolderObj.nodes=[]*/

           /* //1. 读取子目录
             dbOperation.readFolder(userId,rootFolderObj._id,function(err,result1){
                 if(0<result1.rc){
                    //return res.json(result1)
                    cb(result1)
                 }

                 var folderLen=result1.msg.length
                 if(0<folderLen){
                     for(var i=0;i<folderLen;i++){
                         //console.log(result1.msg[i])
                         rootFolderObj.nodes.push(result1.msg[i].toObject())
                     }

                 }
//console.log( rootFolderObj.nodes)
                 //2. 读取子文档
                 dbOperation.readArticleInFolder(userId,rootFolderObj._id,function(err,result2){
                     if(0<result2.rc){
                         //return res.json(result2)
                         cb(result2)
                     }
//console.log(result2)
                     var articles=result2.msg
                     if(0<articles.length){
                         for(var i=0;i<articles.length;i++){
                             rootFolderObj.nodes.push(articles[i].articleId.toObject())
                         }
                     }
                     //console.log(rootFolderObj)
                     //defaultRootFolder.push(rootFolderObj)
                     defaultRootFolder[key]=rootFolderObj
                     cb()
                     //return callback(null,{rc:0,msg:rootFolder})
                 })

             })*/
        })
    }, function(err){
        if(err){
            //console.log(err)
            return res.json(null,err)
        }
        //console.log(defaultRootFolder)
        var result={}
        sanityFolderAndArticle(defaultRootFolder)
        //console.log(defaultRootFolder)
        result.defaultRootFolder=defaultRootFolder
        result.userInfo=generalFunc.getUserInfo(req)
        //console.log(defaultRootFolder)
            return res.json({rc:0,msg:result})
    })

})
router.post('/checkIfRootFolder',function(req,res,next){
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
    dbOperation.checkIfRootFolder(folderId,function(err,result){
        //console.log(result)
        return res.json(result)
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
    var subFolderAndArticles=[];//填充到nodes中的数据
    dbOperation.readFolder(userId,folderId,function(err,result){
        var folderLen=result.msg.length
        if(0<folderLen){
            for(var i=0;i<folderLen;i++){
                subFolderAndArticles.push(result.msg[i].toObject())
            }

        }
        dbOperation.readArticleInFolder(userId,folderId,function(err,result2) {
            if (0 < result2.rc) {
                return res.json(result2)
            }
//console.log(result2.msg)
            var articles = result2.msg
            if (0 < articles.length) {
                for (var i = 0; i < articles.length; i++) {
                    subFolderAndArticles.push(articles[i].articleId.toObject())
                }
            }
//console.log(subFolderAndArticles)
            sanityFolderAndArticle(subFolderAndArticles)
            //console.log(subFolderAndArticles)
            //pagination在router中完成，因为所有数据一次传送至客户端，然后配合pagination信息进行分页
            var paginationInfo=pagination(articles.length,1,general.articleFolderPageSize,general.articleFolderPageLength)
            return res.json({rc:0,msg:subFolderAndArticles,pagination:paginationInfo})
        })
        
    })
})
//获得目录下所有文档的分页信息(只是借用函数来处理前端数据，所以无需读取db)
router.post('/pagination',function(req,res,next){
    //var folderId=req.body.folderId;
    var total=req.body.total;
    var curPage=req.body.curPage;
/*    if(!validateFolder._id.type.define.test(folderId)){
        return res.json(validateFolder._id.type.client)
    }*/
    if(isNaN(total)){
        return res.json(runtimeNodeError.article.articleNumNotInt)
    }
    if(-1===general.validPaginationString.indexOf(curPage) && isNaN(parseInt(curPage))){
        return res.json(runtimeNodeError.general.invalidPaginationString)
    }
    //dbOperation.readArticleNumInFolder(folderId,function(err,result){
        var paginationInfo=pagination(total,curPage,general.articleFolderPageSize,general.articleFolderPageLength)
        return res.json({rc:0,msg:paginationInfo})
    //})
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
        if(0<result.rc){
            return res.json(result)
        }
        return res.json({rc:0,msg:null})
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
    if(null===oldParentFolderId || undefined===oldParentFolderId){
        return callback(null,runtimeNodeError.folder.cantMoveDefaultFolder)
    }
    if(oldParentFolderId===newParentFolderId){
        return res.json({rc:0,msg:null})
    }
    var array=[folderId,oldParentFolderId,newParentFolderId]
    var len=array.length
    for(var i=0;i<len;i++){
        if(undefined===array[i] || !validateFolder._id.type.define.test(array[i])){
            return res.json(validateFolder._id.type.client)
        }
    }
    dbOperation.moveFolder(userId,folderId,oldParentFolderId,newParentFolderId,function(err,result){
        if(0<result.rc){
            return res.json(result)
        }
        return res.json({rc:0,msg:null})
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
    if(undefined===folderName || null===folderName || ''===folderName){
        folderName='新建文件夹'
    }
    if(undefined===folderName || !validateFolder.folderName.type.define.test(folderName)){
        return res.json(validateFolder.folderName.type.client)
    }
    dbOperation.createNewFolder(userId,parentFolderId,folderName,function(err,result){
        if(0<result.rc){
            return res.json(result)
        }
        var addedNode=result.msg.toObject()
        sanityFolderAndArticle(addedNode)

        return res.json({rc:0,msg:addedNode})
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
        var articleId=newArticleResult.msg.articleId
        var articleHashId=newArticleResult.msg.articleHashId

        dbOperation.createArticleFolder(userId,articleId,parentFolderId,function(err,result){
            if(0<result.rc){
                return res.json(result)
            }
            //result.msg=result.msg.toObject()
//console.log(result.msg)

            var obj=result.msg  //已经是object
            obj.hashId=articleHashId
            sanityFolderAndArticle(obj)//santityFolderAndArticle只能处理数组
            return res.json({rc:0,msg:obj})//返回还是需要一个object,以便文档的数据可以插入父亲的nodes
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
    var userId=req.session.userId;
    var articleHashId=req.body.articleHashId;
//console.log(articleHashId)
    if(undefined===articleHashId || !input_validate.article.hashId.type.define.test(articleHashId)){
        return res.json(input_validate.article.hashId.type.client)
    }

    articleDbOperation.readArticle(articleHashId,function(err,readArticle){
        if(0<readArticle.rc){
            return callback(null,readArticle)
        }
       //console.log(readArticle.msg)
        var articleId=readArticle.msg._id
        dbOperation.removeArticleFolder(userId,articleId,function(err,result){
            return res.json(result)
        })
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
    var articleHashId=req.body.articleHashId;
    var oldParentFolderId=req.body.oldParentFolderId;
    //var newParentFolderId=req.body.newParentFolderId;
    if(undefined===articleHashId || !input_validate.article.hashId.type.define.test(articleHashId)){
        return res.json(validateArticleFolder.articleId.type.client)
    }
    if(undefined===oldParentFolderId || !validateFolder._id.type.define.test(oldParentFolderId)){
        return res.json(validateFolder._id.type.client)
    }

    //首先读取trashFolder的Id
    var rootFolderName=general.defaultRootFolderName
    dbOperation.readRootFolder(userId,rootFolderName[1],function(err,result){
        if(0<result.rc){
            return callback(result)
        }
        //console.log(result.msg)
        var trashFolderId=result.msg._id
        dbOperation.moveArticle(userId,articleHashId,oldParentFolderId,trashFolderId,function(err,result){
            if(0<result.rc){
                return res.json(result)
            }
            return res.json({rc:0,msg:null})
        })
/*        articleDbOperation.readArticle(articleHashId,function(err,readArticle){
            if(0<readArticle.rc){
                return callback(null,readArticle)
            }
            var articleId=readArticle.msg._id
//console.log(articleId)

        })*/

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
    if(oldParentFolderId===newParentFolderId){
        return res.json({rc:0,msg:null})
    }
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
        if(0<result.rc){
            return res.json(result)
        }
        return res.json({rc:0,msg:null})
    })
})

//更改文档
router.post('/updateArticle',function(req,res,next){
    if(1!=req.session.state){
        return res.json(runtimeNodeError.folder.notLogin)
    }
    var checkIntervalResult=generalFunc.checkInterval(req)
    if(checkIntervalResult.rc>0){
        return res.json(checkIntervalResult)
    }
    var userId=req.session.userId;
    var articleHashId=req.body.articleHashId;
    var articleNewName=req.body.articleNewName;
    var newState=req.body.state;
    if(undefined===articleHashId || !validateArticleFolder.articleId.type.define.test(articleHashId)){
        return res.json(validateArticleFolder.articleId.type.client)
    }
    articleDbOperation.updateArticleContent(articleHashId,{title:articleNewName,state:newState},function(err,result){
        return res.json(result)
    })
})
module.exports = router;
