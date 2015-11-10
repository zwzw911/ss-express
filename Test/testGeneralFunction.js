/**
 * Created by zw on 2015/11/10.
 */
var testModule=require('../routes/express_component/generalFunction').generateFunction;
var runtimeNodeError=require('../routes/error_define/runtime_node_error').runtime_node_error

exports.parseGmFileSize=function(test){
    test.expect(4);

    var fileSize='900'
    var result=testModule.parseGmFileSize(fileSize);
    test.equal(JSON.stringify(result),JSON.stringify({rc:0,msg:{sizeNum:'900',sizeUnit:undefined}}),'check fileSize in byte failed');

    fileSize='1.8Ki'
    result=testModule.parseGmFileSize(fileSize);
    test.equal(JSON.stringify(result),JSON.stringify({rc:0,msg:{sizeNum:'1.8',sizeUnit:'Ki'}}),'check fileSize in Ki failed');

    fileSize='1.8Mi'
    result=testModule.parseGmFileSize(fileSize);
    test.equal(JSON.stringify(result),JSON.stringify({rc:0,msg:{sizeNum:'1.8',sizeUnit:'Mi'}}),'check fileSize in Mi failed');

    fileSize='1.8Gi'
    result=testModule.parseGmFileSize(fileSize);
    test.equal(JSON.stringify(result),JSON.stringify(runtimeNodeError.image.exceedMaxFileSize),'check fileSize in Gi failed');
    test.done();
}

exports.convertImageFileSizeToByte=function(test){
    test.expect(6);

    var sizeNum='i.9'
    var sizeUnit
    var result=testModule.convertImageFileSizeToByte(sizeNum,sizeUnit);
    test.equal(JSON.stringify(result),JSON.stringify(runtimeNodeError.image.cantParseFileSizeNum),'convert not num fileSize in byte failed');

    sizeNum='900'
    sizeUnit=undefined
    result=testModule.convertImageFileSizeToByte(sizeNum,sizeUnit);
    //console.log(JSON.stringify(result))
    test.equal(JSON.stringify(result),JSON.stringify({rc:0,msg:900}),'convert fileSize in byte failed');

    sizeNum='io.8'
    sizeUnit='Ki'
    result=testModule.convertImageFileSizeToByte(sizeNum,sizeUnit);
    test.equal(JSON.stringify(result),JSON.stringify(runtimeNodeError.image.cantParseFileSizeNum),'convert not num fileSize in Ki failed');

    sizeNum='1.8'
    sizeUnit='Ki'
    result=testModule.convertImageFileSizeToByte(sizeNum,sizeUnit);
    test.equal(JSON.stringify(result),JSON.stringify({rc:0,msg:1843}),'convert fileSize in Ki failed');

    sizeNum='1.8'
    sizeUnit='Mi'
    result=testModule.convertImageFileSizeToByte(sizeNum,sizeUnit);
    test.equal(JSON.stringify(result),JSON.stringify({rc:0,msg:1887436}),'convert fileSize in Mi failed');

    fileSize='0.99'
    sizeUnit=undefined
    result=testModule.convertImageFileSizeToByte(sizeNum,sizeUnit);
    test.equal(JSON.stringify(result),JSON.stringify({rc:0,msg:1}),'convert fileSize in Gi failed');
    test.done();
}
/*exports.convertSearchString=function(test){
    test.expect(2)

    var testString='asdf123456789009876543210';
    var result=testModule.convertSearchString(testString);
    test.equal(result,'asdf1234567890098765','convert ultra long string failed.');

    var testString='asdf+1234567890+0987654321';
    var result=testModule.convertSearchString(testString);
    test.equal(result,'asdf 1234567890','convert total long string failed.');

    test.done()
}*/
