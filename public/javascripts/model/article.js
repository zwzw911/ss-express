/**
 * Created by zw on 2015/7/7.
 */
    var instMongo=require('./dbConnections')
var mongoose=instMongo.mongoose;
var schemaOptions=instMongo.schemaOptions;

var articleSch=new mongoose.Schema({
    title:String,
    author:{type:Schema.Types.ObjectId,ref:"user"},
    pureContent:String,
    htmlContent:String,
    cDate:Date,
    mDate:Date,
    dDate:Date
}, schemaOptions)
