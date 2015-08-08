/**
 * Created by ada on 2015/8/7.
 */
var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
    res.render('error_page/article/articleNotExist')
})
module.exports = router;
