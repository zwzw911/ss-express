/**
 * Created by wzhan039 on 2015-09-24.
 */
var mongoose=require('./dbConnection').mongoose


var createIndex=function(){
    var colls=mongoose.connection.collection('articles')
    console.log(colls)
    colls.getIndexes(function(err,res){
        console.log(res)
    })
}
exports.func={
    createIndex:createIndex
}
//console.log(mongoose.connection.collection('articles'))

