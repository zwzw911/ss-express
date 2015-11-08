/**
 * Created by zw on 2015/11/8.
 */
var express = require('express');
var router = express.Router();
var generalFunc=require('./express_component/generalFunction').generateFunction
var general=require('./assist/general').general
var multiparty = require('multiparty');
var global=require('./error_define/global').global

router.get('/',function(req,res,next){
    if(undefined===req.session.state){req.session.state=2}
    var preResult=generalFunc.preCheck(req,false)
    if(preResult.rc>0){
        return res.json(preResult)
    }
    res.render('userIcon',{title:'首页',year:new Date().getFullYear()});
})

router.post('/userIcon/upload',function(res,req,next){
    console.log('/userIcon/upload')
})

router.post('/upload',function(req,res,next){
    console.log('upload')
    var form = new multiparty.Form({uploadDir:global.userIconUploadDir.define ,maxFilesSize:global.userIconMaxSize.define});
    console.log(form)
    form.parse(req, function (err, fields, files) {
        if(err){
            console.log(err)
        }
        var filesTmp = JSON.stringify(files, null, 2);
        var fieldsTemp = JSON.stringify(fields, null, 2);
        console.log(filesTmp)
        return res.json({rc:0})
    })
})
module.exports = router;