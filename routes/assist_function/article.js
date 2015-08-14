/**
 * Created by ada on 2015/8/5.
 */
var uploadDefine=require('../assist/upload_define').uploadDefine
var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error

var fs = require('fs');
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
var checkImgFile=function(filePath,callback) {
    fs.open(filePath, 'r', function (err, result) {
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
    })
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
var eliminateId=function(arr){
    if(arr.length>0){
        for(var i=0;i<arr.length;i++){
            arr[i]._id=undefined//关键子的id也无需发送
        }
    }
}




exports.assistFunc={
    checkFile:checkFile,
    checkImgFile:checkImgFile,
    sanityImgInText:sanityImgInText,
    eliminateId:eliminateId
    };
