/**
 * Created by zw on 2015/6/15.
 */
var testModule=require('../express_component/captcha');
exports.testCaptcha=function(test){
    var result=testModule.awesomeCaptcha({fontSize:32},function(err,data){})

    test.ok(result,{},'param not set to default value correctly')
    test.done();
}