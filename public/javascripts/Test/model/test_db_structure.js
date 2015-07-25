/**
 * Created by wzhan039 on 2015-07-24.
 */
var testModel=require('../../model/db_structure');
var uploadDefine=require('../../../../routes/assist/upload_define').uploadDefine;
var ue_config=require('../../../../routes/assist/ueditor_config').ue_config;
var async=require('async')

/*var validateInnerImage=function(valObject){
    //console.log(valObject)
    //var r;
    valObject.validate(function(err){
        console.log('err'+new Date().getMilliseconds())
        if(err){return false}else{return true}

    })
    console.log('edf'+new Date().getMilliseconds())
//return r;
}*/
/*var validateInnerImage=function(valObject,cb){
    //console.log(valObject)
    //var r;
    valObject.validate(function(err){

        if(err){cb(err, false)}else{cb(null, true)}

    })

//return r;
}*/

var validateInnerImage=function(valObject,cb){
 //console.log(valObject)
 //var r;
 valObject.validate(function(err){
     //console.log(err);
    if(err){cb(err, false)}else{cb(null, true)}

 })

 //return r;
 }
exports.test=function(test){
    test.expect(4);

    var inner_image=new testModel.innerImage();
    var result;

    async.series([
            function(cb){
                inner_image.name='1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890.png'   //name length failed
                inner_image.hashName='1234567890123456789012345678901234567890.png'
                inner_image.storePath='/dev/null'
                inner_image.size=ue_config.imageMaxSize-1
                /*    validateInnerImage(inner_image,function(err,result){
                 test.equal(result,false,'inner_image name length check failed');
                 });*/
                result=validateInnerImage(inner_image,function(err,result){
                    test.equal(result,false,'inner_image name length check failed');
                    cb(null,result)
                });
/*                validateInnerImage.validate(function(err){

                })*/
            },
            function(cb){
                inner_image.name='1234567890.png'
                inner_image.hashName='1234567890.png' //hash name length failed
                inner_image.storePath='/dev/null'
                inner_image.size=ue_config.imageMaxSize-1
                result=validateInnerImage(inner_image,function(err,result){
                    test.equal(result,false,'inner_image hashName length check failed')
                    cb(null,result)
                });
            },
            function(cb){
                inner_image.name='1234567890.png'
                inner_image.hashName='1234567890123456789012345678901234567890.png'
                inner_image.storePath='/dev/null'
                inner_image.size=ue_config.imageMaxSize+1 //hash name length failed
                result=validateInnerImage(inner_image,function(err,result) {
                    test.equal(result, false, 'inner_image size  check failed')
                    cb(null,result)
                })
            },
            function(cb){
                inner_image.name='1234567890.png'
                inner_image.hashName='1234567890123456789012345678901234567890.png' //hash name length failed
                inner_image.storePath='/dev/null'
                inner_image.size=ue_config.imageMaxSize-1
                result=validateInnerImage(inner_image,function(err,result){
                    test.equal(result,true,'inner_image all check failed')
                    cb(null,result)
                });
            },
        ],
        function(err,result){
            //console.log(result)
            test.done();
        })





/*    //test.expect(1);
    inner_image.name='12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345.png'
    inner_image.hashName='1234567890.png' //hash name length failed
    inner_image.storePath='/dev/null'
    inner_image.size=ueditor_config.imageMaxSize-1
*//*    var result=validateInnerImage(inner_image);
    test.equal(result,false,'inner_image hashName length check failed');*//*

    result=validateInnerImage(inner_image,function(err,result){
        test.equal(result,false,'inner_image hashName length check failed')

    });
    test.done();*/
/*
    inner_image.name='12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345.png'
    inner_image.hashName='1234567890.png'
    inner_image.storePath='/dev/null'
    inner_image.size=ueditor_config.imageMaxSize+1 //hash name length failed
    var result=validateInnerImage(inner_image);
    test.equal(result,false,'inner_image size  check failed');*/


}