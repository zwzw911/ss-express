
/**
 * Created by wzhan039 on 2015-07-21.
 */
var general={
    host:'http://localhost:3000',
    rootPath:'g:/ss_express/ss-express',
    captchaImg_path:'g:/ss_express/ss-express/captcha_Img',
    defaultUserIcon:'b10e366431927231a487f08d9d1aae67f1ec18b4.jpg',
    articleAuthorSize:20,//在session中记录用户打开的文档:作者 size，最大20.因为用户打开文档可以记录，但是关闭文档无法得知，所以如果打开太多文档，只能删除最长不使用文档
    commentPageSize:3,
    commentPageLength:2
}
exports.general=general