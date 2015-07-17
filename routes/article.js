/**
 * Created by wzhan039 on 2015-07-08.
 */
var express = require('express');
var router = express.Router();

var fsErrorMsg=require('./assist/fs_error').fsErrorMsg;
var uploadDefine=require('./assist/upload_define').uploadDefine;

var mimes=require('./assist/mime').mimes;
var multiparty = require('multiparty');
var fs = require('fs');

var async=require('async');
var hash=require('../public/javascripts/express_component/hashCrypt');


var attachmentModel=require('../public/javascripts/model/db_structure').attachment;
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
//console.log(buffer);
                var bytes=buffer.toString('hex');
                switch (bytes){
                    case '8950'://png  35152 or 0x8950
                        callback(null,true);
                        break;
                    case 'FFD8'://ipeg 65496 or 0x FFD8
                        callback(null,true);
                        break;
                    case '4749':// gif 4749 or 18249
                        callback(null,true);
                        break;
                    default :
                        callback(err,false);

                }
            }
        })

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
router.get('/',function(req,res,next){
    if(undefined===req.session.state){req.session.state=2}

    res.render('main_test');
})

router.get('/download?file=:name',function(req,res,next){
    if(undefined===req.session.state){req.session.state=2}
    console.log(req.query.file)
    if(fs.existsSync(req.query.file)){
        var options = {
            root:uploadDefine.saveDir,
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };
        res.sendfile('d86cbf3f5c5d5c43f30d26b4ad18a8df256dee18.png',options,function(err){

        })
    }
    res.render('main_test');
})
/*router.post('/',function(req,res,next){
    if(undefined===req.session.state || (1!=req.session.state && 2!=req.session.state)){
        res.json({rc:2,msg:'请重新载入页面'});
        return;
    }
    var result={
        lastWeekCollect:{},
        lastWeekClick:{},
        latestArticle:{}
    };
    res.render('main');
})*/
module.exports = router;
