/**
 * Created by wzhan039 on 2016-03-08.
 */
var testModule=require('../../../routes/assist_function/miscellaneous').func

exports.testIsEmpty=function(test){
    test.expect(6);
    var testFunc=testModule.isEmpty

    var result=testFunc({});
    test.equal(result,true,'{}  is empty, check failed')

    result=testFunc([]);
    test.equal(result,true,'[]  is empty, check failed')

    result=testFunc('   ');
    test.equal(result,true,'blank string is empty, check failed')

    result=testFunc('');
    test.equal(result,true,'\'\' is empty, check failed')

    result=testFunc();
    test.equal(result,true,'undefined is empty, check failed')

    result=testFunc(null);
    test.equal(result,true,'null is empty, check failed')
    test.done();
}

exports.testIsArray=function(test){
    test.expect(4);
    var testFunc=testModule.isArray

    var result=testFunc({});
    test.equal(result,false,'{} is not array, check failed.')

    result=testFunc([]);
    test.equal(result,true,'[] is array, check failed')

    result=testFunc('   ');
    test.equal(result,false,'blank string is not array, check failed')

    result=testFunc('');
    test.equal(result,false,'\'\' is not array, check failed')

    test.done();
}

exports.testIsDate=function(test){
    test.expect(4);

    var result=testModule.isDate('asdf');
    test.equal(result,false,'asdf check failed')

    result=testModule.isDate('2011-02-29');
    test.equal(result,false,'2011-02-29 is invalid date, check failed')

    result=testModule.isDate('2012-02-29');
    test.equal(result,true,'2012-02-29 is valid date, check failed')

    result=testModule.isDate(2012);
    test.equal(result,false,'int 2012 is invalid date, check failed')

/*    result=testModule.isDate();
    test.equal(result,false,'undefined is invalid date, check failed')

    result=testModule.isDate(null);
    test.equal(result,false,'null is invalid date, check failed')*/
    test.done();
}


