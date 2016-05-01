/**
 * Created by wzhan039 on 2016-04-22.
 * 使用multiparty获得返回的文件信息
 */
'use strict'
var multiparty = require('multiparty');
var misc=require('../assist_function/miscellaneous').func;

var Upload={
    Create:function(option){
        //必须是var，否则无法返回
        var upload={};
        upload.option=option
        upload.error={
            parameterNotDefine:function(parameter){
                return {rc:10000,msg:`参数${parameter}没有定义`}
            },
            uploadFolderNotExist:function(uploadFolder){
                return {rc:10002,msg:`上传目录${uploadFolder}不存在`}
            },
            maxSizeNotInt:function(maxSize){
                return {rc:10004,msg:`文件最大尺寸${maxSize}不是整数`}
            },
            maxSizeNotPositive:function(maxSize){
                return {rc:10006,msg:`文件最大尺寸${maxSize}不是正数`}
            },
            maxFileNumNotInt:function(maxFileNum){
                return {rc:10008,msg:`最大上传文件数量${maxFileNum}不是整数`}
            },
            maxFileNumNotPositive:function(maxFileNum){
                return {rc:10010,msg:`最大上传文件数量${maxFileNum}不是正数`}
            },
            exceedMaxFileSize:function(){
                return {rc:10012,msg:`上传文件尺寸超过最大定义`}
            },
            uploadedFileUndefined:function(){
                return {rc:10013,msg:`上传文件数量为空`}
            },
            uploadedFileNumIsZero:function(){
                return {rc:10014,msg:`上传文件数量为0`}
            },

        };

        upload.init=function(){
            let option=upload.option
            //name,path,maxSize,maxFileNum(上传文件数组名，上传路径，文件最大size，最大上传文件个数)
            let needParamName=['name','uploadFolder','maxSize','maxFileNum']
        //    1. 必须参数是否传入
            for(let idx in needParamName){
                if(true===misc.isEmpty(option[needParamName[idx]])){
                    return upload.error.parameterNotDefine(option[needParamName[idx]])
                }
            }
        //    2 检测上传目录是否存在
            let value=option['uploadFolder'];
            if(false===misc.isFolder(value)){
                return upload.error.uploadFolderNotExist(value)
            };
        //    3 检查maxSize是否为整数
            value=option['maxSize']
            if ( false===misc.isInt(value) ) {
                return upload.error.maxSizeNotInt(value)
            }
        //    4 maxSize是否为正数
            if(false===misc.isPositive(value)){
                return upload.error.maxSizeNotPositive(value)
            }
        //    5 maxFileNum是否为整数
            value=option['maxFileNum']
            if(false===misc.isInt(value)){
                return upload.error.maxFileNumNotInt(value)
            }
            //    6 maxFileNum是否为正数
            if(false===misc.isPositive(value)){
                return upload.error.maxFileNumNotPositive(value)
            }

            //upload.option=option
        },

        upload.info=function(req,cb){
//console.log(upload.option)
            let mpOption={
                uploadDir:upload.option['uploadFolder'] ,
                maxFilesSize:upload.option['maxSize']
            }
 //console.log(mpOption)
            let form = new multiparty.Form(mpOption);
            form.parse(req, function (err, fields, files) {
                var filesTmp = JSON.stringify(files, null, 2);
                var fieldsTemp = JSON.stringify(fields, null, 2);

// console.log(err)
                if (err) {
                    switch (err.status) {
                        case 413:
                            cb(null, upload.error.exceedMaxFileSize())
                            break
                    }
                }

                if(undefined===files[upload.option['name']] || null===files[upload.option['name']]){
                    cb(null, upload.error.uploadedFileUndefined())
                }
//console.log(1);
                //importSetting: input的name
                /*        { fieldName: 'importSetting',
                 originalFilename: 'setting.txt',
                 path: 'h:\\ss_express\\ss-express\\10sGCLLA32u1enHWlf7eV_9T.txt',
                 headers:
                 { 'content-disposition': 'form-data; name="importSetting"; filename="setting.txt"',
                 'content-type': 'text/plain' },
                 size: 1716 }*/
                if (0 === files[upload.option['name']].length) {
                    cb(null, upload.error.uploadedFileNumIsZero())
                }
//console.log(files);
//console.log(files[upload.option['name']])
//                return {rc:0,msg:files[upload.option['name']]}
                cb(null,{rc:0,msg:files[upload.option['name']]})
//console.log('end')
            })
        }
        return upload
    }
}
exports.Upload=Upload;