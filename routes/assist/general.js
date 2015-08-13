/**
 * Created by wzhan039 on 2015-07-21.
 */
var general={
    host:'http://localhost:3000',
    rootPath:'G:/ss_express/ss-express',
    captchaImg_path:'G:/ss_express/ss-express/captcha_Img',
    articleAuthorSize:20//在session中记录用户打开的文档:作者 size，最大20.因为用户打开文档可以记录，但是关闭文档无法得知，所以如果打开太多文档，只能删除最长不使用文档
}
exports.general=general