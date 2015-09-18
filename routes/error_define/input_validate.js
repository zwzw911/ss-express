/**
 * Created by ada on 2015/8/9.
 */
var regex={
    sha1Hash:/[0-9a-f]{40}/,
    objectId:/[0-9a-f]{24}/,
    userName:/^[\u4E00-\u9FFF\w]{2,20}$/,
    password:/^[A-Za-z0-9\~\\!\@\#\$\%\^\&\*\)\(\_\+\=\-\`\}\{\:\"\|\?\>\<\,\./;'\\\[\]]{2,20}$/,
    mobilePhone:/\d{11,13}/,
    thumbnail:/[0-9a-f]{40}\.[jpg|jpeg|png]/,
    folderName:/^[\u4E00-\u9FFF\w]{1,255}$/,
    keyName:/^[\u4E00-\u9FFF\w]{2,20}$/,//
    pageNum:/\d{1,4}/,
    hashName:/[0-9a-f]{40}\.\w{3,4}/ //hash名+后缀
}

//require是用来返回更明确的信息到客户端,并且在mongoose进行验证时,是否需要调用type
//type:正则一次验证,可能返回的信息不够完整
//validateError说明在mongoose验证时候出现的失败(只是为了说明出现地点)
var input_validate={
    user:{
        _id:{
            type:{define:regex.objectId,client:{rc:10000,msg:'用户名编号格式不正确'},server:{rc:20000,msg:'用户名编号格式不正确'}},
            validateError:{define:regex.objectId,client:undefined,server:{rc:20001,msg:'用户名编号验证失败'}}
        },
        name:{
            require:{define:true,client:{rc:10002,msg:'用户名不能为空'},server:{rc:20002,msg:'用户名为空'}},
            type:{define:regex.userName,client:{rc:10004,msg:'用户名由2-20个字符组成'},server:{rc:20004,msg:'用户名格式不正确'}},
            validateError:{define:undefined,client:undefined,server:{rc:20005,msg:'用户名验证失败'}}
        },
        password:{
            require:{define:true,client:{rc:10006,msg:'密码不能为空'},server:{rc:20006,msg:'密码为空'}},
            //minLength:{define:2,client:{rc:10008,msg:'密码至少包含2个字符'},server:undefined}, //实际存入db为hash过的字符，永远是40
            //maxLength:{define:20,client:{rc:10010,msg:'密码最多包含20个字符'},server:undefined},
            type:{define:regex.pageNum,client:{rc:10008,msg:'密码由字母,数字,特殊字符组成,长度2-20个字符'},server:{rc:20008,msg:'密码格式不正确'}},
            hashLength:{define:40,client:undefined,server:{rc:20012,msg:'哈希密码长度为40个字符'}},
            validateError:{define:undefined,client:undefined,server:{rc:20013,msg:'用户密码验证失败'}}
        },
        mobilePhone:{
            require:{define:false},
            //minLength:{define:11, client:{rc:10014,msg:'手机号至少包含11位数字'},server:{rc:20014,msg:'手机号少于11位数字'}},
            //maxLength:{define:13, client:{rc:10016,msg:'手机号最多包含13位数字'},server:{rc:20016,msg:'手机号多余13位数字'}},
            type:{define:regex.mobilePhone,client:{rc:10018,msg:'手机号由11-13个数字组成'},server:{rc:20018,msg:'手机号格式不正确'}},
            validateError:{define:undefined,client:undefined,server:{rc:20019,msg:'用户手机验证失败'}}
        },
        thumbnail:{
            require:{define:false},
            //minLength:{define:44,client:undefined,server:{rc:20020,msg:'用户头像文件名长度少于44个字符'}},//hash后加上扩张名的长度
            //maxLength:{define:45,client:undefined,server:{rc:20022,msg:'用户头像文件名长度大于45个字符'}},
            type:{define:regex.thumbnail,client:{rc:10020,msg:'用户头像的图片名格式不正确'},server:{rc:20020,msg:'用户头像的图片名格式不正确'}},
            suffix:{define:['jpeg','jpg','png'],client:{rc:10024,msg:'头像文件只能是jpg/jpeg/png文件'},server:{rc:20024,msg:'头像文件不是jpg/jpeg/png文件'}},
            validateError:{define:undefined,client:undefined,server:{rc:20025,msg:'用户头像失败'}}
        },
        oldPassword:{
            require:{define:true,client:{rc:10026,msg:'旧密码不能为空'},server:{rc:20026,msg:'旧密码为空'}},
            //minLength:{define:2,client:{rc:10008,msg:'密码至少包含2个字符'},server:undefined}, //实际存入db为hash过的字符，永远是40
            //maxLength:{define:20,client:{rc:10010,msg:'密码最多包含20个字符'},server:undefined},
            type:{define:regex.pageNum,client:{rc:10028,msg:'密码由字母,数字,特殊字符组成,长度2-20个字符'},server:{rc:20028,msg:'密码格式不正确'}},
            hashLength:{define:40,client:undefined,server:{rc:20030,msg:'哈希密码长度为40个字符'}}
            //validateError:{define:undefined,client:undefined,server:{rc:20031,msg:'用户密码验证失败'}}
        },
        newPassword:{
            require:{define:true,client:{rc:10032,msg:'新密码不能为空'},server:{rc:20032,msg:'新密码为空'}},
            //minLength:{define:2,client:{rc:10008,msg:'密码至少包含2个字符'},server:undefined}, //实际存入db为hash过的字符，永远是40
            //maxLength:{define:20,client:{rc:10010,msg:'密码最多包含20个字符'},server:undefined},
            type:{define:regex.pageNum,client:{rc:10034,msg:'密码由字母,数字,特殊字符组成,长度2-20个字符'},server:{rc:20034,msg:'密码格式不正确'}},
            hashLength:{define:40,client:undefined,server:{rc:20036,msg:'哈希密码长度为40个字符'}},
            validateError:{define:undefined,client:undefined,server:{rc:20038,msg:'用户密码验证失败'}}
        },
        rePassword:{
            equal:{define:true,client:{rc:10040,msg:'两次密码不一致'},server:{rc:20040,msg:'两次密码不一致'}}
            //minLength:{define:2,client:{rc:10008,msg:'密码至少包含2个字符'},server:undefined}, //实际存入db为hash过的字符，永远是40
            //maxLength:{define:20,client:{rc:10010,msg:'密码最多包含20个字符'},server:undefined},
    /*        type:{define:regex.pageNum,client:{rc:10004,msg:'密码由字母,数字,特殊字符组成,长度2-20个字符'},server:{rc:20004,msg:'密码格式不正确'}},
            hashLength:{define:40,client:undefined,server:{rc:20012,msg:'哈希密码长度为40个字符'}},
            validateError:{define:undefined,client:undefined,server:{rc:20013,msg:'用户密码验证失败'}}*/
        }


    },

    /*
    * article
    * */
    key:{
        _id:{
            type:{define:regex.objectId,client:{rc:10100,msg:'关键字编号格式不正确'},server:{rc:20100,msg:'关键字编号格式不正确'}},
            validateError:{define:regex.objectId,client:undefined,server:{rc:20101,msg:'关键字编号验证失败'}}
        },
        key:{
            require:{define:true,client:{rc:10102,msg:'关键字内容不能为空'},server:{rc:20102,msg:'关键字内容为空'}},
            type:{define:regex.keyName,client:{rc:10103,msg:'关键字的内容格式不正确'},server:{rc:20103,msg:'关键字的内容格式不正确'}},
            validateError:{define:undefined,client:undefined,server:{rc:20105,msg:'关键字验证失败'}}
        }
    },
    attachment:{
        _id:{
            type:{define:regex.objectId,client:{rc:10200,msg:'附件编号格式不正确'},server:{rc:20200,msg:'附件编号格式不正确'}},
            validateError:{define:regex.objectId,client:undefined,server:{rc:20201,msg:'附件编号验证失败'}}
        },
        hashName:{
            require:{define:true,client:undefined,server:{rc:20202,msg:'附件哈希名不存在'}},
            type:{define:regex.hashName,client:undefined,server:{rc:20203,msg:'附件哈希名格式不正确'}},//hash后加上扩张名的长度
            validateError:{define:undefined,client:undefined,server:{rc:20205,msg:'附件哈希名验证失败'}}
        },
        name:{
            require:{define:true,client:undefined,server:{rc:20206,msg:'文件名不存在'}},
            minLength:{define:5,client:{rc:10208,msg:'附件名长度至少为5个字符'},server:{rc:20208,msg:'附件名长度少于5个字符'}},//一个文件名+。+3个扩展名
            maxLength:{define:200,client:{rc:10210,msg:'附件名长最多为200个字符'},server:{rc:20210,msg:'附件名长度大于200个字符'}},
            validateError:{define:undefined,client:undefined,server:{rc:20211,msg:'附件名验证失败'}}
        },
        storePath:{
            require:{define:true,client:undefined,server:{rc:20212,msg:'存储路径不存在'}},
            maxLength:{define:1024,client:undefined,server:{rc:20214,msg:'存储路径长度大于1024个字符'}},
            validateError:{define:undefined,client:undefined,server:{rc:20215,msg:'附件名保存路径验证失败'}}
        },
        size:{
            require:{define:true,client:{rc:10216,msg:'附件大小未知'},server:{rc:20216,msg:'附件大小不存在'}},
            maxLength:{define:300*1024*1024,client:{rc:10218,msg:'附件最大为300M'},server:{rc:20218,msg:'附件大小超过300M'}},
            validateError:{define:undefined,client:undefined,server:{rc:20219,msg:'附件大小验证失败'}}
        }

    },
    innerImage:{
        _id:{
            type:{define:regex.objectId,client:{rc:10300,msg:'插图编号格式不正确'},server:{rc:20300,msg:'插图编号格式不正确'}},
            validateError:{define:regex.objectId,client:undefined,server:{rc:20301,msg:'插图编号验证失败'}}
        },
        hashName:{
            require:{define:true,client:undefined,server:{rc:20302,msg:'插图哈希名不存在'}},
            type:{define:regex.hashName,client:undefined,server:{rc:20303,msg:'插图哈希名格式不正确'}},//hash后加上扩张名的长度
            validateError:{define:undefined,client:undefined,server:{rc:20305,msg:'插图哈希名验证失败'}}
        },
        name:{
            require:{define:true,client:undefined,server:{rc:20306,msg:'插图文件名不存在'}},
            minLength:{define:5,client:{rc:10308,msg:'插图名长度至少为5个字符'},server:{rc:20308,msg:'插图名长度少于5个字符'}},//一个文件名+。+3个扩展名
            maxLength:{define:100,client:{rc:10310,msg:'插图名长最多为100个字符'},server:{rc:20310,msg:'插图名长度大于100个字符'}},
            validateError:{define:undefined,client:undefined,server:{rc:20305,msg:'插图名验证失败'}}
        },
        storePath:{
            require:{define:true,client:undefined,server:{rc:20312,msg:'插图存储路径不存在'}},
            maxLength:{define:1024,client:undefined,server:{rc:20314,msg:'插图存储路径长度大于1024个字符'}},
            validateError:{define:undefined,client:undefined,server:{rc:20315,msg:'插图存储路径验证失败'}}
        },
        size:{
            require:{define:true,client:{rc:10316,msg:'插图大小未知'},server:{rc:20316,msg:'插图大小不存在'}},
            maxLength:{define:2*1024*1024,client:{rc:10318,msg:'插图最大为2M'},server:{rc:20318,msg:'插图大小超过300M'}},
            validateError:{define:undefined,client:undefined,server:{rc:20319,msg:'插图大小验证失败'}}
            }
        },
    comment:{
        _id:{
            //require:{define:true,client:{rc:10400,msg:'评论编号必需存在'},server:{rc:20500,msg:'评论编号不存在'}},
            type:{define:regex.objectId,client:{rc:10400,msg:'评论编号格式不正确'},server:{rc:20400,msg:'评论编号格式不正确'}},
            validateError:{define:regex.objectId,client:undefined,server:{rc:20401,msg:'文档编号验证失败'}}
        },
        articleId:{
            require:{define:true,client:{rc:10402,msg:'评论的文档ID必需存在'},server:{rc:20402,msg:'评论的文档ID不存在'}},
            type:{define:regex.objectId,client:{rc:10403,msg:'评论的文档ID格式不正确'},server:{rc:20403,msg:'评论的文档ID格式不正确'}},
            validateError:{define:undefined,client:undefined,server:{rc:20404,msg:'评论所属文档验证失败'}}
        },
        user:{
            require:{define:true,client:{rc:10404,msg:'评论的用户ID必需存在'},server:{rc:20404,msg:'评论的用户ID不存在'}},
            type:{define:regex.objectId,client:{rc:10406,msg:'评论的用户ID格式不正确'},server:{rc:20406,msg:'评论的用户ID格式不正确'}},
            validateError:{define:undefined,client:undefined,server:{rc:20403,msg:'评论所属用户验证失败'}}
        },
        content:{
            require:{define:true,client:{rc:10408,msg:'评论内容必需存在'},server:{rc:20408,msg:'评论内容不存在'}},
            maxLength:{define:255,client:{rc:10410,msg:'评论内容长度最多255个字符'},server:{rc:20410,msg:'评论内容长度超过255个字符'}},
            validateError:{define:undefined,client:undefined,server:{rc:20411,msg:'评论内容验证失败'}}
        }
    },
    article:{
        _id:{
            //require:{define:true,client:{rc:10500,msg:'文档编号必需存在'},server:{rc:20500,msg:'文档编号不存在'}},
            type:{define:regex.objectId,client:{rc:10501,msg:'文档编号格式不正确'},server:{rc:20501,msg:'文档编号格式不正确'}},
            validateError:{define:regex.objectId,client:undefined,server:{rc:20502,msg:'文档编号验证失败'}}
        },
        hashId:{
            require:{define:true,client:{rc:10503,msg:'文档哈希编号必需存在'},server:{rc:20503,msg:'文档哈希编号不存在'}},
            type:{define:regex.sha1Hash,client:{rc:10504,msg:'文档哈希编号格式不正确'},server:{rc:20504,msg:'文档哈希编号格式不正确'}},
            validateError:{define:regex.sha1Hash,client:undefined,server:{rc:20505,msg:'文档哈希编号验证失败'}}
        },
        title:{
            require:{define:true,client:{rc:10506,msg:'文档标题必需存在'},server:{rc:20506,msg:'文档标题不存在'}},
            minLength:{define:2,client:{rc:10507,msg:'文档标题至少包含2个字符'},server:{rc:20507,msg:'文档标题小于2个字符'}},
            maxLength:{define:20,client:{rc:10508,msg:'文档标题最多包含20个字符'},server:{rc:20508,msg:'文档标题超过20个字符'}},
            validateError:{define:undefined,client:undefined,server:{rc:20509,msg:'文档标题验证失败'}}
        },
        author:{
            require:{define:true,client:{rc:10510,msg:'文档作者必需存在'},server:{rc:20510,msg:'文档作者不存在'}},
            type:{define:regex.objectId,client:{rc:10512,msg:'文档作者格式不正确'},server:{rc:20512,msg:'文档作者格式不正确'}},
            validateError:{define:undefined,client:undefined,server:{rc:20513,msg:'文档作者验证失败'}}
        },
        keys:{
            require:{define:false,client:undefined,server:undefined},
            type:{define:regex.objectId,client:{rc:10516,msg:'文档作者格式不正确'},server:{rc:20516,msg:'文档作者格式不正确'}},
            maxSize:{define:5,client:{rc:10517,msg:'关键字数量最大为5个'},server:{rc:20517,msg:'关键字数量多于5个'}},
            validateError:{define:undefined,client:undefined,server:{rc:20518,msg:'文档关键字验证失败'}}
        },
        innerImage:{
            require:{define:false,client:undefined,server:undefined},
            type:{define:regex.objectId,client:{rc:10520,msg:'文档插图编号不正确'},server:{rc:20520,msg:'文档插图编号不正确'}},
            maxSize:{define:5,client:{rc:10522,msg:'插图数量最大为5个'},server:{rc:20522,msg:'插图数量多于5个'}},
            validateError:{define:undefined,client:undefined,server:{rc:20523,msg:'文档插图编号验证失败'}}
        },
        attachment:{
            require:{define:false,client:undefined,server:undefined},
            type:{define:regex.objectId,client:{rc:10524,msg:'文档附件格式不正确'},server:{rc:20524,msg:'文档附件格式不正确'}},
            maxSize:{define:5,client:{rc:10526,msg:'附件数量最大为5个'},server:{rc:20526,msg:'附件数量多于5个'}},
            validateError:{define:undefined,client:undefined,server:{rc:20527,msg:'文档插图编号验证失败'}}
        },
        pureContent:{
            require:{define:false,client:undefined,server:undefined},
            maxLength:{define:8000,client:{rc:10528,msg:'文档内容最多包含8000个字符'},server:{rc:20528,msg:'文档内容超过8000个字符'}},
            validateError:{define:undefined,client:undefined,server:{rc:20529,msg:'文档内容验证失败'}}
        },
        htmlContent:{
            require:{define:false,client:undefined,server:undefined},
            maxLength:{define:12000,client:{rc:10532,msg:'文档html内容最多包含12000个字符'},server:{rc:20532,msg:'文档html内容超过12000个字符'}},
            validateError:{define:undefined,client:undefined,server:{rc:20533,msg:'文档html内容验证失败'}}
        }
    },
    folder:{
        _id:{
            //因为是mongodb自动生成,所以不需要require和validate的检测
            type:{define:regex.objectId,client:{rc:10600,msg:'目录编号不正确'},server:{rc:20600,msg:'目录编号不正确'}},
            validateError:{define:regex.objectId,client:undefined,server:{rc:20601,msg:'目录编号验证失败'}}
        },
        folderName:{
            require:{define:true,client:{rc:10602,msg:'没有目录名'},server:{rc:20602,msg:'目录名不存在'}},
            type:{define:regex.folderName,client:{rc:10604,msg:'目录名不能含有空白,并且最多包含255个字符'},server:{rc:20604,msg:'目录名含有空白,或者超过255个字符'}},
            validateError:{define:undefined,client:undefined,server:{rc:20606,msg:'目录名验证失败'}}
        },
        owner:{
            require:{define:true,client:{rc:10608,msg:'目录创建者不存在'},server:{rc:20608,msg:'目录创建者不存在'}},
            type:{define:regex.objectId,client:{rc:10610,msg:'目录创建者编号不正确'},server:{rc:20610,msg:'目录创建者编号不正确'}},
            validateError:{define:undefined,client:undefined,server:{rc:20611,msg:'目录创建者验证失败'}}
        },
        parentId:{
            require:{define:false,client:{rc:10612,msg:'上级目录不存在'},server:{rc:20612,msg:'上级目录不存在'}},
            type:{define:regex.objectId,client:{rc:10614,msg:'上级目录编号不正确'},server:{rc:20614,msg:'上级目录编号不正确'}},
            validateError:{define:undefined,client:undefined,server:{rc:20615,msg:'上级目录验证失败'}}
        },
        level:{
            require:{define:true,client:{rc:10610,msg:'目录层数不存在'},server:{rc:20610,msg:'目录层数不存在'}},
            range:{define:{min:1,max:3},client:{rc:10612,msg:'目录层数超出定义范围'},server:{rc:20612,msg:'目录层数超出定义范围'}},
            validateError:{define:undefined,client:undefined,server:{rc:20613,msg:'目录层数验证失败'}}
        }
    },
    articleFolder:{
        articleId:{
            require:{define:true,client:{rc:10700,msg:'文档编号不存在'},server:{rc:20700,msg:'文档编号不存在'}},
            type:{define:regex.objectId,client:{rc:10702,msg:'文档编号不正确'},server:{rc:20702,msg:'文档编号不正确'}},
            validateError:{define:undefined,client:undefined,server:{rc:20703,msg:'文档编号验证失败'}}
        },
       folderId:{
            require:{define:true,client:{rc:10704,msg:'目录编号不存在'},server:{rc:20704,msg:'目录编号不存在'}},
            type:{define:regex.objectId,client:{rc:10706,msg:'目录编号不正确'},server:{rc:20706,msg:'目录编号不正确'}},
            validateError:{define:undefined,client:undefined,server:{rc:20707,msg:'目录编号验证失败'}}
        }
    }
 }

exports.input_validate=input_validate
exports.regex=regex
