/**
 * Created by zw on 2015/9/20.
 */
var express = require('express');
var router = express.Router();

var searchResultDbOperation=require('./model/searchResult').searchResultDbOperation
var general=require('./assist/general').general


router.get('/',function(req,res,next){
    var wd=req.query.wd
    //处理关键字

    if(''===wd){
        console.log(typeof (wd))
        return res.redirect('searchPage')
    }

    return res.render('searchResult',{title:'搜索结果'})
})

module.exports = router;