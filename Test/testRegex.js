/**
 * Created by ada on 2015/7/5.
 */
var testModule=require('../.././regex');



exports.testRegex=function(test){
    test.expect(8);

    var str='<';
    var result=testModule.check(str,'testSingleSpecialChar');
    //test.equal(result,'&#160;&#0x60;&#0x62;&#0x38;&#0x34;&#0x169;&#0x174;&#0x8482;&#0x215;&#0x247;','encode special html char failed');
    test.equal(result,true,'reg single special charecter failed');

    str='<img src="http://localhost:3000/test/adf/png"> <a href="https://www.baidu.com/test.png"></a>';
    var result=testModule.check(str,'getHosts');
    //test.equal(result,'&#160;&#0x60;&#0x62;&#0x38;&#0x34;&#0x169;&#0x174;&#0x8482;&#0x215;&#0x247;','encode special html char failed');
    test.equal(result.toString(),[ 'http://localhost:3000/test', 'https://www.baidu.com/test.png'].toString(),'reg hosts failed');

    str='https://www.baidu.com/test/test.png/'
    var result=testModule.check(str,'testHost');
    test.equal(result,false,'reg host 1 failed');//the host is not website host(http2://www.baidu.com != http://localhost:3000

    str='http://localhost:3000/test/'
    var result=testModule.check(str,'testHost');
    test.equal(result,true,'reg host 2 failed');

    //返回文本中所有img元素
    str='http://localhost:3000/test/ <img src> <img src=""> img src <img src="local/test/asdf?test.png">  <img src="local/test/tett.png"/>  <img class="" src="d86cbf3f5c5d5c43f30d26b4ad18a8df256dee18.jpeg" alt="test">'
    var result=testModule.check(str,'getImg');
    test.equal(result.toString(),['<img src>','<img src="">','<img src="local/test/asdf?test.png">','<img src="local/test/tett.png"/>','<img class="" src="d86cbf3f5c5d5c43f30d26b4ad18a8df256dee18.jpeg" alt="test">'].toString(),'reg imgSrc failed');

    str='<img src="">';
    var result=testModule.check(str,'getImgSrc');
    test.equal(result,false,'img src is empty  failed')

    str='<img src="local/test/asdf?test.png">';
    var result=testModule.check(str,'getImgSrc');
    test.equal(result,false,'img src format wrong failed')

    str='<img class="" src="d86cbf3f5c5d5c43f30d26b4ad18a8df256dee18.jpeg" alt="test">';
    var result=testModule.check(str,'getImgSrc');
    test.equal(result,'d86cbf3f5c5d5c43f30d26b4ad18a8df256dee18.jpeg','img src format right failed')

    test.done();
}
