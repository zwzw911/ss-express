/**
 * Created by wzhan039 on 2016-04-26.
 */
'use strict'
var express = require('express');
var router = express.Router();

var generalFunc=require('./express_component/generalFunction').generateFunction
router.get("/",function(req,res,next){
    res.render('notLogin',{title:'尚未登录',year:new Date().getFullYear()})
})

/*router.get("/redirect",function(req,res,next){
    let referer=req.get('Referer')
    let page=''
    if(undefined!==referer && ''!==referer){
        let tmp=referer.split('/')
        page=tmp[tmp.length-1]
    }
/!*    res.set({
        Referer:generalFunc.generateReferer(page)
    })
    res.redirect(301,'../login');*!/
    return res.json(generalFunc.generateReferer(page))
})*/
module.exports = router;
