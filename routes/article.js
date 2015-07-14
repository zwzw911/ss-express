/**
 * Created by wzhan039 on 2015-07-08.
 */
var express = require('express');
var router = express.Router();

var fsErrorMsg=require('./assist/fs_error').fsErrorMsg;
var uploadDefine=require('./assist/upload_define').uploadDefine

var multiparty = require('multiparty');
var fs = require('fs');
router.post('/upload',function(req,res,next){
   /* var count=0;
    var form = new multiparty.Form();
    // Parts are emitted when parsing the form
     form.on('part', function(part) {
     // You *must* act on the part by reading it
     // NOTE: if you want to ignore it, just call "part.resume()"

     if (!part.filename) {
     // filename is not defined when this is a field and not a file
     console.log( part);
     // ignore field's content
     part.resume();
     }

     if (part.filename) {
     // filename is defined when this is a file
     count++;
     console.log('got file named ' + part);
     console.log( part);
     // ignore file's content here
     part.resume();
     }

     part.on('error', function(err) {
     // decide what to do
     });
     });
     form.parse(req);
    var count=0;*/

    // parse a file upload
    var form = new multiparty.Form({uploadDir: 'D:/',maxFilesSize:uploadDefine.maxFileSize.define});


    form.parse(req, function (err, fields, files) {
        var filesTmp = JSON.stringify(files, null, 2);
        var fieldsTemp = JSON.stringify(fields, null, 2);
        //console.log(form.files)
        if (err) {
            var msg=''
            switch (err.status){
                case 413:
                    msg='文件超过预定义大小'
                    break
            }
            res.json({rc:err.status,msg:msg})
        } else {
            console.log('parse filetemp: ' + filesTmp);
            console.log('parse fieldsTemp: ' + fieldsTemp);

            var inputFile = files.file[0];
            var uploadedPath = inputFile.path;
            var dstPath = 'D:/' + inputFile.originalFilename;
            //重命名为真实文件名
            fs.rename(uploadedPath, dstPath, function (err) {
                if (err) {
                    console.log('rename error: ' + err);
                    res.json({rc:1})
                } else {
                    console.log('rename ok');
                    res.json({rc:0})
                }
            });
        }
    });

    return;

})
router.get('/',function(req,res,next){
    if(undefined===req.session.state){req.session.state=2}

    res.render('main_test');
})

/*router.post('/',function(req,res,next){
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
})*/
module.exports = router;
