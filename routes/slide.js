/**
 * Created by wzhan039 on 2016-04-26.
 */
'use strict'
var express = require('express');
var router = express.Router();
router.get("/",function(req,res,next){
    res.render('slide',{title:'首页',year:new Date().getFullYear()})
})
module.exports = router;
