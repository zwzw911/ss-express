/**
 * Created by wzhan039 on 2015-07-08.
 */
var inputDefine=require('../../../routes/assist/input_define').inputDefine;
var uploadDefine=require('../../../routes/assist/upload_define').uploadDefine;

var instMongo=require('./dbConnection');
var mongoose=instMongo.mongoose;
var schemaOptions=instMongo.schemaOptions;

/*                              user                        */
var userSch=new mongoose.Schema({
        name:String,
        password:String,
        mobilePhone:Number,
        articles:[{type:mongoose.Schema.Types.ObjectId,ref:'articleModel'}],
        cDate:Date,
        mDate:Date,
        dDate:Date
    },
    schemaOptions
);
userSch.set('toJSON',{getters:true,virtuals:"true",minimize:true,depopulate:false,versionKey:true,retainKeyOrder:false})
userSch.path('name').validate(function(value){
    //console.log(value.length)
    if(value.length<inputDefine.name.minlength || value.length>inputDefine.name.maxlength){
        return false
    }
})
//password had been hashed
userSch.path('password').validate(function(value){
    if(value.length!=40){
        return false
    }
})
//userSch.path('mobilePhone').validate(function(value){
//    if(value.length<11 || value.length>13){
//        return false
//    }
//})
var userModel=mongoose.model('users',userSch)//mongoose auto convert user to users, so directly use users as collection name

/*                                      article                                  */
var articleSch=new mongoose.Schema({
    title:String,
    author:{type:mongoose.Schema.Types.ObjectId,ref:"userModel"},
    keys:[{type:mongoose.Schema.Types.ObjectId,ref:'keyModel'}],
    pureContent:String,
    htmlContent:String,
    cDate:Date,
    mDate:Date,
    dDate:Date
}, schemaOptions);

articleSch.path('title').validate(function(value){
    return value.length<inputDefine.title.maxlength;
})
articleSch.path('pureContent').validate(function(value){
    return value.length<inputDefine.pureContent.maxlength;
})
articleSch.path('htmlContent').validate(function(value){
    return value.length<inputDefine.htmlContent.maxlength;
})
var articleModel=mongoose.model('article',articleSch);

/*                              key                             */
var keySch=new mongoose.Schema({
    key:String,
    cDate:Date,
    mDate:Date,
    dDate:Date
},schemaOptions);
keySch.path('key').validate(function(value){
    return value.length<inputDefine.key.maxlength;
})
var keyModel=mongoose.model('key',keySch);

/*                              attachment                             */
var attachmentSch=new mongoose.Schema({
    name:String,
    hashName:String,//sha1 40+4
    storePath:String,
    size:Number,//in byte
    cDate:Date,
    mDate:Date,
    dDate:Date
},schemaOptions);
attachmentSch.path('size').validate(function(value){
    //console.log(value != null)
    //console.log(value.length<uploadDefine.maxFileSize.define)
    //console.log((value != null) && (value.length<uploadDefine.maxFileSize.define))
    return ((value != null) && (value<uploadDefine.maxFileSize.define));
})
attachmentSch.path('name').validate(function(value){
    return (value != null && value.length<uploadDefine.fileNameLength.define);
})
var attachmentModel=mongoose.model('attachment',attachmentSch);

exports.user=userModel;
exports.article=articleModel;
exports.key=keyModel;
exports.attachment=attachmentModel;