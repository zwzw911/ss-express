var dbStructure=require("./db_structure"),articleModel=dbStructure.articleModel,keyModel=dbStructure.keyModel,userModel=dbStructure.userModel,attachmentModel=dbStructure.attachmentModel,commentModel=dbStructure.commentModel,innerImageModel=dbStructure.innerImageModel,keyArticleModel=dbStructure.keyArticleModel,hash=require("../express_component/hashCrypt"),async=require("async"),generalFunction=require("../express_component/generalFunction").generateFunction,miscellaneous=require("../assist_function/miscellaneous").func,errorRecorder=require("../express_component/recorderError").recorderError,general=require("../assist/general").general,ueConfig=require("../assist/ueditor_config").ue_config,validateDb=require("../error_define/3rd_party_error_define").validateDb,input_validate=require("../error_define/input_validate").input_validate,runtimeDbError=require("../error_define/runtime_db_error").runtime_db_error,runtimeNodeError=require("../error_define/runtime_node_error").runtime_node_error,pagination=require("../express_component/pagination").pagination,fs=require("fs"),hashId2Id=function(a,b){articleModel.find({hashId:a},"_id",function(a,c){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","hashId2Id"),b(a,runtimeDbError.article.findByHashId)):0===c.length?b(null,runtimeDbError.article.findByHashIdNull):1<c.length?b(null,runtimeDbError.article.findByHashIdMulti):b(null,{rc:0,msg:c[0]._id})})},readComment=function(a,b,c){articleModel.find({hashId:a},"comment mDate cDate",function(a,d){if(a)return errorRecorder({rc:a.code,msg:a.errmsg},"article","readComment"),res.json(a,runtimeDbError.article.findByHashId);if(null==d)return res.json(a,runtimeDbError.article.findByHashIdNull);var e=d[0],f=pagination(e.comment.length,b,general.commentPageSize,general.commentPageLength),g=[{path:"comment",model:"comments",select:" content mDate user",options:{limit:general.commentPageSize,skip:(f.curPage-1)*general.commentPageSize}}];e.populate(g,function(a,b){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","readComment"),c(a,runtimeDbError.comment.readComment)):void async.forEachOf(b.comment,function(a,c,d){userModel.findById(a.user," name thumbnail  mDate",function(a,e){a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","readComment"),d(a,runtimeDbError.user.findById)):null===e?(b.comment[c].user=void 0,errorRecorder(runtimeDbError.user.findByIdNull,"article","readArticle"),d(a,runtimeDbError.user.findByIdNull)):(b.comment[c].user=void 0,b.comment[c].user=e,b.comment[c].user._id=void 0,d())})},function(a){if(a)return c(null,runtimeDbError.user.findById);var d={comment:b.toObject().comment};return d.pagination=f,c(null,{rc:0,msg:d})})})})},createNewArticle=function(a,b,c){var d=new articleModel;d.title=a,d.author=b;var e=hash.hash("sha1",d.title);articleModel.count({hashId:e},function(a,b){if(a)return errorRecorder({rc:a.code,msg:a.errmsg},"article","createNewArticle"),c(a,runtimeDbError.article.count);if(b>0){var f=(new Date).getTime();f+=generalFunction.generateRandomString(4),e=hash.hash("sha1",d.title+f)}d.hashId=e,d.cDate=new Date,validateDb.article(d,"article","createNewArticle",function(a,b){return 0!==b.rc?c(a,b):void d.save(function(a,b){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","createNewArticle"),c(a,runtimeDbError.article.save)):c(null,{rc:0,msg:{articleId:b._id,articleHashId:b.hashId}})})})})},updateArticleContent=function(a,b,c){articleModel.find({hashId:a},function(a,d){if(a)return errorRecorder({rc:a.code,msg:a.errmsg},"article","findArticle"),c(a,runtimeDbError.article.findByHashId);if("[]"===JSON.stringify(d))return c(null,runtimeDbError.article.findByHashIdNull);if(1<d.length)return c(null,runtimeDbError.article.findByHashIdMulti);for(var e,f=["title","keys","pureContent","htmlContent"],g=d[0],h=0;h<f.length;h++)e=f[h],(void 0!=b[e]||null!=b[e])&&(g[e]=void 0,g[e]=b[e]);if(g.mDate=new Date,void 0!=b.state&&-1===general.state.indexOf(b.state)?g.state=general.state[0]:g.state=b.state,void 0!==g.innerImage&&0<g.innerImage.length){async.forEachOf(g.innerImage,function(a,b,d){innerImageModel.findById(a,"hashName",function(b,e){if(b)return errorRecorder({rc:b.code,msg:b.errmsg},"article","findInnerImage"),c(b,runtimeDbError.innerImage.findById);if(null===e){var f=g.innerImage.indexOf(a);-1!==f&&g.innerImage.splice(f,1)}else{var h=g.htmlContent.indexOf(e.hashName);if(-1===h){var f=g.innerImage.indexOf(a);-1!==f&&g.innerImage.splice(f,1),innerImageModel.findByIdAndRemove(a,function(a,b){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","findInnerImage"),c(a,runtimeDbError.innerImage.findById)):void fs.unlinkSync(general.ueUploadPath+"/"+ueConfig.imagePathFormat+"/"+b.hashName)})}}d()})},function(a){return a?c(a):void validateDb.article(g,"article","updateArticleContent",function(a,b){return 0!==b.rc?c(a,b):void g.save(function(a){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","updateArticleContent"),c(a,runtimeDbError.article.save)):c(null,{rc:0,msg:null})})})})}else validateDb.article(g,"article","updateArticleContent",function(a,b){return 0!==b.rc?c(a,b):void g.save(function(a){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","updateArticleContent"),c(a,runtimeDbError.article.save)):c(null,{rc:0,msg:null})})})})},updateArticleKey=function(a,b,c){var d=new keyModel,e=[];return 0===b.length?c(null,{rc:0,msg:null}):void async.forEachOf(b,function(a,b,c){keyModel.findOne({key:a},"_id key",function(b,f){b&&c(b),null===f?(d.key=a,d.cDate=new Date,d.save(function(a,b){e.push(b.key)})):e.push(f.key),c()})},function(b){articleModel.find({hashId:a},"keys",function(a,b){if(a)return errorRecorder({rc:a.code,msg:a.errmsg},"article","updateArticleKey"),c(a,runtimeDbError.article.findById);if("[]"===JSON.stringify(b))return c(null,runtimeDbError.article.findByHashIdNull);if(1<b.length)return c(null,runtimeDbError.article.findByHashIdMulti);var d=b[0];d.keys=[];for(var f=0;f<e.length;f++)d.keys.push(e[f]);d.save(function(a){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","saveArticleKey"),c(a,runtimeDbError.article.save)):c(null,{rc:0,msg:null})})})})},updateKeyArticle=function(a,b){articleModel.find({hashId:a},"keys",function(a,c){if(a)return errorRecorder({rc:a.code,msg:a.errmsg},"article","updateKeyArticle"),b(a,runtimeDbError.article.findByHashId);if(0===c.length)return b(null,runtimeDbError.article.findByHashIdNull);if(1<c.length)return b(null,runtimeDbError.article.findByHashIdMulti);var d=c[0];keyArticleModel.find({articleId:d._id},function(a,c){if(a)return errorRecorder({rc:a.code,msg:a.errmsg},"article","updateKeyArticle"),b(a,runtimeDbError.keyArticle.find);if(0===c.length){var e=d.keys;if(0===e.length)return b(null,{rc:0,msg:null});var f=e.length>general.maxKeyNum?general.maxKeyNum:e.length,g=e.splice(0,f);async.forEachOf(g,function(a,c,e){var f=new keyArticleModel;f.articleId=d._id,f.keyId=c,validateDb.keyArticle(f,"article","updateKeyArticle",function(a,c){return 0!==c.rc?b(null,c):void f.save(function(a){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","updateKeyArticle"),b(a,runtimeDbError.keyArticle.save)):void e()})})},function(a){return b(null,{rc:0,msg:null})})}if(0<c.length){var e=d.keys,f=e.length>general.maxKeyNum?general.maxKeyNum:e.length;return async.forEachOf(c,function(a,c,d){-1===e.indexOf(a.keyId)&&keyArticleModel.remove({_id:a._id},function(a){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","updateKeyArticle"),b(a,runtimeDbError.keyArticle.remove)):void d()})},function(a){}),async.forEachOf(e,function(a,e,f){if(-1===miscellaneous.objectIndexOf("keyId",e,c)){var g=new keyArticleModel;g.articleId=d._id,g.keyId=e,validateDb.keyArticle(g,"article","updateKeyArticle",function(a,c){return 0!==c.rc?b(null,c):void g.save(function(a){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","updateKeyArticle"),b(a,runtimeDbError.keyArticle.save)):void 0})})}},function(a){}),b(null,{rc:0,msg:null})}})})},addInnerImage=function(a,b,c){articleModel.find({hashId:a},"innerImage",function(a,d){if(a){if("development"===express().get("env"))throw a;if("production"===express().get("env"))return errorRecorder({rc:a.code,msg:a.errmsg},"article","addArticleAttachment"),c(a,runtimeDbError.article.findByHashId)}return null===d?c(null,runtimeDbError.article.findByHashIdNull):d.length>1?c(null,runtimeDbError.article.findByHashIdMulti):void validateDb.innerImage(b,"article","addInnerImage",function(a,e){return 0!==e.rc?c(a,e):void b.save(function(a,b){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","innerImage"),c(a,runtimeDbError.innerImage.save)):(d[0].innerImage.push(b._id),void d[0].save(function(a,d){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","article"),c(a,runtimeDbError.article.save)):c(null,{rc:0,msg:b})}))})})})},getAttachmentHashName=function(a,b){attachmentModel.findById(a,"hashName name",function(a,c){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","getAttachmentHashName"),b(a,runtimeDbError.attachment.findById)):void 0===c?b(null,runtimeNodeError.attachment.attachmentNotFind):b(null,{rc:0,msg:c})})},addAttachment=function(a,b,c){articleModel.find({hashId:a},"attachment",function(a,d){if(a){if("development"===express().get("env"))throw a;if("production"===express().get("env"))return errorRecorder({rc:a.code,msg:a.errmsg},"article","addArticleAttachment"),c(a,runtimeDbError.article.findByHashId)}return null===d?c(null,runtimeDbError.article.findByHashIdNull):d.length>1?c(null,runtimeDbError.article.findByHashIdMulti):void validateDb.attachment(b,"article","addAttachment",function(a,e){return 0!==e.rc?c(a,e):void b.save(function(a,b){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","attachment"),c(a,runtimeDbError.attachment.save)):(d[0].attachment.push(b._id),void d[0].save(function(a){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","article"),c(a,runtimeDbError.article.save)):c(null,{rc:0,msg:b.toObject()})}))})})})},delAttachment=function(a,b,c){attachmentModel.findByIdAndRemove(b,{select:"_id hashName"},function(b,d){return b?(errorRecorder({rc:b.code,msg:b.errmsg},"article","delAttachment"),c(b,runtimeDbError.attachment.findByIdAndRemove)):void articleModel.find({hashId:a},"attachment",function(a,b){if(a)return errorRecorder({rc:a.code,msg:a.errmsg},"article","findArticle"),c(a,runtimeDbError.article.findByHashId);var e=b[0].attachment.indexOf(d._id);-1!=e&&(b[0].attachment.splice(e,1),b[0].save(function(a){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","delArticleAttachment"),c(a,runtimeDbError.article.save)):c(null,{rc:0,msg:d})}))})})},addComment=function(a,b,c,d){articleModel.find({hashId:a},"comment mDate",function(e,f){if(e)return errorRecorder({rc:e.code,msg:e.errmsg},"article","findArticle"),d(e,runtimeDbError.article.findByHashId);var g=new commentModel;g.user=b,g.content=c,hashId2Id(a,function(a,c){return 0<c.rc?d(null,c):(g.articleId=c.msg,void validateDb.comment(g,"article","addComment",function(a,c){return 0!=c.rc?d(a,c):void g.save(function(a,c,e){if(a)return errorRecorder({rc:a.code,msg:a.errmsg},"article","saveComment"),d(a,runtimeDbError.comment.save);var c=c.toObject(),g=f[0];(null===g.comment||void 0===g.comment)&&(g.comment=[]),g.comment.push(c._id),g.save(function(a,e){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","updateArticleComment"),d(a,runtimeDbError.article.save)):void userFindById(b,function(a,b){var e=b.msg.toObject();return 0!=b.rc?d(a,b):(c.user=e,c.articleId=void 0,d(null,{rc:0,msg:c}))})})})}))})})},delComment=function(a,b,c){articleModel.findById(a,"comment",function(a,d){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","findArticle"),c(a,runtimeDbError.article.findByHashId)):void commentModel.findByIdAndRemove(b,function(a,e){if(a)return errorRecorder({rc:a.code,msg:a.errmsg},"article","removeComment"),c(a,runtimeDbError.comment.findByIdAndRemove);var f=d.comment.indexOf(b);-1!=f&&(d.comment.splice(f,1),d.save(function(a){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","findArticle"),c(a,runtimeDbError.article.save)):void c(null,{rc:0,msg:null})}))})})},userFindById=function(a,b){userModel.findById(a,"name thumbnail mDate cDate",function(a,c){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","readArticle"),b(a,runtimeDbError.user.findById)):null===c?(errorRecorder(runtimeDbError.user.findByIdNull,"article","readArticle"),b(a,runtimeDbError.user.findByIdNull)):b(null,{rc:0,msg:c})})},readArticle=function(a,b){articleModel.find({hashId:a},function(a,c){if(a)return errorRecorder({rc:a.code,msg:a.errmsg},"article","findArticle"),b(a,runtimeDbError.article.findByHashId);if(null===c)return b(null,runtimeDbError.article.findByHashIdNull);var d=0;void 0!==c[0].comment&&(d=c[0].comment.length);var e=pagination(d,1,general.commentPageSize,general.commentPageLength),f=[{path:"author",model:"users",select:"name mDate"},{path:"comment",model:"comments",select:"content  mDate user",options:{limit:general.commentPageSize}},{path:"innerImage",model:"innerImages",select:"name storePath cDate mDate"},{path:"attachment",model:"attachments",select:"name size cDate",options:{sort:"cDate"}}];c[0].populate(f,function(a,c){return a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","readArticle"),b(a,runtimeDbError.article.findById)):void async.forEachOf(c.comment,function(a,b,d){userModel.findById(a.user,"name thumbnail cDate mDate",function(a,e){a?(errorRecorder({rc:a.code,msg:a.errmsg},"article","readArticle"),d(a,runtimeDbError.user.findById)):null===e?(c.comment[b].user=void 0,errorRecorder(runtimeDbError.user.findByIdNull,"article","readArticle"),d(a,runtimeDbError.user.findByIdNull)):(c.comment[b].user=void 0,c.comment[b].user=e,c.comment[b].user._id=void 0,d())})},function(a){return a?b(null,a):(finalResult=c.toObject(),finalResult.pagination=e,b(null,{rc:0,msg:finalResult}))})})})};exports.articleDboperation={createNewArticle:createNewArticle,updateArticleContent:updateArticleContent,updateArticleKey:updateArticleKey,getAttachmentHashName:getAttachmentHashName,addAttachment:addAttachment,delAttachment:delAttachment,addComment:addComment,delComment:delComment,readArticle:readArticle,addInnerImage:addInnerImage,readComment:readComment};