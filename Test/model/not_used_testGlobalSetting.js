/**
 * Created by zw on 2016/2/10.
 */
var globalSetting=require('../../routes/model/redis/CRUDGlobalSetting').globalSetting

/*              redis 测试，直接执行node xxx.js来执行redis的操作，然后通过查看redis来判别；而不用nodeunit          */
exports.test=function(test){
    test.expect(1);
/*    var result=globalSetting.setDefault
    test.ok(result,null,'set default global setting failed')*/


    var result=globalSetting.test()
    console.log(result)
    test.equal(result,1,'test failed')
    test.done()
}
