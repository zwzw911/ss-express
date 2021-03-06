/**
 * Created by wzhan039 on 2015-07-08.
 * 1. 读取文档后，在session中存储当前文档的id;userid键值对，以便可以快速的查找用户打开的文档是不是属于当前用户所有-------article_user
 */
var ue_config=require('./assist/ueditor_config').ue_config;
var general=require('./assist/general').general;

var express = require('express');
var router = express.Router();
var fs = require('fs');
//var fsErrorMsg=require('./assist/not_used_fs_error').fsErrorMsg;
var uploadDefine=require('./assist/upload_define').uploadDefine;

var mimes=require('./assist/mime').mimes;
var multiparty = require('multiparty');


var async=require('async');
var hash=require('./express_component/hashCrypt');
var regex=require('./express_component/regex');
var dbStructure=require('./model/db_structure')
var articleModel=dbStructure.articleModel;
var attachmentModel=dbStructure.attachmentModel;
var innerImageModel=dbStructure.innerImageModel;

var dbOperation=require('./model/article').articleDboperation
//var article=new articleModel({title:'test'})
var assistFunc=require('./assist_function/article').assistFunc
var recorderError=require('./express_component/recorderError').recorderError;
/*var serverError=require('./assist/server_error_define')
var articleError=serverError.articleError;
var inputError=require('./assist/input_error')
var inputDefine=require('./assist/input_define').inputDefine*/
var input_validate=require('./error_define/input_validate').input_validate

var generalDefine=require('./assist/general').general
var runtimeNodeError=require('./error_define/runtime_node_error').runtime_node_error

var pagination=require('./express_component/pagination').pagination
var generalFunc=require('./express_component/generalFunction').generateFunction
//输入articleId，在req.session.articleAuthor中直接查找，返回true/false; 如果直接从文档中读取，花费比较大
var isArticleOwner=function(req,articleHashId){
    //articleOwner是objectID，userId是字符，所以使用两个＝，而不是3个＝
    if(1==req.session.state) {
        //{articleHashId:Id,authorId:Id,lastOpen:date}
        //var session_articleAuthor = req.session.articleAuthor
        for (var i = 0; i < req.session.articleAuthor.length; i++) {
            //articleId直接作为key，value是authorId
            if (req.session.articleAuthor[i].authorId == req.session.userId) {
                return true
            }
        }
    }
    return false

}
//这是用来配置ueditor动作的，只能是save，http://localhost:3000/article/save?action=config&&noCache=1439627073741
router.all('/save',function(req,res,next){
    //console.log(req.query)
    /*    var preResult=generalFunc.preCheck(req,false)
     //console.log(preResult)
     if(preResult.rc>0){
     return res.json(preResult)
     }*/
//console.log('in')
    action[req.query.action](req,res,next)//for ueditor, both get and post use action to identify operation
    //action[req.body.action](req,res,next)
})
router.get('/:id',function(req,res,next){
    //console.log(req.params.id)
    if(undefined===req.session.state){req.session.state=2}
    var preResult=generalFunc.preCheck(req,false)
    //console.log(preResult)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    var id=req.params.id
    //console.log(id)
    if(!input_validate.article.hashId.type.define.test(id)){
        return res.json(input_validate.article.hashId.type.client)
    }
    res.status(200).render('article',{year:new Date().getFullYear()});
})

