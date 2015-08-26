/**
 * Created by wzhan039 on 2015-08-25.
 */
var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
    return res.render('personalArticle',{title:'个人文档'})
})
module.exports = router;
