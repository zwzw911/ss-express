/**
 * Created by wzhan039 on 2015-07-14.
 * Define upload related error
 */

var uploadDefine={
    maxFileSize:{define:8*1024*1024,error:{rc:413,msg:'文件最大为5M'}},
    fileNameLength:{define:255,error:{rc:202,msg:"文件名最多包含255个字符"}}
}


exports.uploadDefine=uploadDefine;

