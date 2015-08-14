/**
 * Created by ada on 2015/7/31.
 */
    /*
    * 以下错误在Nodejs中运行产生
    * */
var articleError={
    hashIDFormatWrong:{define:'',error:{rc:500,msg:'文档编号不正确'}},
    notExist:{define:'',error:{rc:502,msg:'文档不存在'}},
    duplicateArticle:{define:'',error:{rc:504,msg:'文档重复'}},
    filedOfContentNotExist:{define:'',error:{rc:506,msg:'更新失败，未知字段'}}


}

var userError={
    userExist:{define:'',error:{rc:600,msg:'用户已存在'}},
    userNotLogin:{define:'',error:{rc:602,msg:"用户尚未登录，无法操作"}}
}
exports.articleError=articleError
exports.userError=userError