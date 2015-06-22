/**
 * Created by zw on 2015/6/15.
 */
var testModule=require('../express_component/awesomeCaptcha');
exports.testCaptcha=function(test){
    var result=testModule.awesomeCaptcha({},function(err,data){})

    test.ok(result,{},'param not set to default value correctly')
    test.done();
}