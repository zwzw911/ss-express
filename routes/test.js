/**
 * Created by wzhan039 on 2015-07-30.
 */
var express = require('express');
var router = express.Router();
var dbStructure=require('../public/javascripts/model/db_structure')
var articleModel=dbStructure.article;
var keyModel=dbStructure.key;


var hash=require('../public/javascripts/express_component/hashCrypt');
var async=require('async')

var createNewArticle=function(res){
    var article=new articleModel();
    article.title='test1'

    var hashID=hash.hash('sha1',article.title);
    articleModel.count({_id:hashID},function(err,result){
        //如果原始title 的hash id已经存在，那么使用当前时间重新生成一个
        if(1===result){
            var date=new Date().getTime()
            hashID=hash.hash('sha1',article.title+date)
            //console.log('r')
        }
        article._id = hashID;
        article.cDate=new Date();
        article.mDate=article.cDate;
        article.validate(function(err){
            if(err){
                return res.render({errorMsg:'创建新文档失败，请重试'})
            }else{
                article.save()
            }
        })
    })
}

//更新titl or content
/*
* _id:文档id  type:title or content（更新哪个部分，title和content区分）   obj：要更新的内容
* */
var updateArticleContent=function(_id,type,obj,callback){
    var article=new articleModel();
    async.waterfall([
        function(cb){
            articleModel.findOne({_id:_id},function(err,article){
                switch (type)
                {
                    case 'title':
                        article.title=obj.title;
                        break
                    case 'content':
                        article.pureContent=obj.pureContent;
                        article.htmlContent=obj.htmlContent
                        break
                    default:
                        cb(new error('unknown article update field'))
                }
                cb(null,article)
            })
        },
        function(article,cb){
            article.validate(function(err){
                cb(err)//in waterfall, if cb(err), next function skipped and direct run final function
            })
            cb(null,article)
        },
        function(article,cb){
            article.save(function(err){
                cb(err)
            })
            cb(null,{result:true})
        }
    ],function(err,result){
        callback(err,result)
        //if(err){console.log(err)}else{console.log(result);callback(result)}
    })
}


//根据key（string）获得对应id，如果key不存在，直接保存后获得新id
//返回一个数组（key id）
var getKeyId=function(keys,callback){
    var keyword=new keyModel();
    var keyArray=[]
    //console.log(keys)
    if(0===keys.length){
        return []
    }
    //console.log(keys)
    async.forEachOf(keys,function(value,key,cb){
        keyModel.findOne({key:value},'_id',function(err,document){
            //console.log(key)
            if(err){cb(err)}
            if(document===null){
                //console.log(value)
                keyword.key=value;
                keyword.cDate=new Date()
                keyword.mDate=new Date()
                keyword.save(function(err,keyword){
                    keyArray.push(keyword._id)
                })
            }else{
                //console.log(document)
                keyArray.push(document._id)
                //console.log(keyArray)
            }
            cb()//如果没有错误，必须执行cb不带任何参数
        })
    },function(err){
        //console.log(keyArray)
        callback(err,keyArray)
    })
}

router.get('/',function(req,res,next){
    //createNewArticle(res)
    //article.save()
    //updateArticleContent('b444ac06613fc8d63795be9ad0beaf55011936ac','title',{title:''},function(err,result){
    //    console.log(err)
    //})
//console.log('test')

/*    articleModel.findOne({_id:'b444ac06613fc8d63795be9ad0beaf55011936ac'},function(err,article){
        if(err){console.log(err)}

        getKeyId(['key1','key2'],function(err,keyArray){
            //console.log(keyArray)
            article.keys=keyArray
            article.save()
        })
    })*/
})
module.exports = router;