router.put('/',function(req,res,next){
    var preResult=generalFunc.preCheck(req,false)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    var articleHashId=req.body.articleHashId;
    /*测试
     **/
    /*    dbOperation.readComment(articleId,1,function(err,result){
     return res.json(result)
     })*/
    //console.log(regex.check(articleHashId,'testArticleHash'))
    if(undefined!=articleHashId && regex.check(articleHashId,'testArticleHash')){
        dbOperation.readArticle(articleHashId,function(err,result){
//console.log(result)
//            console.log(articleHashId)
            if(0===result.rc){

                //存储articleid:authorId键值对
                //var articleAuthor=req.session.articleAuthor;
                if(undefined===req.session.articleAuthor){req.session.articleAuthor=[]}
                //查找当前打开文档是否已经在req.session.articleAuthor中存在，存在，更新时间
                var articleOpenBefore=false
                var checkSize
                if(req.session.articleAuthor.length<=generalDefine.articleAuthorSize){
                    checkSize=req.session.articleAuthor.length
                }else{
                    checkSize=generalDefine.articleAuthorSize;
                }
                for(var i=0;i<checkSize;i++){
                    if(articleHashId==req.session.articleAuthor[i].articleHashId){
                        req.session.articleAuthor[i].lastModified=new Date().getTime();
                        articleOpenBefore=true;
                    }
                }
                //session中最多保持20个键值对，防止内存溢出
                if(req.session.articleAuthor.length>=generalDefine.articleAuthorSize){
                    var num=req.session.articleAuthor.length-generalDefine.articleAuthorSize+1;//确保数组为19个，需要删除的数量
                    req.session.articleAuthor.sort(function(x,y){
                        return x.lastModified< y.lastModified ? 1:-1
                    }).splice(0,num)
                }
                //每次用户对文档进行操作，都要更新laatModified
                if(false===articleOpenBefore){
                    req.session.articleAuthor.push({articleHashId:articleHashId,authorId:result.msg.author._id,lastModified:new Date().getTime()})
                }

                //除了attachment，其他的_id都不需要。attachment需要执行del操作，传递_id直接进行数据库操作
                //result.msg=result.msg.toPlainObject()
                result.msg._id=undefined//articleId已经显示在URL地址栏，无需发送
                result.msg.id=undefined//after .toObject(), _id会被复制到Id
//console.log(result.msg)
                assistFunc.eliminateArrayId(result.msg.keys)

                //assistFunc.eliminateId(result.msg.comment)
                assistFunc.eliminateArrayId(result.msg.innerImage)
                //assistFunc.eliminateObjectId(result.msg.user)
                isOwner=isArticleOwner(req,result.msg.author._id)

                //isArticleOwner(req,result.content.author._id)
                //assistFunc.eliminateId(result.content.author)
                //author 不是array，所以要手工设置为undefined
                result.msg.author._id=undefined

                //result.msg.isOwner=undefined;
                result.msg.isOwner=isOwner;
                //var pagination=pagination()
                result.msg.userInfo=generalFunc.getUserInfo(req)
                //console.log(result.msg.comment)
                return res.json(result)
            }else{
                return res.json(result)
            }
        })
    }else{
        return res.json(input_validate.article.hashId.type.client)
    }
})

router.put('/readComment/:articleHashId',function(req,res,next){
    var preResult=generalFunc.preCheck(req,false)
    if(preResult.rc>0){
        return res.json(preResult)
    }

    var articleHashId=req.params.articleHashId;
    if(undefined===articleHashId || !regex.check(articleHashId,'testArticleHash')){
        return res.json(input_validate.article.hashId.type.client)
    }

    var curPage;
    if(undefined===req.body.curPage || null===req.body.curPage || ''===req.body.curPage || 0>req.body.curPage){
        curPage=1;
    }else{
        curPage=parseInt(req.body.curPage,10);

        if(NaN===curPage) {
            return res.json(runtimeNodeError.article.commentCurPageWrongFormat)
        }
    }

    dbOperation.readComment(articleHashId,curPage,function(err,result){
            return res.json(result)
    })
})


//基本视图和数据分开获得，以便提升用户感受（虽然造成两次请求）
//获得初始数据


