var testModule=require('../express_component/hashCrypt');

var pemFilePath='../../../other/key/key.pem';

exports.testHash=function(test){
    test.expect(6);
    var testString=['','asdfasdf',new Buffer(258,'utf8')];

    var result=testModule.hash('asdf',testString[1]);
    test.equal(result,'6a204bd89f3c8348afd5c77c717a097a','unknown hash type set to md5. failed');

    var result=testModule.hash(null,testString[1]);
    test.equal(result,'6a204bd89f3c8348afd5c77c717a097a','null hash type set to md5. failed');

    var result=testModule.hash(undefined,testString[1]);
    test.equal(result,'6a204bd89f3c8348afd5c77c717a097a','null hash type set to md5. failed');

    var result=testModule.hash('md5',testString[0]);
    test.equal(result,'d41d8cd98f00b204e9800998ecf8427e','md5 empty string. failed');

    var result=testModule.hash('md5',testString[1]);
    test.equal(result,'6a204bd89f3c8348afd5c77c717a097a','md5 asdfasdf. failed');

    var result=testModule.hash('md5',testString[2]);
    test.equal(result,false,'md5 long string. failed');
    test.done();
}

exports.testHmac=function(test){
    test.expect(4);
    var testString=['','asdfasdf',new Buffer(258,'utf8')];
    var result=testModule.hmac('xxxx','',pemFilePath);
    //console.log(result);
    test.equal(result,'2391c9eeff8b6baa1595e930716c99cb','unknown hash type set to md5+hmac+empty string. failed');

    var result=testModule.hmac('md5',testString[0],pemFilePath);
    test.equal(result,'2391c9eeff8b6baa1595e930716c99cb','hmca+md5+empty string. failed');

    var result=testModule.hmac('md5',testString[1],pemFilePath);
    test.equal(result,'1b7b21fa988f0c2081653e77fe3654eb','md5 asdfasdf. failed');

    var result=testModule.hmac('md5',testString[2],pemFilePath);
    test.equal(result,false,'too long string. failed');

    test.done();
}

exports.cryptDecrypt=function(test){
    test.expect(8);
    var testString=['','asdfasdf',new Buffer(258,'utf8')];

    var result=testModule.crypt('xxxx','',pemFilePath);
    //console.log(result);
    test.equal(result,'080b1222760d10ee','unknown cipher type empty string. failed');

    var result=testModule.crypt('blowfish',testString[0],pemFilePath);
    test.equal(result,'080b1222760d10ee','blowfish+empty string. failed');

    var result=testModule.crypt('blowfish',testString[1],pemFilePath);
    test.equal(result,'07959870db476d005749a3b87d56198d','cipher asdfasdf failed');

    var result=testModule.crypt('blowfish',testString[2],pemFilePath);
    test.equal(result,false,'too long string. failed');



    var result=testModule.decrypt('xxxx','080b1222760d10ee',pemFilePath);
    //console.log(result);
    test.equal(result,'','unknown deCipher type empty string. failed');

    var result=testModule.decrypt('blowfish','080b1222760d10ee',pemFilePath);
    test.equal(result,'','deCipher:blowfish+empty string. failed',pemFilePath);

    var result=testModule.decrypt('blowfish','07959870db476d005749a3b87d56198d',pemFilePath);
    test.equal(result,'asdfasdf','decrypt asdfasdf. failed');

    var result=testModule.decrypt('blowfish',testString[2],pemFilePath);
    test.equal(result,false,'too long string. failed');
    test.done();
}


