var testModule=require('../express_component/hashCrypt');


exports.testHash=function(test){
    test.expect(4);
    var testString=['','asdfasdf',new Buffer(258,'utf8')];

    var result=testModule.hash('asdf',testString[1]);
    test.equal(result,'6a204bd89f3c8348afd5c77c717a097a','unknown hash type set to md5. Pass');

    var result=testModule.hash('md5',testString[0]);
    test.equal(result,'d41d8cd98f00b204e9800998ecf8427e','md5 empty string. Pass');

    var result=testModule.hash('md5',testString[1]);
    test.equal(result,'6a204bd89f3c8348afd5c77c717a097a','md5 asdfasdf. Pass');

    var result=testModule.hash('md5',testString[2]);
    test.equal(result,false,'md5 long string. Pass');
    test.done();
}

exports.testHmac=function(test){
    test.expect(4);
    var testString=['','asdfasdf',new Buffer(258,'utf8')];

    var result=testModule.hmac('xxxx','');
    //console.log(result);
    test.equal(result,'2391c9eeff8b6baa1595e930716c99cb','unknown hash type set to md5+hmac+empty string. Pass');

    var result=testModule.hmac('md5',testString[0]);
    test.equal(result,'2391c9eeff8b6baa1595e930716c99cb','hmca+md5+empty string. Pass');

    var result=testModule.hmac('md5',testString[1]);
    test.equal(result,'1b7b21fa988f0c2081653e77fe3654eb','md5 asdfasdf. Pass');

    var result=testModule.hmac('md5',testString[2]);
    test.equal(result,false,'too long string. Pass');

    test.done();
}

