/**
 * Created by wzhan039 on 2015-08-11.
 */
/*  node错误，按照页面进行划分，内部再用路由/assist_function划分*/
var runtime_node_error={


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
        commentCurPageWrongFormat:{rc:40520,msg:'页码必需是数字'}
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
        invalidateRootFolderName:{rc:40622,msg:'根目录名不合法'},


    },
    articleFolder:{
        notArticleOwner:{rc:40700,msg:'不是文档的作者,无法操作'},
        notFolderOwner:{rc:40702,msg:'不是当前目录的创建者,无法操作'},
        pageNumWrong:{rc:40704,msg:'页数不正确'}
    }
}
exports.runtime_node_error=runtime_node_error
