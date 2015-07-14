/**
 * Created by ada on 2015/5/30.
 */
var express = require('express');
var router = express.Router();


router.get('/',function(req,res,next){
    if(undefined===req.session.state){req.session.state=2}

    res.render('main');
})

router.post('/',function(req,res,next){
    if(undefined===req.session.state || (1!=req.session.state && 2!=req.session.state)){
        res.json({rc:2,msg:'请重新载入页面'});
        return;
    }
    var result={
        lastWeekCollect:{},
        lastWeekClick:{},
        latestArticle:{}
    };
    res.render('main');
})
module.exports = router;
