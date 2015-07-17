/**
 * Created by wzhan039 on 2015-07-14.
 * Define upload related error
 */

var uploadDefine={
    maxFileSize:{define:5*1024*1024,error:{rc:413,msg:'文件最大为5M'}},
    fileNameLength:{define:255,error:{rc:202,msg:"文件名最多包含255个字符"}},
    validSuffix:{define:['exe','txt','pdf','zip','png'],error:{rc:414,msg:'文件类型不支持'}},
    validImageSuffix:{define:['jpg','jpge','gif','png'],error:{rc:418,msg:'只支持jpg/jpeg/gif/png格式的图片'}},
    renameFail:{define:'',error:{rc:415,msg:'保存文件失败'}},//this is server side only
    maxAvaliableSpace:{define:50*1024*1024,error:{rc:416,msg:'剩余空间容量不足'}},//this is server side only
    minUploadNum:{define:1,error:{rc:417,msg:'上传文件不能为空'}},
    saveIntoDbFail:{define:'',error:{rc:419,msg:'数据验证失败，无法保存到数据库'}},
    saveDir:{define:'D:/',error:{rc:421,msg:'文件夹不存在，无法保存上传文件'}}//disk path where to save file
}


exports.uploadDefine=uploadDefine;

