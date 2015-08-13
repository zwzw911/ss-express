/**
 * Created by wzhan039 on 2015-07-08.
 */
//var inputDefine=require('../assist/input_define').inputDefine;
var uploadDefine=require('../assist/upload_define').uploadDefine;
var ueditor_config=require('../assist/ueditor_config').ue_config;
var input_validate=require('../error_define/input_validate').input_validate;

var instMongo=require('./dbConnection');
var mongoose=instMongo.mongoose;
var schemaOptions=instMongo.schemaOptions;

/*                              user                        */
var userSch=new mongoose.Schema({
        name:{type:String, unique:true},
        password:String,
        mobilePhone:Number,
        thumbnail:{type:String,default:'b10e366431927231a487f08d9d1aae67f1ec18b4.jpg'},
        //articles:[{type:mongoose.Schema.Types.ObjectId,ref:'articles'}],
        cDate:Date,
        mDate:{type:Date,default:Date()},
        dDate:Date
    },
    schemaOptions
);
//userSch.set('toJSON',{getters:true,virtuals:"true",minimize:true,depopulate:false,versionKey:true,retainKeyOrder:false})
userSch.path('name').validate(function(value){

    return (value!=null && value.length>input_validate.user.name.minLength.define && value.length<input_validate.user.name.maxLength.define)

})
//password had been hashed
userSch.path('password').validate(function(value){
    return (value!=null && value.length===input_validate.user.password.hashLength.define)
})
userSch.path('mobilePhone').validate(function(value){
    return null===value || (value.length<=input_validate.user.mobilePhone.maxLength.define && value.length>=input_validate.user.mobilePhone.minLength.define)
})
var userModel=mongoose.model('users',userSch)//mongoose auto convert user to users, so directly use users as collection name



/*                              key                             */
var keySch=new mongoose.Schema({
    key:String,
    cDate:Date,
    mDate:{type:Date,default:Date()},
    dDate:Date
},schemaOptions);
keySch.path('key').validate(function(value){
    return (null!=value && value.length<input_validate.key.key.maxLength.define && value.length>input_validate.key.key.minLength.define)
})
var keyModel=mongoose.model('keys',keySch);

/*                              attachment                             */
var attachmentSch=new mongoose.Schema({
    _id:String,//hashName sha1 40+4 ~ 40+5
    name:String,//100  compatilbe with windows
    storePath:String,// 1024 for linux(don't care windows,since server use Linux as OS)
    size:Number,//in byte
    cDate:Date,
    mDate:{type:Date,default:Date()},
    dDate:Date
},schemaOptions);

attachmentSch.path('_id').validate(function(value){
    return (value != null && value.length>=input_validate.attachment._id.minLength.define && value.length<=input_validate.attachment._id.maxLength.define );// 44 ~ 45,后缀为3～4个字符
});
attachmentSch.path('name').validate(function(value){
    return (value != null && value.length<input_validate.attachment.name.maxLength.define &&  value.length>=input_validate.attachment.name.minLength.define);
});
attachmentSch.path('storePath').validate(function(value){
    return (value != null && value.length<input_validate.attachment.storePath.maxLength.define);
});
attachmentSch.path('size').validate(function(value){
    return ((value != null) && (value<input_validate.attachment.size.maxLength.define));
});
var attachmentModel=mongoose.model('attachments',attachmentSch);

/*                          inner_image                                 */
/*
*   用户可能upload图片后又删除，所以需要对上传的文本和数据库进行同步
*   因此需要单独表（而不是和attachment混在一起，否则处理麻烦）
*   结构和attachment基本一致
* */
var innerImageSch=new mongoose.Schema({
    _id:String,//sha1 40+5
    name:String,//100   compatilbe with windows
    storePath:String,// 1024 for linux(don't care windows,since server use Linux as OS)
    size:Number,//in byte
    cDate:Date,
    mDate:{type:Date,default:Date()},
    dDate:Date
},schemaOptions);
innerImageSch.path('_id').validate(function(value){
    return (value != null && value.length>=input_validate.innerImage._id.minLength.define && value.length<=input_validate.innerImage._id.maxLength.define);//44 ~ 45,后缀为3～4个字符
});
innerImageSch.path('name').validate(function(value){
    return (value != null && value.length<input_validate.innerImage.name.maxLength.define && value.length>=input_validate.innerImage.name.minLength.define);
});
innerImageSch.path('storePath').validate(function(value){
    return (value != null && value.length<input_validate.innerImage.storePath.maxLength.define);
});
innerImageSch.path('size').validate(function(value){
    return ((value != null) && (value<=input_validate.innerImage.size.maxLength.define));//此处采用ueditor_config中的设置
});
var innerImageModel=mongoose.model('innerImages',innerImageSch);


