/**
 * Created by ada on 2015/7/29.
 */
var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
    res.render('article_not_exist')
})
module.exports = router;
