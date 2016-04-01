/**
 * Created by wzhan039 on 2016-02-09.
 */


//内部设定，无法更改
var internalSetting={
    /*                         文档状态                         */
    state:['正在编辑','编辑完成'],
    /*                          默认文件夹                          */
    defaultRootFolderName:['我的文件夹','垃圾箱'],
   /*                      interval                            */
    sameRequestInterval:1000,//两次get/post之间的间隔ms
    differentRequestInterval:500,//get/post之间的间隔ms
    /*                      pagination                          */
    validPaginationString:['last','first'],//可用的页码字符（一般是数字，但有时可以是字符）

    pemPath:['g:/ss_express/ss-express/other/key/key.pem','h:/ss_express/ss-express/other/key/key.pem']
}

//可以更改的设定
//type:int 如果有max属性，说明可以修改（只要小于max）;否则不能修改
// path:folder;
// file
var defaultSetting= {
    //defaultRedirectURL:'http://127.0.0.1:3000/',
    inner_image: {
        //ueditor上传文件的路径。可以是目录或者软连接，但是必须放在project目录下，以便node读取
        uploadPath: {
            define: 'h:/ss_express/ss-express/',
            type: 'path',
            maxLength: 1024,
            client: {
                type: {rc: 60000, msg: '图片上传路径不存在'},
                maxLength: {rc: 60000, msg: '图片存储路径最多包含1024个字符'}
            }
        },
        maxWidth: {define:750, type:'int',max:'750'},//px。从tmall获得，使用Gm转换成对应的格式
        maxHeight:{define: 600,type:'int',max:'600'},//px。无所谓
        maxSize: {define: 900,type:'int',max:'900', client: {rc: 60001, msg: '图片大小不能超过900KB'}},//Ki(如果大于1M，gm返回的是1.1Mi）
        maxNum: {define: 5,type:'int',max:'5', client: {rc: 60002, msg: '最多插入5张图片'}}//最多插入图片数量
    },
    userIcon: {
        default: {define:'b10e366431927231a487f08d9d1aae67f1ec18b4.jpg',
            type:'file',
            minLength:44,
            maxLength:45,
            client: {
                type: {rc: 60010, msg: '默认头像文件不存在'},
                minLength: {rc: 60010, msg: '头像文件最少包含44个字符'},
                maxLength: {rc: 60010, msg: '头像文件最多包含45个字符'}
            }
        },
        uploadDir: {define: 'H:/ss_express/ss-express/user_icon/',
            type:'path',
            maxLength:1024,
            client: {
                type:{rc: 60010, msg: '头像上传失败，请联系管理员'},
                maxLength:{rc: 60010, msg:'头像存储路径最多包含1024个字符'}
            }
        },
        //只需要顶一个GM读取文件的大小，MultiParty的大小从这个值转换（通过generalFunction.parseGmFileSize和generalFunction.convertImageFileSizeToByte
        userIconMaxSizeGm: {define: '200Ki',type:'int',max:'200', client: {rc: 60011, msg: '上传文件超过限制，无法保存'}},//无单位（byte）/Ki/Mi（最多一位小数，因为gm读取的size就是如此）
        userIconWidth: {define: 104,type:'int'},//px
        userIconHeight: {define: 104,type:'int'}//px
    },
    article: {
        articleAuthorNum: {define:20,type:'int',max:20},//在session中记录用户打开的文档:作者 size，最大20.因为用户打开文档可以记录，但是关闭文档无法得知，所以如果打开太多文档，只能删除最长不使用文档
        maxKeyNum: {define: 5, type:'int',max:5,client: {rc: 60020, msg: '最多加入5个关键字'}},//每篇文档最大关键字数量
        commentPageSize: {define:5,type:'int'},//每页显示评论的数量
        commentPageLength: {define:2,type:'int'}//最多显示页数量
        //
    },
    articleFolder: {
        pageSize: {define:3,type:'int'},//在personalArticle中，每页显示的文档数
        pageLength: {define:5,type:'int'}//在personalArticle中，总共显示的页数
    },
    search: {
        /*                      search                              */
        maxKeyNum: {define: 5, type:'int',max:5,client: {rc: 60040, msg: '最多加入5个搜索关键字'}},       //搜索的时候，最多处理5个关键字
        totalKeyLen: {define: 20, type:'int',max:20,client: {rc: 60041, msg: '搜索关键字长度最多20个字符'}},   //搜索的时候，所有key长度不能超过20
        maxSearchResultNum: {define: 100, type:'int',max:100,client: {rc: 60042, msg: '最多显示100条搜索记录'}},//最多检索多少记录
        searchResultPageSize: {define:1,type:'int'},    //搜索结果页，每页显示10个记录
        searchResultPageLength: {define:10,type:'int'},  //每次搜索，最多显示10页
        showContentLength: {define: 100,type:'int',max:100, client: {rc: 60043, msg: '摘要超度最多100个字符'}}       //在搜索结果中，文档内容最多显示多少个字符
    },
    main: {
        latestArticleNum: {define:5,type:'int',max:5, client: {rc: 60050, msg: '首页最多显示5篇文档'}},//主页上显示的文档数量
        truncatePureContent: {define:200,type:'int',max:200,client: {rc: 60052, msg: '首页文档最多显示200个字符'}}//在主页上显示的文档内容长度
    },
    miscellaneous: {
        captchaExpire: {define:60,type:'int',max:60}//captcha超时删除(redis ttl 秒）

    },
    //ueUploadPath:'d:/',//ueditor上传文件的路径
    //captchaImg_path:['g:/ss_express/ss-express/captcha_Img','h:/ss_express/ss-express/captcha_Img'],

    attachment: {
        maxSize: {define: 5 * 1024 * 1024,type:'int',max:5 * 1024 * 1024, client: {rc: 60070, msg: '文件最大为5M'}},
        validSuffix: {
            define: {
                octer:{so:1, dll:1, bin:1, exe:1},
                ps: {psd:1},
                pdf: {pdf:1},
                text: {csv:1, txt:1, log:1, xml:1, html:1, css:1, js:1, json:1},
                msdoc: {doc:1, docx:1},
                msexcel: {xls:1, xlsx:1},
                msppt: {ppt:1, pptx:1},
                msoutlook: {msg:1},
                compress: {tar:1, tgz:1, gz:1, zip:1, rar:1, '7z':1},
                image: {jpg:1, jpeg:1, png:1, gif:1, bmp:1},
                video: {avi:1, rm:1, wav:1, swf:1, mpeg:1, moive:1, mp4:1, rmvb:1}
            },
            type:'object',
            client: {rc: 60071, msg: '文件类型不支持'}
        },
        validImageSuffix: {
            define: {'jpg':1, 'jpeg':1, 'png':1, 'gif':1, 'bmp':1},
            type:'object',
            client: {rc: 60072, msg: '只支持jpg/jpeg/gif/png格式的图片'}
        },
        maxAvaliableSpace: {define: 50 * 1024 * 1024,type:'int',max:50* 1024 * 1024, client: {rc: 60073, msg: '最多上传50M附件'}},//this is server side only
        maxUploadNum: {define: 5, type:'int',max:5,client: {rc: 60074, msg: "每次最多上传5个文件"}},
        maxTotalNum: {define: 5, type:'int',max:5,client: {rc: 60075, msg: "每个文档最多带有5个附件"}},
        //saveIntoDbFail:{define:'',client:{rc:419,client:'数据验证失败，无法保存到数据库'}},
        saveDir: {define: 'D:/',
            type:'path',
            maxLength:1024,
            client: {
                type:{rc: 60076, msg: '文件夹不存在，无法保存上传文件'},
                maxLength:{rc: 60076, msg: '文件夹最多包含1024个字符'}
            }
        },//disk path where to save file
        saveDirLength: {define: 1024,type:'path',maxLength:1024, client: {rc: 60078, msg: '绝对路径的长度不能超过1024个字符'}},//disk path where to save file
        fileNameLength: {define: 100, type:'file',maxLength:100,client: {rc: 60079, msg: "文件名最多包含100个字符"}}//考虑兼容windows的长度限制（路径+文件名<255），以便下载文件
    },

    adminLogin:{
        maxFailLoginTimes:{define:5,type:'int',max:10,client:{rc:60080,msg:`每天最多尝试${this.max}次`}},
        existFlagTTL:{define:300,type:'int',max:'600',client:{rc:60082,msg:'最长登录时间保持10分钟'}},
        namePasswordTTL:{define:300,type:'int',max:'600',client:{rc:60084,msg:'用户名密码最长保持10分钟'}},
    },
    interval:{
        intervalBetween2Req:{define:500,}
    }
}

exports.defaultSetting=defaultSetting
