/**
 * Created by wzhan039 on 2015-07-08.
 * 1. 读取文档后，在session中存储当前文档的id;userid键值对，以便可以快速的查找用户打开的文档是不是属于当前用户所有-------article_user
 */
var ue_config=require('./assist/ueditor_config').ue_config;
var general=require('./assist/general').general;

var express = require('express');
var router = express.Router();
var fs = require('fs');
var fsErrorMsg=require('./assist/fs_error').fsErrorMsg;
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

var dbOperation=require('./model/article')
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


//输入articleId，在req.session.articleAuthor中直接查找，返回true/false; 如果直接从文档中读取，花费比较大
var isArticleOwner=function(req,articleId){
    //articleOwner是objectID，userId是字符，所以使用两个＝，而不是3个＝
    if(1==req.session.state) {
        //{articleId:authorId,lastOpen}
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

router.get('/',function(req,res,next){

    if(undefined===req.session.state){req.session.state=2}
//console.log('root')
    /*    console.log(req.query.articleId)

     console.log(regex.check(req.query.articleId,'testArticleHash'))*/

    //res.json({id:req.query.articleId})
    //req.session.state=1;
    //req.session.userId='55c4096740f0a0d025917528'
    res.render('article');


})

//基本视图和数据分开获得，以便提升用户感受（虽然造成两次请求）
//获得初始数据
router.post('/',function(req,res,next){
    var articleId=req.body.articleID;
    if(undefined!=articleId && regex.check(articleId,'testArticleHash')){
        dbOperation.articleDboperation.readArticle(articleId,function(err,result){
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
                    if(articleId==req.session.articleAuthor[i].articleId){
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
                    req.session.articleAuthor.push({articleId:articleId,authorId:result.msg.author._id,lastModified:new Date().getTime()})
                }

                //console.log()
                //除了attachment，其他的_id都不需要。attachment需要执行del操作，传递_id直接进行数据库操作
                //result.msg=result.msg.toPlainObject()
//console.log(result.msg)
                result.msg._id=undefined//articleId已经显示在URL地址栏，无需发送
                result.msg.id=undefined//after .toObject(), _id会被复制到Id

                assistFunc.eliminateArrayId(result.msg.keys)
//console.log(result.msg)
                //assistFunc.eliminateId(result.msg.comment)
                assistFunc.eliminateArrayId(result.msg.innerImage)
                //assistFunc.eliminateObjectId(result.msg.user)
//console.log(isArticleOwner(req,result.content.author._id))
                isOwner=isArticleOwner(req,result.msg.author._id)

                //isArticleOwner(req,result.content.author._id)
                //assistFunc.eliminateId(result.content.author)
                //author 不是array，所以要手工设置为undefined
                result.msg.author._id=undefined

                //result.msg.isOwner=undefined;
                result.msg.isOwner=isOwner;

                return res.json(result)//
            }else{
                return res.json(result)
            }
        })
    }else{
        return res.json(input_validate.article._id.type)
    }
})

router.post('/upload/:articleId',function(req,res,next){
    var articleId=req.params.articleId
    if(undefined==articleId || !regex.check(articleId,'testArticleHash')){
        return res.json(input_validate.article._id.type)
    }
    if(!isArticleOwner(req,articleId)){
        return res.json(runtimeNodeError.article.notArticleOwner);
    }
    if(!fs.existsSync(uploadDefine.saveDir.define)){
        return res.json(uploadDefine.saveDir.error)
    }

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
//uplaod.log(filesTmp);
//console.log(fieldsTemp)
        if (err) {
            var msg='';
            switch (err.status){
                case 413:
                    msg='文件超过预定义大小'
                    break
            }
            return res.json({rc:err.status,msg:msg})
        } else {
            var inputFile = files.file[0];

            var result = assistFunc.checkFile(inputFile)
            if (true === result) {
                var suffix=inputFile.originalFilename.split('.').pop();
                if(-1!=uploadDefine.validImageSuffix.define.indexOf(suffix))
                {
                    assistFunc.checkImgFile(inputFile.path,function(err,result){

                        if(result.rc>0) {
                            return res.json(result)
                        }else{
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
                                    var attachment=new attachmentModel({_id:hashName,name:inputFile.originalFilename,storePath:uploadDefine.saveDir.define,size:inputFile.size,cDate:new Date().toLocaleString(),mDate:new Date().toLocaleString()})
                                    dbOperation.articleDboperation.addAttachment(articleId,attachment,function(err,result){
                                        return res.json(result)
                                    })
                                }
                            });
/*                            }else{
                                res.json({msg:'不是图片文件'});
                                return
                            }*/

                        }
                    })
                }
            } else {//set error msg(no need rc code) to modify angular fileList
                //inputFile.msg = result.msg;
                return res.json(result.msg);
                ;
            }

        }
    });

    //return;

})
router.get('/download/:file',function(req,res,next){
    if(undefined===req.session.state){return}
//console.log(req.params.file)
    var file=uploadDefine.saveDir.define+req.params.file;
    if(fs.existsSync(file)){
        //console.log(file)
        //var options = {
        //    root:uploadDefine.saveDir.define,
        //    //dotfiles: 'deny',
        //    headers: {
        //        'x-timestamp': Date.now(),
        //        //'x-sent': true,
        //        dotfiles:'allow',
        //            "content-type": "application/octet-stream"
        //    }
        //};
/*        res.sendFile(req.query.file,options,function(err){
            if(err){throw err}
        })*/
/*        res.download(file,'test.png',function(err){
            if(err){throw err}
        })*/
        res.download(file)
    }
    //res.render('main_test');
})



