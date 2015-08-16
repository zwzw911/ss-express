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
        exceedMaxFileSize:{rc:40518,msg:'文件超过预定义大小'}
    }
}
exports.runtime_node_error=runtime_node_error
