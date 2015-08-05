/**
 * Created by Ada on 2015/5/10.
 */
var mongoose=require('mongoose');
var url='mongodb://localhost/ss';
var options={db: { native_parser: true }};
mongoose.connect(url);
mongoose.connection.on('error',console.error.bind(console, 'connection error:'))
//mongoose.connection.on('error',new error('test'));
//mongoose.connection.once('open',function(cb){});
//new error('db not start');

var schemaOptions={
    autoIndex:false,
    bufferCommands:false,
    _id:true,//must be true: mongoose generated object_id and save into collections
    minimize:true,
    safe:true,
    Strict:false,//set as false, so if a field not set value, still can be saved into db
    validateBeforeSave:false
};

exports.mongoose=mongoose;
exports.schemaOptions=schemaOptions;