router.post('/addComment/:articleId',function(req,res,next){
    //新建文档
    //var articleId=req.body.articleID;
    var articleId=req.params.articleId
    if(undefined==articleId || !regex.check(articleId,'testArticleHash')){
        return res.json(input_validate.article._id.type)
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
    dbOperation.articleDboperation.addComment(articleId,req.session.userId,comment,function(err,result){
//console.log(result)
        result.user=assistFunc.eliminateObjectId(result.msg.user)
            return res.json(result)

    })
})
//router.get('/',function(req,res,next){
//    if(undefined===req.session.state){req.session.state=2}
//
//    res.render('main_test');
//})
router.post('/saveContent/:articleId',function(req,res,next){
    //console.log(req.params.articleId)
    var articleId=req.params.articleId
    if(undefined==articleId || !regex.check(articleId,'testArticleHash')){
        return res.json(input_validate.article._id.type)
    }
    if(!isArticleOwner(req,articleId)){
        return res.json(runtimeNodeError.article.notArticleOwner);
    }

    var keys=req.body.keys
    var obj={title:req.body.title,pureContent:req.body.pureContent,htmlContent:req.body.htmlContent}
    //keys单独处理，应为涉及到数组和内容大小
    if(undefined!=keys && null!=keys && keys.length>input_validate.key.key.maxSize.define){
        return res.json(input_validate.key.key.maxSize.client)
    }
    for(var i=0;i<keys.length;i++){
        if(keys[i].length>input_validate.key.key.maxLength.define){
            return res.json(input_validate.key.key.maxLength.client)
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

    dbOperation.articleDboperation.updateArticleKey(articleId,keys,function(err,result){
        if(0===result.rc){
            dbOperation.articleDboperation.updateArticleContent(articleId,obj,function(err,result){
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

        var articleId=req.query.articleID
        //console.log(articleId)
//console.log(input_validate.article._id.type)
        if(!input_validate.article._id.type.define.test(articleId)){
            ue_result.state=input_validate.article._id.type.client.msg
            return res.json(ue_result)
        }
//console.log(1)
        if(!isArticleOwner(req,articleId)){
            ue_result.state=input_validate.article.notArticleOwner.msg
            return res.json(ue_result);
        }

        var upload_dir =general.rootPath+'/'+ue_config.imagePathFormat
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

            var filesTmp = JSON.stringify(files, null, 2);
            var fieldsTemp = JSON.stringify(fields, null, 2);
//console.log(filesTmp);
//console.log(fieldsTemp)
            var inputFile = files.file[0];

            var result = assistFunc.checkFile(inputFile)
            if(true!==result)
            {
                return res.json(result)
            }

            var suffix=inputFile.originalFilename.split('.').pop();
            if(-1!=ue_config.imageAllowFiles.indexOf('.'+suffix))//to fit ue_config format with .(like .png)
            {
                //console.log('valid')
                assistFunc.checkImgFile(inputFile.path,function(err,result){
                        //console.log(inputFile.path)
                    if(result.rc>0) {
                        ue_result.state=result.msg
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
                    //重命名为真实文件名
                    fs.rename(uploadedPath, dstPath, function (err) {
                        if (err) {
                            recorderError({rc:err.code,msg:'重命名'+uploadedPath+'为'+dstPath+'失败'},'article','uploadImage')
                            ue_result.state=uploadDefine.renameFail.error
                            return  res.json(ue_result)
                        }
                        //var data=new attachmentModel({name:inputFile.originalFilename,hashName:hashName,storePath:upload_dir,size:inputFile.size,cDate:new Date().toLocaleString(),mDate:new Date().toLocaleString()})
                        var innerImageObj={_id:hashName,name:inputFile.originalFilename,storePath:upload_dir,size:inputFile.size}
                        dbOperation.articleDboperation.addInnerImage(articleId,innerImageObj,function(err,result){
//console.log(result)
                            ue_result.state="SUCCESS"
                            ue_result.url=result.msg._id
                            ue_result.title=result.msg.name;
//console.log(ue_result)
                            return res.json(ue_result)
                        })
/*                        data.validate(function(err){
                            if(err){
                                ue_result.state=uploadDefine.saveIntoDbFail.error
                                return res.json(ue_result);
                            }

                        })
                        data.save(function(err){
                            if(err) {throw  err}else{
                                ue_result.state='SUCCESS'
                                //ue_result.url=ue_config.imagePathFormat+'/'+hashName
                                ue_result.url=hashName //to show a image in ueditor, no need upload dir, just return imgae name, since the dir contain this image had been add into static
                                ue_result.title=inputFile.originalFilename
                                ue_result.original=inputFile.originalFilename
                                return res.json(ue_result)
                            }
                        });*/


                    });
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

//这是用来配置ueditor动作的，只能是save，http://localhost:3000/article/save?action=config&&noCache=1439627073741
router.use('/save/',function(req,res,next){
    action[req.query.action](req,res,next)//for ueditor, both get and post use action to identify operation
    //action[req.body.action](req,res,next)
})
router.post('/uploadPreCheck',function(req,res,next) {
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
        res.json({rc: 0, data: files})
        return
    } else {
        res.json({rc: 450, msg: '上传文件参数不正确'})
        return
    }
})
module.exports = router;