/*                          comment                                 */
/*
 *   传统方式，无父-子关系
 * */
var commentSch=new mongoose.Schema({
    //_id:mongoose.Schema.Types.ObjectId,
    //为了方便populate出user的内容，需要添加articleId，以便直接查找comment，然后populate
    articleId:{type:String,ref:"articles"},
    user:{type:mongoose.Schema.Types.ObjectId,ref:"users"},
    content:String,// 255
    cDate:Date,
    mDate:{type:Date,default:Date()},
    dDate:Date
},schemaOptions);
commentSch.path('articleId').validate(function(value){
    return (value != null || input_validate.comment.articleId.type.define.test(value));
});
commentSch.path('user').validate(function(value){
    return (value != null || value.length<input_validate.comment.user.type.define.test(value));
});
commentSch.path('content').validate(function(value){
    return (value == null || value.length<input_validate.comment.content.maxLength.define);
});
var commentModel=mongoose.model('comments',commentSch);

/*                                      article                                  */
var articleSch=new mongoose.Schema({
    _id:String, //hash id
    title:String,
    author:{type:mongoose.Schema.Types.ObjectId,ref:"users"},
    keys:[{type:mongoose.Schema.Types.ObjectId,ref:'keys'}],
    innerImage:[{type:mongoose.Schema.Types.ObjectId,ref:'innerImages'}],
    attachment:[{type:String,ref:'attachments'}],
    pureContent:String,
    htmlContent:String,
    comment:[{type:mongoose.Schema.Types.ObjectId,ref:'comments'}],
    cDate:Date,
    mDate:{type:Date,default:Date()},
    dDate:Date
}, schemaOptions);
articleSch.path('_id').validate(function(value){
    return value!=null && value.length===input_validate.article._id.type.test(value);
})
articleSch.path('title').validate(function(value){
    return value!=null && value.length>input_validate.article.title.minLength.define && value.length<input_validate.article.title.maxLength.define ;
})
articleSch.path('author').validate(function(value){
    return value!=null && input_validate.article.author.type.test(value)
})
articleSch.path('keys').validate(function(value){
    if( value==[] ){return true}
    for(var i=0;i<value.length;i++){
        if(!input_validate.article.keys.type.test(value[i])){
            return false
        }
    }
    return true
})
articleSch.path('innerImage').validate(function(value){
    if( value==[] ){return true}
    for(var i=0;i<value.length;i++){
        if(!input_validate.article.innerImage.type.test(value[i])){
            return false
        }
    }
    return true
})
articleSch.path('attachment').validate(function(value){
    if( value==[] ){return true}
    for(var i=0;i<value.length;i++){
        if(!input_validate.article.attachment.type.test(value[i])){
            return false
        }
    }
    return true
})
articleSch.path('pureContent').validate(function(value){
    return null===value || value.length<input_validate.article.pureContent.maxLength.define
})
articleSch.path('htmlContent').validate(function(value){
    return null===value || value.length<input_validate.article.htmlContent.maxLength.define;
})
var articleModel=mongoose.model('articles',articleSch);
//var commentModel=mongoose.model('comment',commentSch);



var errorSch=new mongoose.Schema({
    errorCode:Number, //new define file
    errorMsg:String, //new define file
    category:String,// which page
    subCategory:String,
    desc:String,//more detail information
    priority:String,
    cDate:Date,
    mDate:{type:Date,default:Date()},
    dDate:Date
},schemaOptions);
var errorModel=mongoose.model('errors',errorSch);





exports.userModel=userModel;
exports.articleModel=articleModel;
exports.keyModel=keyModel;
exports.attachmentModel=attachmentModel;
exports.innerImageModel=innerImageModel;
exports.errorModel=errorModel;
exports.commentModel=commentModel;

//exports.readArticle=readArticle;