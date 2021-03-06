/**
 * Created by wzhan039 on 2015-08-11.
 */
/*  node错误，按照页面进行划分，内部再用路由/assist_function划分*/
var runtime_node_error={
    general:{

        userStateWrong:{rc:40000,msg:'用户状态不正确'},
        userNotlogin:{rc:40001,msg:"尚未登陆,无法执行操作"},
        /*                      check interval                      */
        intervalPostPostWrong:{rc:40002,msg:'两次操作间隔过短，请稍后再试'},//当前POST和上次POST间隔
        intervalPostGetWrong:{rc:40004,msg:'两次操作间隔过短，请稍后再试'},//当前POST和上次GET
        intervalGetGetWrong:{rc:40006,msg:'两次操作间隔过短，请稍后再试'},//当前Get和上次Get间隔
        intervalGetPostWrong:{rc:40008,msg:'两次操作间隔过短，请稍后再试'},//当前Get和上次POST间隔
        unknownRequestType:{rc:40010,msg:'未知的请求类型'},

        /*                      pagination                          */
        invalidPaginationString:{rc:40012,msg:'错误的分页字符'}

    },
    user:{
        userAlreadyExist:{rc:40100,msg:'用户已经存在'},
        captchaVerifyFail:{rc:40102,msg:'验证码错误'},
        rememberMeTypeWrong:{rc:40104,msg:'记住用户名的值必须是布尔值'},
        rePasswordFail:{rc:40106,msg:'两次输入的密码必须一致'},
        genCaptchaFail:{rc:40108,msg:'验证码生成失败'},
        genCaptchaDataUrlFail:{rc:40110,msg:'验证码生成失败'}
    },
    attachment:{
        attachmentNotFind:{rc:40200,msg:'附件不存在'},
	    renameFail:{rc:40201,msg:'保存文件失败'},//this is server side only
        noAvailableSpace:{rc:40202,msg:'剩余空间容量不足'},
        noUploadFile:{rc:40203,msg:'上传文件不能为空'},
	    hashNameMinLength:{define:44,client:{rc:40204,msg:"hash名最多包含44个字符"}},//sha1+。+suffix
    	 hashNameMaxLength:{define:45,client:{rc:40206,msg:"hash名最多包含45个字符"}}//sha1+。+suffix
    },
    setting:{
        /*                      globalSetting                       */
        itemNotDefined:{rc:40300,msg:'配置项不存在'},
        subitemNotDefined:{rc:40301,msg:'配置子项不存在'},
        //subitemValueundefined:{rc:42000,msg:'配置子项的值不存在'},
        emptyGlobalSettingValue:{rc:40302,msg:'配置子项的值不能为空'},
        //非预定义的参数
        invalidSettingParam:{rc:40303,msg:'未知的全局参数'},
        settingValueNotInt:{rc:40304,msg:'全局参数必须是整数'},
        settingValueExceedMaxInt:{rc:40305,msg:'全局参数超出最大值'},
        settingValueExceedMinInt:{rc:40306,msg:'全局参数超出最小值'},
        settingValuePathNotExist:{rc:40308,msg:'全局参数定义的路径不存在'},
        settingValueFileNotExist:{rc:40310,msg:'全局参数定义的文件不存在'}
        /*                      internal Setting                       */
    },
    article:{
        unknownContentType:{rc:40500,msg:'未知字段内容'},
        notArticleOwner:{rc:40502,msg:'不是文档作者，无法执行操作'},
        notLogin:{rc:40503,msg:'尚未登录，无法执行操作'},
        notImageFile:{rc:40504,msg:'文件类型不是图片'},
        openFileFail:{rc:40506,msg:'打开文件出错'},
        readFileFail:{rc:40508,msg:'读取文件出错'},
        invalidateImageType:{rc:40510,msg:'图片格式错误'},
        noAuthToAddComment:{rc:40512,msg:"尚未登录，无法添加评论"},
        renameFileFail:{rc:40514,msg:'无法重命名文件'},
        //以下是ue_editor的错误（附件的定义有upload_define定义
        uploadImageDirNotExist:{rc:40516,msg:'目录不存在，无法保存插图'},
        exceedMaxFileSize:{rc:40518,msg:'文件超过预定义大小'},
        commentCurPageWrongFormat:{rc:40520,msg:'页码必需是数字'},
        articleNumNotInt:{rc:40522,msg:'文档总数必须是数字'}
    },
    folder:{
        notFolderOwner:{rc:40600,msg:'不是当前目录的创建者,无法操作'},
        readRootFolder:{rc:40602,msg:'无法找到用户的根目录'},
        notOwner:{rc:40604,msg:'您不是当前目录的创建者,无法对此目录执行任何操作'},
        folderNameNotMatch:{rc:40606,msg:'当前目录的名字不正确'},
        updateFolderNameFail:{rc:40608,msg:'更改目录名失败'},
        notNewFolderOwner:{rc:40610,msg:'您不是新目录的创建者,无法移动'},
        parentLevelNotInRange:{rc:40612,msg:'达到最大目录深度'},
        notLogin:{rc:40614,msg:'尚未登录，无法执行操作'},
        hasChildNotDelete:{rc:40616,msg:'目录不为空,无法删除'},
        findTrashFolderNull:{rc:40618,msg:'用户的垃圾箱目录不存在'},
        findTrashFolderMulti:{rc:40620,msg:'用户的垃圾箱目录有多个'},
        //default root
        invalidateRootFolderName:{rc:40622,msg:'默认目录名不合法'},
        cantModifyDefaultFolderName:{rc:40624,msg:'无法更改默认目录名'},
        cantMoveDefaultFolder:{rc:40624,msg:'无法移动默认目录'},
        cantDeleteDefaultFolderName:{rc:40624,msg:'无法删除默认目录'}
    },
    articleFolder:{
        notArticleOwner:{rc:40700,msg:'不是文档的作者,无法操作'},
        notFolderOwner:{rc:40702,msg:'不是当前目录的创建者,无法操作'},
        pageNumWrong:{rc:40704,msg:'页数不正确'}
    },
    searchResult:{
        notMatchArticle:{rc:40800,msg:'没有匹配的文档'},
        pageNumWrong:{rc:40802,msg:'搜索结果的页码不正确'}
    },
    captcha:{
        readDir:{rc:40900,msg:'无法读取captcha目录'},
        removeFile:{rc:40902,msg:'无法删除过期的captcha文件'},
        notExist:{rc:40904,msg:'验证码不存在'},
        notEqual:{rc:40906,msg:'验证码不正确'}
    },
    image:{
        cantMatchFileSize:{rc:41000,msg:'未知的图像文件尺寸格式'},
        exceedMaxFileSize:{rc:41002,msg:'文件尺寸超出做到限制'},
        cantParseFileSize:{rc:41003,msg:'无法解析文件的大小'},
        cantParseFileSizeNum:{rc:41004,msg:'无法解析文件的大小数值'}
    },
    adminLogin:{
        reachMaxTryTimes:{rc:41100,msg:'用户名或者密码错误。达到每天最大重试次数，请明天再试'},
        notSaveUserNamePassword:{rc:41102,msg:'重新生成用户名密码，请重新登录'},
        adminLoginFail:{rc:41104,msg:'用户名或者密码错误'},
        notLogin:{rc:41106,msg:'尚未登录'},
        unknownErr:{rc:41110,msg:'未知错误'},
    },
    intervalCheckBaseIP:{
        forbiddenReq:{rc:41200,msg:'请求被禁止'},
        between2ReqCheckFail:{rc:41202,msg:'请求过于频繁，请稍候再尝试'},
        exceedMaxTimesInDuration:{rc:41204,msg:'请求过于频繁，请稍候再尝试'},
        tooMuchReq:{rc:41206,msg:'请求过于频繁，请稍候再尝试'},
        unknownRequestIdentify:{rc:41208,msg:'请求获得客户端地址和会话'},
    },
    fs:{
        openGlobalSettingFileFailed:{rc:42000,msg:'无法打开全局设置文件'},
        writeGlobalSettingFileFailed:{rc:42002,msg:'无法保存全局设置文件'},
        readDirFail:{rc:42004,msg:'读取文件夹错误'},
    },
    importSetting:{
        fileExceedMaxSize:{rc:42100,msg:'上传的设置文件超出预定义大小'},
        fileReadFail:{rc:42102,msg:'读取上传的设置文件出错'},
        fileContentTypeWrong:{rc:42104,msg:'上传的设置文件格式不正确'},
        fileContentIsEmpty:{rc:42105,msg:'上传的设置文件内容不能为空'},
        fileContentWrong:{rc:42106,msg:'上传的设置文件内容不正确'},
        itemNotExist:{rc:42108,msg:'选项不存在'},
    }

}
exports.runtime_node_error=runtime_node_error
