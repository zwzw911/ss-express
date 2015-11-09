/**
 * Created by zw on 2015/11/8.
 */
var express = require('express');
var router = express.Router();
var generalFunc=require('./express_component/generalFunction').generateFunction
var general=require('./assist/general').general
var runtimeNodeError=require('./error_define/runtime_node_error').runtime_node_error
var fs=require('fs')

var multiparty = require('multiparty');
var global=require('./error_define/global').global
var image=require('./express_component/image').image
var hash=require('./express_component/hashCrypt');
var async=require('async');

router.get('/',function(req,res,next){
    if(undefined===req.session.state){req.session.state=2}
    var preResult=generalFunc.preCheck(req,false)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    res.render('userIcon',{title:'首页',year:new Date().getFullYear()});
})

router.post('/userIcon/upload',function(res,req,next){
    console.log('/userIcon/upload')
})

router.post('/upload',function(req,res,next){
    //console.log('upload')
    var form = new multiparty.Form({uploadDir:global.userIconUploadDir.define ,maxFilesSize:global.userIconMaxSizeMultiParty.define});
    //console.log(form)
    form.parse(req, function (err, fields, files) {
        if(err){
            return res.json(global.userIconMaxSizeMultiParty.client)
        }
/*        var filesTmp = JSON.stringify(files, null, 2);
        var fieldsTemp = JSON.stringify(fields, null, 2);*/
/*        { file:
            [ { fieldName: 'file',
                originalFilename: 'u=2244034692,69211326&fm=21&gp=0.jpeg',
                path: 'H:\\ss_express\\ss-express\\user_icon\\QYVcf25STFFfUGjx0wwjtJJE.jpeg',
                headers: [Object],
                size: 1802 } ] }*/
//console.log(files)
        var file=files.file[0]
        //var suffix=file.originalFilename.split('.').pop()
        var filePath=file.path
        async.waterfall([
            //1. 使用image。format获得文件类型
            function(callback){
//console.log(filePath)
                image.getter.format(filePath,function(err,fileTypeResult){
                    if(err){
                        callback(err,fileTypeResult)
                    }
                    if(fileTypeResult.rc>0){
                        //通过传入空对象，触发err
                        callback({},fileTypeResult)
                    }
                    //返回结果给下一个函数
                    callback(null, fileTypeResult)
                })
            },
            //2. 检查文件的大小（不得超过1M）
            function(fileTypeResult,callback){
                image.getter.fileSize(filePath,function(err,fileSizeResult){
                    if(err){
                        callback(err,fileSizeResult)
                    }
                    if(fileSizeResult.rc>0){
                        //通过传入空对象，触发err
                        callback({},fileSizeResult)
                    }
/*console.log(result)
console.log(result1)*/
                    var p=/(\d{1,}\.?\d{1,})([KkMmGg]i)?/ //1.8Ki
                    var fileSize=fileSizeResult.msg.match(p)
                        //[ '1.812ki', '1.812', 'ki', index: 0, input: '1.812ki' ]
                    //unit可能为空，因为文件小于1k
                    if(fileSize[0]!==fileSizeResult.msg || undefined===fileSize[1]){
                        callback({},runtimeNodeError.image.cantMatchFileSize)
                    }
                    var fileSizeNum=parseFloat(fileSize[1])
                    if(isNaN(fileSizeNum)){
                        callback({},runtimeNodeError.image.cantParseFileSizeNum)
                    }
                    var fileSizeUnit=fileSize[2]
                    if('Mi'==fileSizeUnit || 'Gi'==fileSize || fileSizeNum>global.userIconMaxSizeGm.define){
                        callback({},global.userIconMaxSizeGm.client)
                    }
                    callback(null,fileTypeResult,file)
                })

            },

            //3. 检测文件的width，符合的话，直接rename，否则通过resize后rename
            function(fileTypeResult,callback){
                image.getter.size(filePath,function(err,fileWHResult){
                    if(err){
                        callback(err,fileWHResult)
                    }
                    if(fileWHResult.rc>0){
                        //通过传入空对象，触发err
                        callback({},fileWHResult)
                    }
                    //生成hash名
                    var fileType=fileTypeResult.msg.toLowerCase();
                    var hashName=hash.hash(file.originalFilename+new Date().getTime(),'sha1')
                    //if(fileWHResult.msg.width>global.userIconWidth || fileWHResult.msg.height>global.userIconHeight){
                    //console.log(filePath)
                    //console.log(global.userIconUploadDir.define+hashName+'.'+fileType)
                        image.command.resizeUserIcon(filePath,global.userIconUploadDir.define+hashName+'.'+fileType,global.userIconWidth.define,global.userIconHeight.define,function(err,result){
                            if(err){
console.log(err)
                                callback(err,result)
                            }
console.log(result)
                            callback(null,result)
                        })
                    //}
                })

            }
        ],function(err,result){
            fs.unlinkSync(filePath)
        })
        //if()

        //console.log(filesTmp)
 /*       image.command.resize(filePath,global.userIconUploadDir,function(err,result){
            return res.json(result)
        })*/

    })
})
module.exports = router;