router.post('/upload/:articleHashId',function(req,res,next){
    var preResult=generalFunc.preCheck(req,true)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    var articleHashId=req.params.articleHashId
    if(undefined==articleHashId || !regex.check(articleHashId,'testArticleHash')){
        return res.json(input_validate.article.hashId.type.client)
    }
    if(!isArticleOwner(req,articleHashId)){
        return res.json(runtimeNodeError.article.notArticleOwner);
    }
    if(!fs.existsSync(uploadDefine.saveDir.define)){
        return res.json(uploadDefine.saveDir.error)
    }
//console.log(2)
    var form = new multiparty.Form({uploadDir:uploadDefine.saveDir.define ,maxFilesSize:uploadDefine.maxFileSize.define});

/*    {
        "file": [
        {
            "fieldName": "file",
            "originalFilename": "config_rrh.txt",
            "path": "D:\\IBeA1IEaGEgODfxlT7YIQB7I.txt",
            "headers": {
                "content-disposition": "form-data; name=\"file\"; filename=\"config_rrh.txt\"",
                "content-type": "text/plain"
            },
            "size": 325
        }
    ]
    }*/
    form.parse(req, function (err, fields, files) {
        var filesTmp = JSON.stringify(files, null, 2);
        var fieldsTemp = JSON.stringify(fields, null, 2);
//console.log(filesTmp);
//console.log(err)
        if (err) {
            var msg='';
            switch (err.status){
                case 413:
                    msg='上传文件超过预定义大小'
                    break
            }
            return res.json({rc: err.status, msg: msg})
        }
        var inputFile = files.file[0];

        var result = assistFunc.checkFile(inputFile)
        //console.log(result)
        if (true === result) {
            var suffix=inputFile.originalFilename.split('.').pop();
//console.log(uploadDefine.validImageSuffix.define.indexOf(suffix))
            if(-1!==uploadDefine.validImageSuffix.define.indexOf(suffix))
            {
                assistFunc.checkImgFile(inputFile.path,function(err,result){
//console.log(result)
                    if(result.rc>0) {
                        return res.json(result)
                    }


                })
            }
//if(true===result){
            var uploadedPath = inputFile.path;
            var tmpDate=new Date().getTime();//timestamp
            var tmpName=inputFile.originalFilename+tmpDate;
            //console.log(tmpName)
            var hashName=hash.hash('sha1',tmpName)+'.'+suffix;

            var dstPath = uploadDefine.saveDir.define + hashName;
            //重命名为真实文件名
            fs.rename(uploadedPath, dstPath, function (err) {
                if (err) {
                    //console.log('rename error: ' + err);
                    return res.json(uploadDefine.renameFail.error)

                } else {//rename done
                    //console.log('rename done')
                    var attachment=new attachmentModel({hashName:hashName,name:inputFile.originalFilename,storePath:uploadDefine.saveDir.define,size:inputFile.size,cDate:new Date().toLocaleString(),mDate:new Date().toLocaleString()})
                    //console.log(attachment)
                    dbOperation.addAttachment(articleHashId,attachment,function(err,result){
                        //console.log(result)
                        if(0===result.rc){
                            var returnResult={}
                            returnResult._id=result.msg._id
                            returnResult.id=result.msg.id
                            returnResult.name=result.msg.name
                            returnResult.size=result.msg.size
                            returnResult.cDataConv=result.msg.cDataConv
                            return res.json({rc:0,msg:returnResult})
                        }
                        return res.json(result)
                    })
                }
            });
        } else {//set error msg(no need rc code) to modify angular fileList
            //inputFile.msg = result.msg;
            return res.json(result.msg);
        }


    });
})

router.get('/download/:file',function(req,res,next){
    //if(undefined===req.session.state){return}
    var preResult=generalFunc.preCheck(req,false)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    var fileId=req.params.file
    if(!input_validate.attachment._id.type.define.test(fileId)){
        return callback(null,input_validate.attachment._id.type.client)
    }

    dbOperation.getAttachmentHashName(fileId,function(err,result){
        if(0<result.rc){
            return res.json(result)
        }
//console.log(result)
        var file=uploadDefine.saveDir.define+result.msg.hashName;
        if(fs.existsSync(file)){
            res.download(file,result.msg.name)
        }
    })

    //res.render('main_test');
})

