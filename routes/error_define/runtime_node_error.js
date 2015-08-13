/**
 * Created by wzhan039 on 2015-08-11.
 */
/*  node错误，按照页面进行划分，内部再用路由/assist_function划分*/
var runtime_node_error={
    article:{
        unknownContentType:{rc:40000,msg:'未知字段内容'},
        notArticleOwner:{rc:40002,msg:'不是文档作者，无法执行操作'},
        notImageFile:{rc:40004,msg:'文件类型不是图片'}
    }
}
exports.runtime_node_error=runtime_node_error
