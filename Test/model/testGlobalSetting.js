/**
 * Created by zw on 2016/2/10.
 */
var globalSetting=require('../../routes/model/CRUDGlobalSetting').globalSetting

exports.test=function(test){
    //test.expect(4);
    var result=globalSetting.setDefault
    //console.log(result)
    test.ok(result,null,'set default global setting failed')
    test.done()
}
