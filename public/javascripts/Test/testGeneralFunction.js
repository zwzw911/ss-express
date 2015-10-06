/**
 * Created by ada on 2015/10/6.
 */
var testModule=require('../../../routes/express_component/generalFunction').generateFunction;



exports.convertSearchString=function(test){
    test.expect(2)

    var testString='asdf123456789009876543210';
    var result=testModule.convertSearchString(testString);
    test.equal(result,'asdf1234567890098765','convert ultra long string failed.');

    var testString='asdf+1234567890+0987654321';
    var result=testModule.convertSearchString(testString);
    test.equal(result,'asdf 1234567890','convert total long string failed.');

    test.done()
}
