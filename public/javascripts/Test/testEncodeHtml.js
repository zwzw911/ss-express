/**
 * Created by ada on 2015/7/5.
 */
var testModule=require('../.././encodeHtml');



exports.testEncodeHtml=function(test){
    test.expect(1);

    var str=' <>&"©®™×÷';
    var result=testModule.encodeHtml(str);
    //test.equal(result,'&#160;&#0x60;&#0x62;&#0x38;&#0x34;&#0x169;&#0x174;&#0x8482;&#0x215;&#0x247;','encode special html char failed');
    test.equal(result,'&#160;&#60;&#62;&#38;&#34;&#169;&#174;&#8482;&#215;&#247;','encode special html char failed');

    test.done();
}
