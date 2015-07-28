/**
 * Created by wzhan039 on 2015-07-08.
 */
var ue_config=require('./assist/ueditor_config').ue_config;
var general=require('./assist/general').general;

var express = require('express');
var router = express.Router();

var fsErrorMsg=require('./assist/fs_error').fsErrorMsg;
var uploadDefine=require('./assist/upload_define').uploadDefine;

var mimes=require('./assist/mime').mimes;
var multiparty = require('multiparty');
var fs = require('fs');

var async=require('async');
var hash=require('../public/javascripts/express_component/hashCrypt');

var dbStructure=require('../public/javascripts/model/db_structure')
var articleModel=dbStructure.article;
var attachmentModel=dbStructure.attachment;
var innerImageModel=dbStructure.innerImage;

var article=new articleModel({title:'test',})
//check file ext/mime,name length, size, leftSpace
//file is object, format same as multiparty, so that this function can be used by both /upload and /uploadPreCheck
/*    {
        "fieldName": "file",
        "originalFilename": "config_rrh.txt",
        "path": "D:\\IBeA1IEaGEgODfxlT7YIQB7I.txt",
        "headers": {
            "content-disposition": "form-data; name=\"file\"; filename=\"config_rrh.txt\"",
            "content-type": "text/plain"
        },
        "size": 325
    }*/

var checkFile=function(file){
    var size=file.size
    var usedSpace=0;//M,should read from db
    if(uploadDefine.maxAvaliableSpace.define-usedSpace-size<0){
        return uploadDefine.maxAvaliableSpace.error
    }
//console.log(file.originalFilename.length)
    if(file.originalFilename.length > uploadDefine.fileNameLength.define){
        return uploadDefine.fileNameLength.error;
    }
    if(size>uploadDefine.maxFileSize.define) {
        return uploadDefine.maxFileSize.error;
    }

    var tmp=file.originalFilename.split('.');
    if(tmp.length<2){
        return uploadDefine.validSuffix.error;
    }else{
        var fileMime=file['headers']['content-type'];
        var suffix=tmp.pop();
        if(  -1===mimes[suffix].indexOf(fileMime) ){
            return uploadDefine.validSuffix.error
        }
    }

    return true;
}

//其他检查需要通过checkFile来完成
//检查后缀和MIME
//检查前2byte
var checkImgFile=function(filePath,callback){

    async.waterfall([
        function(cb) {
            fs.open(filePath, 'r', function(err,result){
                if (err) {
                    cb(new Error("open file failed:" + err.message));
                }
                cb(null,result);
            })
        },
        function(fd,cb){
                var buffer=new Buffer(2);
                fs.read(fd,buffer,0,2,0,function(err, bytesRead, buffer){
                    if (err) {
                        cb(new Error("read file failed:" + err.message));
                    }
                    cb(null,bytesRead, buffer)
                })
        }
    ],
        function(err,bytesRead, buffer){

            if(err){
                callback(err,false);
            }else{

                var bytes=buffer.toString('hex');
                //console.log(bytes);
                switch (bytes){
                    case '8950'://png  35152 or 0x8950
                        callback(null,true);
                        break;
                    case 'ffd8'://ipeg 65496 or 0x ffd8, case sensetive
//console.log(buffer);
                        callback(null,true);
                        break;
                    case '4749':// gif 4749 or 18249
                        callback(null,true);
                        break;
                    default :
//console.log('fas;le')
                        callback(err,false);

                }
            }
        })

}

