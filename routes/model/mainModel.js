/**
 * Created by zw on 2015/10/13.
 */
var dbStructure=require('./db_structure');
var articleModel=dbStructure.articleModel;
var keyModel=dbStructure.keyModel;
var userModel=dbStructure.userModel;
var async=require('async')
var generalFunction=require('../express_component/generalFunction').generateFunction
var miscellaneous=require('../assist_function/miscellaneous').func//可以和generalFunction合并
var errorRecorder=require('../express_component/recorderError').recorderError;

var general=require('../assist/general').general
var validateDb=require('../assist/3rd_party_error_define').validateDb;
var input_validate=require('../error_define/input_validate').input_validate;
var runtimeDbError=require('../error_define/runtime_db_error').runtime_db_error;
var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error;

var getLatestArticle=function(callback){
    //console.log(1)
    articleModel.find({},'-_id hashId mDate author title keys pureContent',{sort:{cDate:-1},limit:general.latestArticleNum},function(err,findedArticle){
        if(err){
            errorRecorder({rc:err.code, msg:err.errmsg}, 'main', 'getLatestArticle-find')
            return callback(err,runtimeDbError.article.find)
        }
        if(0===findedArticle.length){
            return callback(null,{rc:0,msg:undefined})   
        }

        var finalResult=[];//populate之后，需要toObject()以便获得正确的时间；toObject的结果需要push到一个新的变量，而不是原始mongoose doc，否则Conv date不会出现
        var opt=[{path:'author',model:'users',select:'name mDate'}]
        //findedArticle.populate(opt,function(err,result){
        //    console.log(result)
        //})
        async.forEachOf(findedArticle,function(value,key,cb){
            value.populate(opt,function(err,result){
                if(err){
                    errorRecorder({rc:err.code, msg:err.errmsg}, 'main', 'getLatestArticle-pupolate')
                    return callback(err,runtimeDbError.article.populateUser)
                }
/*                console.log(result.author.toObject())
                var author=result.author.toObject()
                result.author=undefined
                result.author=author
                console.log(result.author)*/
                finalResult.push(result.toObject())
                //value=result.toObject()
               cb()
            })
        },function(err){
            //console.log(findedArticle)
            return callback(null,{rc:0,msg:finalResult})
        })

    })
}
exports.mainDboperation={
    getLatestArticle:getLatestArticle
}
