/**
 * Created by zw on 2015/7/7.
 */
var instMongo=require('./dbConnections').mongoose;
var mongoose=instMongo.mongoose;
var schemaOptions=instMongo.schemaOptions;

var articleSch=new mongoose.Schema({
    key:String,
    cDate:Date,
    mDate:Date,
    dDate:Date
},schemaOptions)