//检查数据库/磁盘上的文件是否存在上传的richText中（img src）；不存在，删除
//对应用户在ueditor中添加了一个图片，但是过后又删除了
//1. 从数据库中读取文档对应的文件
//2。从rich txt中的img src中获得文件
//3. 遍历1中的文件，是不是存在2中，不存在就从 disk和db中删除
var sanityImgInText=function(str){
    var imgSrc=regex.check(str,'imgSrc');
}
router.post('/uploadPreCheck',function(req,res,next) {
    var files = req.body.file;//{file:[]} before upload file, POST their properyt(name,size) first to pre check. the format should  equal to multiparty
//console.log(files);
    if (files && files.length > 0) {

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var result = checkFile(file)
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

router.post('/upload',function(req,res,next){
    if(!fs.existsSync(uploadDefine.saveDir.define)){
        res.json(uploadDefine.saveDir.error)
        return
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
//console.log(filesTmp);
//console.log(fieldsTemp)
        if (err) {
            var msg='';
            switch (err.status){
                case 413:
                    msg='文件超过预定义大小'
                    break
            }
            res.json({rc:err.status,msg:msg})
            return
        } else {
            var inputFile = files.file[0];

            var result = checkFile(inputFile)
            if (true === result) {
                var suffix=inputFile.originalFilename.split('.').pop();
                if(-1!=uploadDefine.validImageSuffix.define.indexOf(suffix))
                {
                    checkImgFile(inputFile.path,function(err,result){

                        if(err) {
                            return err
                        }else{
                            if(true===result){
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
                                        res.json(uploadDefine.renameFail.error)
                                        return
                                    } else {//rename done
                                        var data=new attachmentModel({name:inputFile.originalFilename,hashName:hashName,storePath:uploadDefine.saveDir.define,size:inputFile.size,cDate:new Date().toLocaleString(),mDate:new Date().toLocaleString()})
                                        data.validate(function(err){
                                            if(err){
                                                res.json(uploadDefine.saveIntoDbFail.error);
                                                return
                                            }

                                        })
                                        data.save(function(err){
                                            if(err) {throw  err}else{
                                                res.json({rc:0})
                                                return
                                            }
                                        });

                                    }
                                });
                            }else{
                                res.json({msg:'不是图片文件'});
                                return
                            }

                        }
                    })
                }
            } else {//set error msg(no need rc code) to modify angular fileList
                //inputFile.msg = result.msg;
                res.json(result.msg);
                return;
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
        console.log(file)
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
router.get('/',function(req,res,next){
    if(undefined===req.session.state){req.session.state=2}
//console.log(req.query.action)

        res.render('article');


})
//基本视图和数据分开获得，以便提升用户感受（虽然造成两次请求）
router.post('/',function(req,res,next){
    //新建文档
    if(undefined===req.query.articleId && 1===req.session.state){

    }
})
//router.get('/',function(req,res,next){
//    if(undefined===req.session.state){req.session.state=2}
//
//    res.render('main_test');
//})
router.post('/saveContent',function(req,res,next){
    console.log(req.body.pureContent)
    console.log(req.body.htmlContent)
    return
 })

var action={
    uploadimage:function(req,res,next){
        var ue_result={state:'',url:'',title:'',original:''}
        //console.log(__dirname)
        //for(var i= 0;i<general.rootPath.length;i++){
        //
        //}
        var upload_dir =general.rootPath+'/'+ue_config.imagePathFormat

        if(!fs.existsSync(upload_dir)){
            ue_result.state='目录'+ue_config.imagePathFormat+'不存在'
            return res.json(ue_result)
        }
//console.log('upload image precheck done');
        var form = new multiparty.Form({uploadDir:upload_dir ,maxFilesSize:ue_config.imageMaxSize});
        form.parse(req, function (err, fields, files) {
            if (err) {
                var msg='';
                switch (err.status){
                    case 413:
                        ue_result.state='文件超过预定义大小'
                        return  res.json(ue_result)
                        break
                }
            } else {
                var filesTmp = JSON.stringify(files, null, 2);
                var fieldsTemp = JSON.stringify(fields, null, 2);
//console.log(filesTmp);
//console.log(fieldsTemp)
                var inputFile = files.file[0];

                var result = checkFile(inputFile)
                if (true === result) {
//console.log('ture')
                    var suffix=inputFile.originalFilename.split('.').pop();
                    if(-1!=ue_config.imageAllowFiles.indexOf('.'+suffix))//to fit ue_config format with .(like .png)
                    {
                        //console.log('valid')
                        checkImgFile(inputFile.path,function(err,result){
                                //console.log(inputFile.path)
                            if(err) {
                                ue_result.state=err.toString()
                                return res.json(ue_result)
                            }else{
                                if(true===result){
                                    //console.log('rename')
                                    var uploadedPath = inputFile.path;
                                    var tmpDate=new Date().getTime();//timestamp
                                    var tmpName=inputFile.originalFilename+tmpDate;
                                    //console.log(tmpName)
                                    var hashName=hash.hash('sha1',tmpName)+'.'+suffix;


                                    var dstPath =upload_dir + '/'+hashName;
//console.log(uploadedPath)
//console.log(dstPath)
                                    //重命名为真实文件名
                                    fs.rename(uploadedPath, dstPath, function (err) {
                                        if (err) {
                                            ue_result.state=uploadDefine.renameFail.error
                                            return  res.json(ue_result)
                                        } else {//rename done
                                            var data=new attachmentModel({name:inputFile.originalFilename,hashName:hashName,storePath:upload_dir,size:inputFile.size,cDate:new Date().toLocaleString(),mDate:new Date().toLocaleString()})
                                            data.validate(function(err){
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
                                            });

                                        }
                                    });
                                }else{
                                    ue_result.state=uploadDefine.validImageSuffix.error.msg
                                    return res.json(ue_result);

                                }

                            }
                        })
                    }
                } else {//set error msg(no need rc code) to modify angular fileList
                    //inputFile.msg = result.msg;
                    ue_result.state=result.msg
                    return res.json(ue_result);

                }

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
        return res.json(ue_config)
    }
}

router.use('/save',function(req,res,next){
    action[req.query.action](req,res,next)//for ueditor, both get and post use action to identify operation
    //action[req.body.action](req,res,next)
})

module.exports = router;
