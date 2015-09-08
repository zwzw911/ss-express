/**
 * Created by wzhan039 on 2015-09-08.
 */
var express = require('express');
var router = express.Router();


router.get('/',function(req,res,next){
    return res.render('personalInfo',{title:'用户中心'})
})
module.exports = router;