//删除一个附件
router.delete('/removeAttachment',function(req,res,next) {
    var preResult=generalFunc.preCheck(req,true)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    var articleHashId = req.body.articleHashId
    var fileId = req.body.fileId
    if (undefined === articleHashId || !regex.check(articleHashId, 'testArticleHash')) {
        return res.json(input_validate.article.hashId.type.client)
    }
    if (undefined === fileId || !input_validate.attachment._id.type.define.test(fileId)) {
        return res.json(input_validate.attachment._id.type.client)
    }

    dbOperation.delAttachment(articleHashId,fileId,function(err,result){
        if(0===result.rc){

        //    db删除成功，则需要删除disk文件
        //    console.log(uploadDefine.saveDir.define+result.msg.hashName)
            fs.unlinkSync(uploadDefine.saveDir.define+result.msg.hashName)
            return res.json({rc:0,msg:null})
        }else{
            return res.json(result)
        }

    })
})

router.post('/addComment/:articleHashId',function(req,res,next){
    //新建文档
    //var articleId=req.body.articleID;
    var preResult=generalFunc.preCheck(req,true)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    var articleHashId=req.params.articleHashId
    if(undefined==articleHashId || !regex.check(articleHashId,'testArticleHash')){
        return res.json(input_validate.article.hashId.type.client)
    }
    //if(!isArticleOwner(req,articleId)){
    //    return res.json(runtimeNodeError.article.notArticleOwner);
    //}
    //console.log(0)
    if(1!=req.session.state){
        return res.json(runtimeNodeError.article.notLogin)
    }
    var comment=req.body.content;
//console.log(1)
    if(''===comment || null===comment | undefined===comment ){
        //return res.json(inputError.articleErrorMsg.comment.required)
        return res.json(input_validate.comment.content.require.client)
    }
    //console.log(2)
    if(comment.length>input_validate.comment.content.maxLength.define){
        return res.json(input_validate.comment.content.maxLength.client)
    }
    //console.log(3)
    if(  2!=req.session.state && 1!=req.session.state){
        return res.json(runtimeNodeError.article.noAuthToAddComment)
    }
    //console.log(4)
    dbOperation.addComment(articleHashId,req.session.userId,comment,function(err,result){
        //console.log(result)
        if(0<result.rc){
            return res.json(result)
        }
        dbOperation.readComment(articleHashId,'last',function(err,lastPageOfComment){
            return res.json(lastPageOfComment)
        })
        //result.user=assistFunc.eliminateObjectId(result.msg.user)
        //    return res.json(result)
    })
})
//router.get('/',function(req,res,next){
//    if(undefined===req.session.state){req.session.state=2}
//
//    res.render('main_test');
//})
router.put('/saveContent/:articleHashId',function(req,res,next){
    var preResult=generalFunc.preCheck(req,true)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    var articleHashId=req.params.articleHashId
    if(undefined==articleHashId || !regex.check(articleHashId,'testArticleHash')){
        return res.json(input_validate.article.hashId.type.client)
    }
    if(!isArticleOwner(req,articleHashId)){
        return res.json(runtimeNodeError.article.notArticleOwner);
    }

    var keys=req.body.keys
    var obj={title:req.body.title,pureContent:req.body.pureContent,htmlContent:req.body.htmlContent}
    //keys单独处理，应为涉及到数组和内容大小
/*    if(undefined!=keys && null!=keys && keys.length>input_validate.key.key.maxSize.define){
        return res.json(input_validate.key.key.maxSize.client)
    }*/
    //console.log(0)
    if(undefined!=keys && null!=keys && keys.length>input_validate.article.keys.maxSize.define){
        return res.json(input_validate.article.keys.maxSize.client)
    }
    for(var i=0;i<keys.length;i++){
        if(!input_validate.key.key.type.define.test(keys[i])){
            return res.json(input_validate.key.key.type.client)
        }
    }

    var field=['title','pureContent','htmlContent'];
    var curFieldName;
    for(var i=0;i<field.length;i++){
        curFieldName=field[i];
//console.log(input_validate.article[curFieldName])
//        console.log(1)
//        想要判断类型是否存在，然后判断定义
        if(undefined!=input_validate.article[curFieldName].require && true===input_validate.article[curFieldName].require.define){
            if(undefined===obj[curFieldName] || null===obj[curFieldName] || ''===obj[curFieldName] ){
                return res.json(input_validate.article[curFieldName].require.client)
            }
        }
        //console.log(2)
        if(undefined!=input_validate.article[curFieldName].minLength && undefined!=input_validate.article[curFieldName].minLength.define){
            if(undefined!=obj[curFieldName] && null!=obj[curFieldName] && obj[curFieldName].length<input_validate.article[curFieldName].minLength.define ){
                return res.json(input_validate.article[curFieldName].minLength.client)
            }
        }else{

        }
        //console.log(3)
        if(undefined!=input_validate.article[curFieldName].maxLength && undefined!=input_validate.article[curFieldName].maxLength.define){
            if(undefined!=obj[curFieldName] && null!=obj[curFieldName] && obj[curFieldName].length>input_validate.article[curFieldName].maxLength.define ){
                return res.json(input_validate.article[curFieldName].maxLength.client)
            }
        }
    }

    //首先更新key，然后更新文档
    dbOperation.updateArticleKey(articleHashId,keys,function(err,result){
        if(0===result.rc){
            dbOperation.updateArticleContent(articleHashId,obj,function(err,result){
                return res.json(result)
            })
        }else{
            return res.json(result)
        }
    })


 })

