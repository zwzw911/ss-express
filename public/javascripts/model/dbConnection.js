/**
 * Created by Ada on 2015/5/10.
 */
var mongoose=require('mongoose');
var url='mongodb://localhost/ss';
var options={db: { native_parser: true }};
mongoose.connect(url);
mongoose.connection.on('error',console.error.bind(console, 'connection error:'))
//mongoose.connection.once('open',function(cb){});
exports.mongoose=mongoose;
