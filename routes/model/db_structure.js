/**
 * Created by wzhan039 on 2015-07-08.
 */
var inputDefine=require('../assist/input_define').inputDefine;
var uploadDefine=require('../assist/upload_define').uploadDefine;
var ueditor_config=require('../assist/ueditor_config').ue_config;

var instMongo=require('./dbConnection');
var mongoose=instMongo.mongoose;
var schemaOptions=instMongo.schemaOptions;

/*                              user                        */
var userSch=new mongoose.Schema({
        name:{type:String, unique:true},
        password:String,
        mobilePhone:Number,
        articles:[{type:mongoose.Schema.Types.ObjectId,ref:'articles'}],
        cDate:Date,
        mDate:{type:Date,default:Date()},
        dDate:Date
    },
    schemaOptions
);
//userSch.set('toJSON',{getters:true,virtuals:"true",minimize:true,depopulate:false,versionKey:true,retainKeyOrder:false})
userSch.path('name').validate(function(value){
    //console.log(value.length)
    return (value!=null && value.length>inputDefine.name.minlength && value.length<inputDefine.name.maxlength)
/*    if(value.length<inputDefine.name.minlength || value.length>inputDefine.name.maxlength){
        return false
    }*/
})
//password had been hashed
userSch.path('password').validate(function(value){
    if(value.length!=40){
        return false
    }
})
userSch.path('mobilePhone').validate(function(value){
    return null===value || (value.length<=inputDefine.mobilePhone.maxlength && value.length>=inputDefine.mobilePhone.minlength)
/*    if(value.length<11 || value.length>13){
        return false
    }*/
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
    return null!=value && value.length<inputDefine.key.maxlength;
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
    return (value != null && value.length>=uploadDefine.hashNameMinLength.define && value.length<=uploadDefine.hashNameMaxLength.define);// 44 ~ 45,后缀为3～4个字符
});
attachmentSch.path('name').validate(function(value){
    return (value != null && value.length<uploadDefine.fileNameLength.define);
});

attachmentSch.path('storePath').validate(function(value){
    return (value != null && value.length<uploadDefine.saveDirLength.define);
});
attachmentSch.path('size').validate(function(value){
    return ((value != null) && (value<uploadDefine.maxFileSize.define));
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
    return (value != null && value.length>=uploadDefine.hashNameMinLength.define && value.length<=uploadDefine.hashNameMaxLength.define);//44 ~ 45,后缀为3～4个字符
});
innerImageSch.path('name').validate(function(value){
    return (value != null && value.length<uploadDefine.fileNameLength.define);
});
innerImageSch.path('storePath').validate(function(value){
    return (value != null && value.length<uploadDefine.saveDirLength.define);
});
innerImageSch.path('size').validate(function(value){
    return ((value != null) && (value<ueditor_config.imageMaxSize));//此处采用ueditor_config中的设置
});
var innerImageModel=mongoose.model('innerImages',innerImageSch);


/*                          comment                                 */
/*
 *   传统方式，无父-子关系
 * */
var commentSch=new mongoose.Schema({
    //_id:mongoose.Schema.Types.ObjectId,
    user:{type:mongoose.Schema.Types.ObjectId,ref:"users"},
    content:String,// 255
    cDate:Date,
    mDate:{type:Date,default:Date()},
    dDate:Date
},schemaOptions);
commentSch.path('content').validate(function(value){
    return (value == null || value.length<inputDefine.comment.maxlength);
});
/*innerImageSch.path('hashName').validate(function(value){
    return (value != null && value.length>=uploadDefine.hashNameMinLength.define && value.length<=uploadDefine.hashNameMaxLength.define);//44 ~ 45,后缀为3～4个字符
});
innerImageSch.path('storePath').validate(function(value){
    return (value != null && value.length<uploadDefine.saveDirLength.define);
});
innerImageSch.path('size').validate(function(value){
    return ((value != null) && (value<ueditor_config.imageMaxSize));//此处采用ueditor_config中的设置
});*/
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
    return value!=null && value.length===inputDefine._id.length;
})
articleSch.path('title').validate(function(value){
    return value!=null && value.length>0 && value.length<inputDefine.title.maxlength ;
})
articleSch.path('pureContent').validate(function(value){
    if(null===value){return true}
    return value.length<inputDefine.pureContent.maxlength;
})
articleSch.path('htmlContent').validate(function(value){
    if(null===value){return true}
    return value.length<inputDefine.htmlContent.maxlength;
})

var articleModel=mongoose.model('articles',articleSch);
//var commentModel=mongoose.model('comment',commentSch);



var errorSch=new mongoose.Schema({
    errorCode:Number, //new define file
    errorMsg:String, //new define file
    category:String,// which page
    subCategory:String,
    desc:String,//more detail information
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