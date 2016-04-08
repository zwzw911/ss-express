/**
 * Created by wzhan039 on 2016-04-06.
 */
    'use strict'
var testModule=require('../../routes/admin_assist_func').admin_assist_func;
var inputGeneral=require('../../routes/error_define/input_validate').inputGeneral

var intCheck=function(test){
    test.expect(4);

    let content='{"inner_image":{"uploadPath":"h:/ss_express/ss-express/","maxWidth":"asdf","maxHeight":"600","maxSize":"900","maxNum":"5"}}'

    let result=testModule.validateUploadSetting(content)
    console.log(result)
    test.equal(result.rc,inputGeneral.general.typeWrong.rc,'int check failed');

    test.done;
}

exports.test={
    intCheck:intCheck,
}
