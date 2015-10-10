/**
 * Created by wzhan039 on 2015-08-11.
 */
/*  node错误，按照页面进行划分，内部再用路由/assist_function划分*/
var runtime_node_error={
    general:{

        userStateWrong:{rc:40000,msg:'用户状态不正确'},
        userNotlogin:{rc:40001,msg:"尚未登陆,无法执行操作"},
        /*                      check interval                      */
        intervalWrong:{rc:40002,msg:'两次操作间隔过短，请稍后再试'},
        /*                      pagination                          */
        invalidPaginationString:{rc:40004,msg:'错误的分页字符'}

    },
    user:{
        userAlreadyExist:{rc:40100,msg:'用户已经存在'},
        captchaVerifyFail:{rc:40102,msg:'验证码错误'},
        rememberMeTypeWrong:{rc:40104,msg:'记住用户名的值必须是布尔值'},
        rePasswordFail:{rc:40106,msg:'两次输入的密码必须一致'},
        genCaptchaFail:{rc:40108,msg:'验证码生成失败'}
    },
    attachment:{
        attachmentNotFind:{rc:400200,msg:'附件不存在'}
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
        removeFile:{rc:40902,msg:'无法删除过期的captcha文件'}
    }
}
exports.runtime_node_error=runtime_node_error
