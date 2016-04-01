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
    number:/^\d{1,}$/,
}

var LuaSHA={
    Lua_check_interval:'54adb0cea8db0cee96eefcaadb718b2dd834176f',
    adminLogin:{
        //adminLogin:'61031831d67275e2a2eef1e968049979cb4efbf1',
        adminLogin_saveUserPassword:'8e2a0849243d28a462c59ecbe088fbf2c842c475',
        adminLogin:'c380a515ef391d983ef7ea828441e59067f4c047',
        getAdminLoginState:'c8e27bf069908a8dbf2c74a19d49b445820fbc2e',
    },

}
exports.constantDefine={
    regex:pattern,
    LuaSHA:LuaSHA,
}