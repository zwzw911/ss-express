/**
 * Created by ada on 2015/7/31.
 */

var dbStructure=require('../model/db_structure');

var errorModel=dbStructure.errorModel

var recorderError=function(Code,errorMsg,category,subCategory,desc){
    var error=new errorModel()
    error.errorCode=Code;
    error.errorMsg=errorMsg;
    error.desc=desc;
    error.category=category;//哪个页面
    error.subCategory=subCategory;//操作+db名字
    error.cDate=new Date();
    error.mDate=new Date()

    error.save(function(err){
        //console.log('error save')
    })
}
exports.recorderError=recorderError