/**
 * Created by ada on 2015/7/5.
 */
var testModule=require('../express_component/regex');



exports.testRegex=function(test){
    test.expect(4);

    var str='<';
    var result=testModule.check(str,'singleSpecialChar');
    //test.equal(result,'&#160;&#0x60;&#0x62;&#0x38;&#0x34;&#0x169;&#0x174;&#0x8482;&#0x215;&#0x247;','encode special html char failed');
    test.equal(result,true,'reg single special charecter failed');

    var str='<img src="http://localhost:3000/test/adf/png"> <a href="https://www.baidu.com/test.png"></a>';
    var result=testModule.check(str,'hosts');
    //test.equal(result,'&#160;&#0x60;&#0x62;&#0x38;&#0x34;&#0x169;&#0x174;&#0x8482;&#0x215;&#0x247;','encode special html char failed');
    test.equal(result.toString(),[ 'http://localhost:3000/test', 'https://www.baidu.com/test.png'].toString(),'reg hosts failed');

    str='https://www.baidu.com/test/test.png/'
    var result=testModule.check(str,'host');
    test.equal(result,false,'reg host 1 failed');//the host is not website host(http2://www.baidu.com != http://localhost:3000

    str='http://localhost:3000/test/'
    var result=testModule.check(str,'host');
    test.equal(result,true,'reg host 2 failed');

    test.done();
}
