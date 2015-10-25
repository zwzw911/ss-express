/**
 * Created by ada on 2015/10/25.
 */
var uploadDefine={
    maxFileSize:{define:5*1024*1024,error:{rc:413,msg:'文件最大为5M'}},
    validSuffix:{define:['exe','txt','pdf','zip','png'],error:{rc:414,msg:'文件类型不支持'}},
    validImageSuffix:{define:['jpg','jpge','gif','png'],error:{rc:418,msg:'只支持jpg/jpeg/gif/png格式的图片'}},
    renameFail:{define:'',error:{rc:415,msg:'保存文件失败'}},//this is server side only
    maxAvaliableSpace:{define:50*1024*1024,error:{rc:416,msg:'剩余空间容量不足'}},//this is server side only
    minUploadNum:{define:1,error:{rc:417,msg:'上传文件不能为空'}},
    saveIntoDbFail:{define:'',error:{rc:419,msg:'数据验证失败，无法保存到数据库'}},
    saveDir:{define:'/home/attachment/',error:{rc:421,msg:'文件夹不存在，无法保存上传文件'}},//disk path where to save file
    saveDirLength:{define:1024,error:{rc:423,msg:'绝对路径的长度不能超过1024个字符'}},//disk path where to save file
    fileNameLength:{define:100,error:{rc:425,msg:"文件名最多包含100个字符"}},//考虑兼容windows的长度限制（路径+文件名<255），以便下载文件
    hashNameMinLength:{define:44,error:{rc:427,msg:"hash名最多包含44个字符"}},//sha1+。+suffix
    hashNameMaxLength:{define:45,error:{rc:428,msg:"hash名最多包含45个字符"}}//sha1+。+suffix

}


exports.uploadDefine=uploadDefine;
