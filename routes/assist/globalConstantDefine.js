/**
 * Created by wzhan039 on 2016-02-26.
 * a所有常量定义
 */
var pattern={
    singleSpecialChar:/^[A-Za-z0-9\~\\!\@\#\$\%\^\&\*\)\(\_\+\=\-\`\}\{\:\"\|\?\>\<\,\./;'\\\[\]]$/,
    email:/(\w+\.)*\w+@(\w+\.)+[A-Za-z]+/,
    ip:/(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))/,
    sha1Hash:/^[0-9a-f]{40}$/,
    objectId:/^[0-9a-f]{24}$/,//mongodb objectid
    userName:/^[\u4E00-\u9FFF\w]{2,20}$/,
    strictPassword:/^(?=.*[0-9])(?=.*[A-Za-z])(?=.*[\~\\!\@\#\$\%\^\&\*\)\(\_\+\=\-\`\}\{\:\"\|\?><\,\./;'\\\[\]])[A-Za-z0-9\~\\!\@\#\$\%\^\&\*\)\(\_\+\=\-\`\}\{\:\"\|\?><\,\./;'\\\[\]]{6,20}$/,//字母数字，特殊符号
    //loosePassword:/^(?=.*[0-9])(?=.*[A-Za-z])[A-Za-z0-9]{2,20}$/,//宽松密码设置，字母数字
    loosePassword:/^[A-Za-z0-9]{2,20}$/,//宽松密码设置，字母数字
    encryptedPassword:/^[0-9a-f]{40}$/,
    mobilePhone:/^\d{11,13}$/,
    hashImageName:/[0-9a-f]{40}\.[jpg|jpeg|png]/,
    folderName:/^[\u4E00-\u9FFF\w]{1,255}$/,
    keyName:/^[\u4E00-\u9FFF\w]{2,20}$/,//查询关键字，中文，英文
    pageNum:/\d{1,4}/,
    hashName:/[0-9a-f]{40}\.\w{3,4}/, //hash名+后缀
    captcha:/^[a-zA-Z0-9]{4}$/,
    hashedThumbnail:/^[0-9a-f]{40}\.[jpg|jpeg|png]$/,
    originalThumbnail:/^[\u4E00-\u9FFF\w]{2,20}\.[jpg|jpeg|png]$/,
}

exports.constantDefine={
    regex:pattern
}