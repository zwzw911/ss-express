/**
 * Created by wzhan039 on 2016-03-21.
 * 启动serve前，先要做的检查
 * 1. 检查Lua脚本的SHA是否定义正确
 */
    'use strict'
var ioredis=require('ioredis')
var ioredisclient=new ioredis()
var fs=require('fs')
var LuaSHA=require('./../../routes/assist/globalConstantDefine').constantDefine.LuaSHA
var CRUDGlobalSetting=require('./../../routes/model/redis/CRUDGlobalSetting').globalSetting
//var intervalCheckBaseIPError=require('../../error_define/runtime_redis_error').runtime_redis_error.intervalCheckBaseIP
//var intervalCheckBaseIPNodeError=require('../../error_define/runtime_node_error').runtime_node_error.intervalCheckBaseIP

var SHAFileInFolder=function(folder){
    fs.readdir(folder,function(err,files){
        if(err){
            console.log(err)
        }else{

            for(let fileName of files){
                //console.log(`${folder}${fileName}`)
                if(fs.statSync(`${folder}/${fileName}`).isDirectory()){
                    SHAFileInFolder(`${folder}/${fileName}`)
                }
                if(fs.statSync(`${folder}/${fileName}`).isFile()){
                    fs.readFile(`${folder}/${fileName}`,'utf8',function(err,result){
                        ioredisclient.script('load',result,function(err,sha){
                            console.log(`INF:${folder}/${fileName}'s sha is ${sha}`)

                            let fileNameNoSuffix=fileName.split('.')[0]
                            //console.log(`${folder}`)
                            let subDir=folder.split('//')[1]
                            let definedSHA
                            if(undefined===subDir){
                                definedSHA=LuaSHA[fileNameNoSuffix]
                            }else{
                                definedSHA=LuaSHA[subDir][fileNameNoSuffix]
                            }
                            if(sha===definedSHA){
                                console.log(`INF:${folder}/${fileName}'s sha is correct`)
                            }else{
                                console.log(`ERR:${folder}/${fileName}'s sha is incorrect`)
                            }
                        })
                    })
                }

            }

        }
    })
}
CRUDGlobalSetting.getSingleSetting('Lua','scriptPath',function(err,directory){
    if(0<directory.rc){
        console.log(directory)
    }
    //var fileName='Lua_check_interval.lua'
    let folder=directory.msg
    SHAFileInFolder(folder)
})

/*fs.readFile(`${directory}${fileName}`,'utf8',function(err,result){
    /!*    console.log(err)
     console.log(result)*!/
    ioredisclient.script('load',result,function(err,sha){
        console.log(`${fileName}'s sha is ${sha}`)
        if(sha===LuaSHA.checkIntervalBasedIP){
            console.log(`${fileName}'s sha is correct`)
        }else{
            console.log(`${fileName}'s sha is incorrect`)
        }
    })


})*/
