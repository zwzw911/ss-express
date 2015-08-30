
/**
 * Created by wzhan039 on 2015-07-21.
 */
var general={
    host:'http://localhost:3000',
    rootPath:'h:/ss_express/ss-express',
    captchaImg_path:'h:/ss_express/ss-express/captcha_Img',
    defaultUserIcon:'b10e366431927231a487f08d9d1aae67f1ec18b4.jpg',
    articleAuthorSize:20,//在session中记录用户打开的文档:作者 size，最大20.因为用户打开文档可以记录，但是关闭文档无法得知，所以如果打开太多文档，只能删除最长不使用文档
    commentPageSize:3,
    commentPageLength:2,
    /*                          folder                          */
    defaultRootFolderName:['我的文件夹','垃圾箱'],
    /*                      articleFolder                       */
    articleFolderPageSize:3,
    articleFolderPageLength:5,
    /*                      interval                            */
    sameRequestInterval:5000,//两次get/post之间的间隔
    differentRequestInterval:5000//get/post之间的间隔

}
exports.general=general