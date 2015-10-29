
/**
 * Created by wzhan039 on 2015-07-21.
 */
var general={
    host:'http://127.0.0.1:3000',
    ueUploadPath:'g:/ss_express/ss-express',//ueditor上传文件的路径。可以是目录或者软连接，但是必须放在project目录下，以便node读取
    //ueUploadPath:'d:/',//ueditor上传文件的路径
    captchaImg_path:['g:/ss_express/ss-express/captcha_Img','h:/ss_express/ss-express/captcha_Img'],
    captchaExpire:60000,//captcha超时删除(毫秒）

	pemPath:['g:/ss_express/ss-express/other/key/key.pem','h:/ss_express/ss-express/other/key/key.pem'],
    defaultUserIcon:'b10e366431927231a487f08d9d1aae67f1ec18b4.jpg',
    /*                          article                         */
    articleAuthorSize:20,//在session中记录用户打开的文档:作者 size，最大20.因为用户打开文档可以记录，但是关闭文档无法得知，所以如果打开太多文档，只能删除最长不使用文档
    //maxKeyNum:{define:5,client:{rc:50002,msg:'每篇文档最多5个关键字'}},//每篇文档最大关键字数量
    maxKeyNum:5,//每篇文档最大关键字数量
    commentPageSize:5,
    commentPageLength:2,
    state:['正在编辑','编辑完成'],
    /*                          folder                          */
    defaultRootFolderName:['我的文件夹','垃圾箱'],
    /*                      articleFolder                       */
    articleFolderPageSize:3,//在personalArticle中，每页显示的文档数
    articleFolderPageLength:5,//在personalArticle中，总共显示的页数
    /*                      interval                            */
    sameRequestInterval:1000,//两次get/post之间的间隔ms
    differentRequestInterval:500,//get/post之间的间隔ms
    /*                      pagination                          */
    validPaginationString:['last','first'],//可用的页码字符（一般是数字，但有时可以是字符）
    /*                      search                              */
    searchMaxKeyNum:5,       //搜索胡时候，最多处理5个关键字
    searchTotalKeyLen:20,   //搜索的时候，所有key长度不能超过20
    searchResultPageSize:1,    //搜索结果页，每页显示10个记录
    searchResultPageLength:10,  //每次搜索，最多显示10页
    showContentLength:100,       //在搜索结果中，文档内容最多显示多少个字符
    /*                      main                              */
    latestArticleNum:2,
    truncatePureContent:200 //在主页上显示的文档内容长度
}
exports.general=general