var action={
    uploadimage:function(req,res,next){
        //这是ue_editor的返回格式：http://fex.baidu.com/ueditor/#dev-request_specification
        var ue_result={state:'',url:'',title:'',original:''}

        var articleHashId=req.query.articleID
        //console.log(articleHashId)
//console.log(input_validate.article._id.type)
        if(!input_validate.article.hashId.type.define.test(articleHashId)){
            ue_result.state=input_validate.article.hashId.type.client.msg
            return res.json(ue_result)
        }
//console.log(1)
        if(!isArticleOwner(req,articleHashId)){
            ue_result.state=input_validate.article.notArticleOwner.msg
            return res.json(ue_result);
        }

        var upload_dir =general.ueUploadPath+ue_config.imagePathFormat
// console.log(upload_dir)
        if(!fs.existsSync(upload_dir)){
            recorderError(runtimeNodeError.article.uploadImageDirNotExist,'article','uploadimage')
            ue_result.state=runtimeNodeError.article.uploadImageDirNotExist.msg
            return res.json(ue_result)
        }
//console.log('upload image precheck done');
        var form = new multiparty.Form({uploadDir:upload_dir ,maxFilesSize:ue_config.imageMaxSize});
        form.parse(req, function (err, fields, files) {
            if (err) {
                var msg='';
                switch (err.status){
                    case 413:
                        //查过定义的大小
                        ue_result.state=runtimeNodeError.article.exceedMaxFileSize
                        return  res.json(ue_result)
                        break
                }
            }

            //var filesTmp = JSON.stringify(files, null, 2);
            //var fieldsTemp = JSON.stringify(fields, null, 2);
//console.log(filesTmp);
//console.log(fieldsTemp)
            var inputFile = files.file[0];

            var result = assistFunc.checkFile(inputFile)
//console.log(result)
            if(true!==result)
            {
                return res.json(result)
            }

		//check if suffix is ok	
            var suffix=inputFile.originalFilename.split('.').pop();
            if(-1!=ue_config.imageAllowFiles.indexOf('.'+suffix))//to fit ue_config format with .(like .png)
            {
                //console.log('valid')
                assistFunc.checkImgFile(inputFile.path,function(err,result){
                        //console.log(result)
                    if(result.rc>0) {
                        ue_result.state=result.msg
                        fs.unlinkSync(inputFile.path)
                        return res.json(ue_result)
                    }
                        //if(true===result){
                            //console.log('rename')
                    var uploadedPath = inputFile.path;
                    var tmpDate=new Date().getTime();//timestamp
                    var tmpName=inputFile.originalFilename+tmpDate;
                    //console.log(tmpName)
                    var hashName=hash.hash('sha1',tmpName)+'.'+suffix;
                    //innerImage:hash作为_id，所以无需后缀
                    //var hashName=hash.hash('sha1',tmpName);

                    var dstPath =upload_dir + '/'+hashName;
//console.log(uploadedPath)
//console.log(dstPath)
                    //resize+重命名inner_image
                    assistFunc.resizeSingleImage(uploadedPath,dstPath,function(err,resizeResult){
                        if(0<resizeResult.rc){
                            ue_result.state=uploadDefine.renameFail.error
                            return  res.json(ue_result)
                            //return res.json(resizeResult)
                        }
                        fs.access(uploadedPath,fs.F_OK,function(err){
                            if(err){

                            }else{
                                fs.unlinkSync(uploadedPath)
                                //fs.rename(`${folder}${files[idx]}_bak`,`${folder}${files[idx]}`)
                                var newInnerImage=new innerImageModel({hashName:hashName,name:inputFile.originalFilename,storePath:upload_dir,size:inputFile.size,cDate:new Date()})

                                dbOperation.addInnerImage(articleHashId,newInnerImage,function(err,result){

                                    ue_result.state="SUCCESS"
                                    ue_result.url='/'+ue_config.imagePathFormat+result.msg.hashName
                                    ue_result.title=result.msg.name;

                                    return res.json(ue_result)
                                })
                            }
                        })

                    })
                    /*fs.rename(uploadedPath, dstPath, function (err) {
                        if (err) {
                            recorderError({rc:err.code,msg:'重命名'+uploadedPath+'为'+dstPath+'失败'},'article','uploadImage')
                            ue_result.state=uploadDefine.renameFail.error
                            return  res.json(ue_result)
                        }
                        //var data=new attachmentModel({name:inputFile.originalFilename,hashName:hashName,storePath:upload_dir,size:inputFile.size,cDate:new Date().toLocaleString(),mDate:new Date().toLocaleString()})
                        var newInnerImage=new innerImageModel({hashName:hashName,name:inputFile.originalFilename,storePath:upload_dir,size:inputFile.size,cDate:new Date()})
//console.log(newInnerImage)
                        dbOperation.addInnerImage(articleHashId,newInnerImage,function(err,result){
//console.log(result)
                            ue_result.state="SUCCESS"
                            ue_result.url='/'+ue_config.imagePathFormat+result.msg.hashName
                            ue_result.title=result.msg.name;
//console.log(ue_result)
                            return res.json(ue_result)
                        })
                    });*/
                })
            }
        });

            /*        var  result={
             "state": "SUCCESS",
             "url": "upload/demo.jpg",   // image src
             "title": "orig.jpg",       // image title
             "original": "hash.jpg"  //alt(when no image, alternative text
             }*/
/*            result.state = 'SUCCESS'
            return res.json(result)*/
    },
    config:function(req,res,next){
        //console.log(ue_config)
        return res.json(ue_config)
    }
}


router.put('/uploadPreCheck',function(req,res,next) {
    var preResult=generalFunc.preCheck(req,true)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    var files = req.body.file;//{file:[]} before upload file, POST their properyt(name,size) first to pre check. the format should  equal to multiparty
//console.log(files);
    if (files && files.length > 0) {

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var result = assistFunc.checkFile(file)
            if (true === result) {
                //do nothing
            } else {//set error msg(no need rc code) to modify angular fileList
                file.msg = result.msg;
            }
        }
        return res.json({rc: 0, data: files})
    } else {
        return res.json({rc: 450, msg: '上传文件参数不正确'})
    }
})
module.exports = router;
