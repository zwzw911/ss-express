/**
 * Created by zw on 2015/11/7.
 */
var gm=require('gm')
var fs=require('fs')
var general=require('../assist/general').general

var validateImage=['PNG','JPEG','IPG','GIF']
/*              错误定义            */
var imageErrorDefine={
    size:{rc:50000,msg:'读取图片长宽大小失败'},
    orientation:{rc:50002,msg:'读取图片方向失败'},
    format:{rc:50004,msg:'读取图片格式失败'},
    invalidateFormat:{rc:50005,msg:'图片格式不支持'},
    depth:{rc:50006,msg:'读取图片颜色深度失败'},
    color:{rc:50008,msg:'读取图片颜色数量失败'},
    res:{rc:50010,msg:'读取图片解析度失败'},
    fileSize:{rc:50012,msg:'读取图片大小失败'},
    identify:{rc:50014,msg:'读取图片信息失败'},
    /*                   方法                           */
    resize:{rc:50020,msg:"更改图片大小失败"}
}

var getterFunc=function(filePath,method,callback){
    gm(filePath)[method](function(err,result){
        if(err){
            return callback(err,imageErrorDefine[method])
        }
        return callback(null,{rc:0,msg:result})
    })
}
var size=function(filePath,callback){
    getterFunc(filePath,'size',function(err,result){
        //将getterFunc的结果原样传出
        return callback(err,result)
    })
}
var orientation=function(filePath,callback){
    getterFunc(filePath,'orientation',function(err,result){
        return callback(err,result)
    })
}
var format=function(filePath,callback){
    getterFunc(filePath,'format',function(err,result){
        if(err){
            return callback(err,result)
        }
        if(undefined===result.msg){
            return callback(null,imageErrorDefine.invalidateFormat)
        }
    })
}
var depth=function(filePath,callback){
    getterFunc(filePath,'depth',function(err,result){
        return callback(err,result)
    })
}
var color=function(filePath,callback){
    getterFunc(filePath,'color',function(err,result){
        return callback(err,result)
    })
}
var res=function(filePath,callback){
    getterFunc(filePath,'res',function(err,result){
        return callback(err,result)
    })
}
var fileSize=function(filePath,callback){
    getterFunc(filePath,'filesize',function(err,result){
        return callback(err,result)
    })
}
var identify=function(filePath,callback){
    getterFunc(filePath,'identify',function(err,result){
        return callback(err,result)
    })
}

/*              方法                  */
var resize=function(inputFilePath,outputFilePath,callback){
    //只对宽度做处理，并且如果宽度小于general.innerImageMaxWidth，则不处理
    gm(inputFilePath).resizeExact(general.innerImageMaxWidth,'>').write(outputFilePath,function(err,result){
        if(err){
            return callback(err,imageErrorDefine.resize)
        }
        return callback(null,{rc:0})
    })
}

exports.image={
    getter:{
        size:size,//width,height
        orientation:orientation,//TopLeft
        format:format,//PNG,JPEG,GIF,undefined
        depth:depth,//8 or 16,一般都是8
        color:color,
        res:res,//72x72 pixels/inch    37.79x37.79 pixels/centimeter
        fileSize:fileSize,//Ki,Mi,Gi
        identify:identify
    },
    command:{
        resize:resize
    }
}