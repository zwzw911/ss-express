var mongoose=require("mongoose"),url="mongodb://localhost/ss",options={db:{native_parser:!0}};mongoose.connect(url),mongoose.connection.on("error",console.error.bind(console,"connection error:")),exports.mongoose=mongoose;