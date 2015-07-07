/**
 * Created by wzhan039 on 2015-07-01.
 */
var inputDefine=require('../../../routes/assist/input_define').inputDefine;

var instMongo=require('./dbConnection');
var mongoose=instMongo.mongoose;
var schemaOptions=instMongo.schemaOptions;

var userSch=new mongoose.Schema({
    name:String,
    password:String,
    mobilePhone:Number,
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

var user=mongoose.model('users',userSch)//mongoose auto convert user to users, so directly use users as collection name
//console.log(user);
exports.user=user;