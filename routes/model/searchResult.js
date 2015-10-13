/**
 * Created by zw on 2015/9/20.
 */
/*                              db                                */
var dbStructure=require('./db_structure');
var userModel=dbStructure.userModel;
var articleModel=dbStructure.articleModel
var keyModel=dbStructure.keyModel;
/*                         validate and error                           */
//var validateDb=require('../assist/3rd_party_error_define').validateDb;
var input_validate=require('../error_define/input_validate').input_validate;
var errorRecorder=require('../express_component/recorderError').recorderError;
var runtimeDbError=require('../error_define/runtime_db_error').runtime_db_error;
var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error;

/*                          MISC                                    */
//var hashCrypt=require('../express_component/hashCrypt');
//var async=require('async')
var general=require('../assist/general').general
var miscellaneous=require('../assist_function/miscellaneous').func
//var pemFilePath='./other/key/key.pem'; //相对于网站根目录（此处是h:/ss_express/ss_express/)
var async=require('async')
var pagination=require('../express_component/pagination').pagination
//获得关键字的id
var convertKeyword=function(keywordArray,callback){
/*    async,forEachOf(keywordArray,function(key,value,cb){

    },function(err){

    })*/

}

//var calcSkipLimit=function(total,curPage){
//
//}
//使用aggregate获得数据
//1. 读取key的id,存入数组
//2. 根据1中,对article的keys进行查找,根据符合的数量进行排序,返回 _id和count
//3. 根据2中的数据,查找article(不在2中直接返回article的所有内容,是因为怕太多字段,占用内存)
var getSearchResult=function(keywordArray,curPage,callback){
    //keyModel.aggregate({$match:{key:'CAPA'}})
    var newCurPage=curPage//不知为何，function的参数surPage无法传递到articleModel.aggregate内部
    keyModel.aggregate([{$match:{key:{$in:{$toLower:keywordArray}}}},{$project:{_id:1,key:1}},{$group:{_id:null,keys:{$push:"$key"}}}],function(err,res){
        if(err){
            errorRecorder({rc:err.code,msg:err.errmsg},'searchResult','getSearchResult')
            return callback(err,runtimeDbError.key.aggregateByKeyName)
        }
        if(0===res[0].length){
            return callback(null,runtimeNodeError.searchResult.notMatchArticle)
        }
        var matchKeyId=res[0].keys
        articleModel.aggregate([
            {$unwind:"$keys"},//次序会影响结果,要先unwind,然后match
            //{$match:{$or:[{keys:{$in:matchKeyId},state:'编辑完成'}]}},
            {$match:{keys:{$in:matchKeyId}}},
            {$group:{_id:"$_id",count:{$sum:1}}},
            {$sort:{count:-1}}
        ],function(err,result){
/*            [ { _id: 55f1102514ca7c301476d2a7, count: 1 },
                { _id: 55f1102414ca7c301476d2a5, count: 1 } ]*/
            if(err){
                errorRecorder({rc:err.code,msg:err.errmsg},'searchResult','getSearchResult')
                return callback(err,runtimeDbError.article.aggregateByKeyName)
            }
            if(0===result.length){
                //return callback(null,runtimeNodeError.searchResult.notMatchArticle)
                return callback(null,{rc:0,msg:undefined})
            }
            //利用分页函数重定位cuPage
            var total=result.length
            var paginationResult=pagination(total,newCurPage,general.searchResultPageSize,general.searchResultPageLength)
            var curPage=paginationResult.curPage
            var findOpt={skip:general.searchResultPageSize*(curPage-1),limit:general.searchResultPageSize}

            var matchArticleId=miscellaneous.extractKey('_id',result)
            var populateOpt=[
                {path:'author',model:'users',select:'-_id name'}//对于tree,只要title
                //{path:'comment',model:'comments',select:'content mDate user',options:{limit:general.commentPageSize}}
            ]
            articleModel.find({_id:{$in:matchArticleId}},'-_id hashId author title htmlContent pureContent keys mDate',findOpt,function(err,findedSearchResult){
                if(err){
                    errorRecorder({rc:err.code,msg:err.errmsg},'searchResult','getSearchResult')
                    return callback(err,runtimeDbError.article.find)
                }
//console.log(findedSearchResult)
                articleModel.populate(findedSearchResult,populateOpt,function(err,populatedResult){
                //findedSearchResult.populate(opt,function(err,populatedResult){
                //    return callback(null,{rc:0,msg:populatedResult})
                    return callback(null,{rc:0,msg:{results:populatedResult,pagination:paginationResult}})
                })



            })
        })
/*        articleModel.aggregate([
            {$match:{keys:{$in:}}}
        ],function(err,result){

        })*/
        //return callback(null,{rc:0,msg:res[0].keys})
    })
//var test1=test.match({key:'asdf'})

    //var test=articleModel.aggregate({$match:{keys:{$in:keywordArray}}})//.unwind('keys').group({_id:"$_id",count:{$sum:1}}).sort({count:-1})
    //return callback(null,test)
}

//直接使用mongodb提供的$text:{$search:keyString对所有的textIndex（title/key/pureContent）查找
var getSearchResult1=function(keyString,curPage,callback){

    var newCurPage=curPage//不知为何，function的参数surPage无法传递到articleModel.aggregate内部
    var searchOpt=[
        {$match:{$text:{$search:keyString}}}
        ,{$sort:{rank:{$meta:"textScore"}}}
        ,{$project:{"_id":1}}//为了populate使人民居住作者名字，所以只能先获得article id
    ]

    articleModel.aggregate(searchOpt,function(err,result){
//console.log(err)
        if(err){
            errorRecorder({rc:err.code,msg:err.errmsg},'searchResult','getSearchResult')
            return callback(err,runtimeDbError.article.find)
        }

        if(0===result.length){
            //return callback(null,runtimeNodeError.searchResult.notMatchArticle)
            return callback(null,{rc:0,msg:undefined})
        }
        //利用分页函数重定位cuPage
        var total=result.length
        var paginationResult=pagination(total,newCurPage,general.searchResultPageSize,general.searchResultPageLength)
        var curPage=paginationResult.curPage
        var findOpt={skip:general.searchResultPageSize*(curPage-1),limit:general.searchResultPageSize}

        var matchArticleId=miscellaneous.extractKey('_id',result)
        var populateOpt=[
            {path:'author',model:'users',select:'-_id name'}//对于tree,只要title
            //{path:'comment',model:'comments',select:'content mDate user',options:{limit:general.commentPageSize}}
        ]
        articleModel.find({_id:{$in:matchArticleId}},'-_id hashId author title htmlContent pureContent keys mDate',findOpt,function(err,findedSearchResult){
            if(err){
                errorRecorder({rc:err.code,msg:err.errmsg},'searchResult','getSearchResult')
                return callback(err,runtimeDbError.article.find)
            }
            articleModel.populate(findedSearchResult,populateOpt,function(err,populatedResult){
                //findedSearchResult.populate(opt,function(err,populatedResult){
                //console.log(populatedResult)
                return callback(null,{rc:0,msg:{results:populatedResult,pagination:paginationResult}})
            })


        })
    })
}
exports.searchResultDbOperation={
    getSearchResult:getSearchResult,
    getSearchResult1:getSearchResult1
}