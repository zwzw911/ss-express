/**
 * Created by ada on 2015/7/4.
 */
/*
* Define the message to user when input not correct
* */

var registerLoginErrorMsg={
    name:{length:{rc:100,msg:'用户名由2到20个字符组成'}},
    password:{length:{rc:102,msg:'密码由2到20个字母、数字和特殊符号组成'}},
    repassword:{content:{rc:105,msg:'两次密码输入不一致'}},
    mobilePhone:{length:{rc:107,msg:'手机号由11位数字组成'}}
}


var articleErrorMsg={
    comment:{required:{rc:122,msg:'评论不能为空'},maxLength:{rc:120,msg:'最多输入255个字符'}}

}
exports.registerLoginErrorMsg=registerLoginErrorMsg;
exports.articleErrorMsg=articleErrorMsg;