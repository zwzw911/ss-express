/**
 * Created by wzhan039 on 2016-04-08.
 * 对所有的inner image进行size检测，如果不合格，进行修复
 */
'use strict'
var image=require('../../routes/express_component/image').image
//var ioredisClient=require('../../routes/model/redis/redis_connections').ioredisClient
var runtimeRedisError=require('../../routes/error_define/runtime_redis_error').runtime_redis_error
var runtimeNodeError=require('../../routes/error_define/runtime_node_error').runtime_node_error
var dbOperation=require('../../routes/model/redis/CRUDGlobalSetting').globalSetting
var fs=require('fs')

function resizeImageInFolder(folder){
    dbOperation.getSingleSetting('inner_image','maxWidth',function(err,value){
    //ioredisClient.hget('inner_image','maxWidth',function(err,value){
    //    console.log(value)
        if(0<value.rc){
            return value
        }
        let maxWidth=parseInt(value.msg)
        fs.readdir(folder, function(err,files){
            if(err){
                return runtimeNodeError.fs.readDirFail
            }
            //console.log(files)
            for(let idx in files){
                image.getter.format(`${folder}${files[idx]}`,function(err,result){
                    if(err){
                        //continue
                    }else{
                        image.command.resizeWidthOnly(`${folder}${files[idx]}`,`${folder}${files[idx]}_bak`,maxWidth,function(err,result){
                            if(err){
                                throw err
                            }else{
                                fs.unlinkSync(`${folder}${files[idx]}`)
                                fs.rename(`${folder}${files[idx]}_bak`,`${folder}${files[idx]}`)
                            }

                        })
                    }
                })
            }

        })

    })

}


resizeImageInFolder('H:/ss_express/ss-express/inner_image/')