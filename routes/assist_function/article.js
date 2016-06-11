/**
 * Created by ada on 2015/8/5.
 */
    'use strict'
var uploadDefine=require('../assist/upload_define').uploadDefine
var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error
//var mimes=require('../assist/mime').mimes
var suffixDefine=require('../assist/mime').validSuffix
var mime=require('mime')
var fs = require('fs');
var image=require('../express_component/image').image
var enumVar=require('../assist/general').enumVar

//var image=require('../express_component/image').image
//var ioredisClient=require('../model/redis/redis_connections').ioredisClient
var runtimeRedisError=require('../error_define/runtime_redis_error').runtime_redis_error
var dbOperation=require('../model/redis/CRUDGlobalSetting').globalSetting
//var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error
//var fs=require('fs')
//type:attachment/inner_image
var checkSpaceValid=function(type){
	switch(type){
        case enumVar.uploadType.attachment:
            break;
        case enumVar.uploadType.inner_image:
            break;
        default:
    }
}
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
        var mimeType=file['headers']['content-type'].replace(/^(\")|(\"$)/g,'');//pdf会返回"application/pdf",而不是application/pdf,所以需要去掉"
        var suffix=tmp.pop();
        return checkFileFormat(suffix,mimeType)
    }

}

//check if suffix and mime match, and is valid in definetion
var checkFileFormat=function(suffix, mimeType){
    var matchedSuffix=mime.extension(mimeType);
    //check if valid in node-mime definition(suffix in matchedSuffix)
    if(-1===matchedSuffix.indexOf(suffix)){
        return uploadDefine.validSuffix.error
    }
    //further check if this suffix is allow(server allow)
    for (var t in suffixDefine){
        if(suffixDefine[t].indexOf(suffix)>0){
            return true
        }
    }
    return uploadDefine.validSuffix.error
}
//其他检查需要通过checkFile来完成
//检查后缀和MIME，然后检查前2byte
//使用gm直接完成图片检查
var checkImgFile=function(filePath,callback) {
    image.getter.format(filePath,function(err,result){
        //if(0<result.rc){
            return callback(err,result)
        //}
    })
   /* fs.open(filePath, 'r', function (err, fd) {
        if (err) {
            return callback(err, runtimeNodeError.article.openFileFail)
        }
        var buffer = new Buffer(2);
        fs.read(fd, buffer, 0, 2, 0, function (err, bytesRead, buffer) {
            if (err) {
                return callback(err, runtimeNodeError.article.readFileFail)
            }
            var bytes = buffer.toString('hex');
            //console.log(bytes);
            switch (bytes) {
                case '8950'://png  35152 or 0x8950
                    callback(null, {rc: 0});
                    break;
                case 'ffd8'://ipeg 65496 or 0x ffd8, case sensetive
//console.log(buffer);
                    callback(null, {rc: 0});
                    break;
                case '4749':// gif 4749 or 18249
                    callback(null, {rc: 0});
                    break;
                default :
//console.log('fas;le')
                    callback(err, runtimeNodeError.article.invalidateImageType);
            }
        })
    })*/
}
    /*async.waterfall([
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
        })*/



//检查数据库/磁盘上的文件是否存在上传的richText中（img src）；不存在，删除
//对应用户在ueditor中添加了一个图片，但是过后又删除了
//1. 从数据库中读取文档对应的文件
//2。从rich txt中的img src中获得文件
//3. 遍历1中的文件，是不是存在2中，不存在就从 disk和db中删除
var sanityImgInText=function(str){
    var imgSrc=regex.check(str,'imgSrc');
}


/*
* read article content from db(by populate). Populate contain _id, sometime _id no need to transfer to client,so use eliminateId to del _id
* */
var eliminateArrayId=function(arr){
    if(arr.length>0){
        for(var i=0;i<arr.length;i++){
            if(undefined!==arr[i]._id && null!==arr[i]._id){arr[i]._id=undefined} //关键子的id也无需发送
            if(undefined!==arr[i].id && null!==arr[i].id){arr[i].id=undefined}//.toObjext()会复制_id到id
        }
    }
}

var eliminateObjectId=function(obj){

    obj._id=undefined//关键子的id也无需发送
    obj.id=undefined//.toObjext()会复制_id到id


}



function resizeSingleImage(inputFilePath,outFilePath,cb){
    dbOperation.getSingleSetting('inner_image','maxWidth',function(err,value){
        //ioredisClient.hget('inner_image','maxWidth',function(err,value){
        //    console.log(value)
        if(0<value.rc){
            return value
        }
        let maxWidth=parseInt(value.msg)
        if(err){
            return cb(null,runtimeRedisError.globalSetting.hgetFail)
        }
        //console.log(`width is ${value}`)
        image.command.resizeWidthOnly(inputFilePath,outFilePath,maxWidth,function(err,result){

            return cb(null,result)
        })
    })

}
exports.assistFunc={
    checkFile:checkFile,
    checkImgFile:checkImgFile,
    sanityImgInText:sanityImgInText,
    eliminateArrayId:eliminateArrayId,
    eliminateObjectId:eliminateObjectId,
    resizeSingleImage:resizeSingleImage,
    };
