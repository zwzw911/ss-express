var errorRecorder=require("../express_component/recorderError").recorderError,input_validate=require("./input_validate").input_validate,validateUser=function(a,b,c,d){a.validate(function(a){var e;return a?(a.errors.name&&(e=input_validate.user.name.validateError.server),a.errors.password&&(e=input_validate.user.password.validateError.server),a.errors.mobilePhone&&(e=input_validate.user.mobilePhone.validateError.server),a.errors.thumbnail&&(e=input_validate.user.thumbnail.validateError.server),errorRecorder(e,b,c),d(a,e)):d(null,{rc:0,msg:null})})},validateArticle=function(a,b,c,d){a.validate(function(a){var e;return a?(a.errors.hashId&&(e=input_validate.article.hashId.validateError.server),a.errors.title&&(e=input_validate.article.title.validateError.server),a.errors.author&&(e=input_validate.article.author.validateError.server),a.errors.keys&&(e=input_validate.article.keys.validateError.server),a.errors.innerImage&&(e=input_validate.article.innerImage.validateError.server),a.errors.attachment&&(e=input_validate.article.attachment.validateError.server),a.errors.pureContent&&(e=input_validate.article.pureContent.validateError.server),a.errors.htmlContent&&(e=input_validate.article.htmlContent.validateError.server),errorRecorder(e,b,c),d(a,e)):d(null,{rc:0,msg:null})})},validateAttachment=function(a,b,c,d){a.validate(function(a){var e;return a?(a.errors._id&&(e=input_validate.attachment._id.validateError.server),a.errors.name&&(e=input_validate.attachment.name.validateError.server),a.errors.storePath&&(e=input_validate.attachment.storePath.validateError.server),a.errors.size&&(e=input_validate.attachment.size.validateError.server),errorRecorder(e,b,c),d(a,e)):d(null,{rc:0,msg:null})})},validateComment=function(a,b,c,d){a.validate(function(a){var e;return a?(a.errors.articleId&&(e=input_validate.comment.articleId.validateError.server),a.errors.user&&(e=input_validate.comment.user.validateError.server),a.errors.content&&(e=input_validate.comment.content.validateError.server),errorRecorder(e,b,c),d(a,e)):d(null,{rc:0,msg:null})})},validateKey=function(a,b,c,d){a.validate(function(a){var e;return a?(a.errors.key&&(e=input_validate.key.key.validateError.server),errorRecorder(e,b,c),d(a,e)):d(null,{rc:0,msg:null})})},validateInnerImage=function(a,b,c,d){a.validate(function(a){var e;return a?(a.errors.hashName&&(e=input_validate.innerImage.hashName.validateError.server),a.errors.name&&(e=input_validate.innerImage.name.validateError.server),a.errors.storePath&&(e=input_validate.innerImage.storePath.validateError.server),a.errors.size&&(e=input_validate.innerImage.size.validateError.server),errorRecorder(e,b,c),d(a,e)):d(null,{rc:0,msg:null})})},validateFolder=function(a,b,c,d){a.validate(function(a){var e;return a?(a.errors.folderName&&(e=input_validate.folder.folderName.validateError.server),a.errors.owner&&(e=input_validate.folder.owner.validateError.server),a.errors.parentId&&(e=input_validate.folder.parentId.validateError.server),a.errors.level&&(e=input_validate.folder.level.validateError.server),errorRecorder(e,b,c),d(a,e)):d(null,{rc:0,msg:null})})},validateFolder=function(a,b,c,d){a.validate(function(a){var e;return a?(a.errors.folderName&&(e=input_validate.folder.folderName.validateError.server),a.errors.owner&&(e=input_validate.folder.owner.validateError.server),a.errors.parentId&&(e=input_validate.folder.parentId.validateError.server),a.errors.level&&(e=input_validate.folder.level.validateError.server),errorRecorder(e,b,c),d(a,e)):d(null,{rc:0,msg:null})})},validateKeyArticle=function(a,b,c,d){a.validate(function(a){var e;return a?(a.errors.keyId&&(e=input_validate.keyArticle.keyId.validateError.server),a.errors.articleId&&(e=input_validate.keyArticle.articleId.validateError.server),errorRecorder(e,b,c),d(a,e)):d(null,{rc:0,msg:null})})},validateArticleFolder=function(a,b,c,d){a.validate(function(a){var e;return a?(a.errors.folderId&&(e=input_validate.articleFolder.folderId.validateError.server),a.errors.articleId&&(e=input_validate.articleFolder.articleId.validateError.server),errorRecorder(e,b,c),d(a,e)):d(null,{rc:0,msg:null})})};exports.validateDb={user:validateUser,article:validateArticle,attachment:validateAttachment,comment:validateComment,key:validateKey,innerImage:validateInnerImage,folder:validateFolder,articleFolder:validateArticleFolder};