/**
 * Created by wzhan039 on 2016-02-29.
 */
var testModule=require('../../../routes/assist_function/inputValid').inputValid;
var inputGeneral=require('../../../routes/error_define/input_validate').inputGeneral
var checkInput=testModule.checkInput;
var formatRegex=require('../../../routes/assist/globalConstantDefine').constantDefine.regex

exports.testCheckInput=function(test){
    test.expect(18);
    var adminLogin={
        userName:{chineseItemName:'用户名',
            require:{define:true,error:{rc:8000}},
            minLength:{define:2,error:{rc:8002}},
            maxLength:{define:4,error:{rc:8004}}},
        password:{chineseItemName:'密码',
            require:{define:true,error:{rc:8005}},
            //minLength:{define:2,error:{rc:9006}},
            //maxLength:{define:20,error:{rc:9008}},
            format:{define:formatRegex.loosePassword,error:{rc:8010}}
        },
        mobile:{chineseItemName:'手机号',
            require:{define:false,error:{rc:8012}},
            format:{define:formatRegex.mobilePhone,error:{rc:8014}}
        },
        captcha:{chineseItemName:'验证码',
            require:{define:true,error:{rc:8024}},
            exactLength:{define:4,error:{rc:8026}}
        }
    }

    /*      inputValue不正确     */
    var inputValue={}
    var result=checkInput(inputValue,adminLogin)
    //console.log(result)
    test.equal(result.rc,inputGeneral.general.noValue.rc,'inputValue {} check failed');
    inputValue={userName:{}}
    result=checkInput(inputValue,adminLogin)
    //console.log(result)
    test.equal(result.rc,adminLogin.userName.require.error.rc,'inputValue check failed');

    /*require=true, value为空*/
    inputValue={userName:{value:''}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,adminLogin.userName.require.error.rc,'empty value check failed');
    inputValue={userName:{value:'           '}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,adminLogin.userName.require.error.rc,'blank value check failed');
    inputValue={userName:{value:undefined}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,adminLogin.userName.require.error.rc,'undefined value check failed');
    inputValue={userName:{value:null}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,adminLogin.userName.require.error.rc,'null value check failed');

    /*          minLength           */
    inputValue={userName:{value:'a'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,adminLogin.userName.minLength.error.rc,'minLength check failed');

    /*          maxLength           */
    inputValue={userName:{value:'12345'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,adminLogin.userName.maxLength.error.rc,'maxLength check failed');

    /*          format           */
    inputValue={password:{value:'11'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,adminLogin.password.format.error.rc,'loose format check failed');
    inputValue={password:{value:'aa'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,adminLogin.password.format.error.rc,'loose format check failed');
    inputValue={password:{value:'1a'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,0,'loose format check failed');

    adminLogin.password.format.define=formatRegex.strictPassword
    inputValue={password:{value:'111111'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,adminLogin.password.format.error.rc,'strict format check failed');
    inputValue={password:{value:'aaaaaa'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,adminLogin.password.format.error.rc,'strict format check failed');
    inputValue={password:{value:'1@34asdf'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,0,'strict format check failed');

    /*          手机号，require＝false       */
    adminLogin.password.format.define=formatRegex.mobilePhone
    inputValue={mobile:{value:''}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,0,'empty mobile check failed');
    inputValue={mobile:{value:'123456789'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,adminLogin.mobile.format.error.rc,'mobile check failed');


    /*          captcha                     */
    inputValue={captcha:{value:'1'}}
    result=checkInput(inputValue,adminLogin)
//console.log(result)
    test.equal(result.rc,8026,'ecaptcha check failed');
    inputValue={captcha:{value:'1adsf5'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,8026,'ecaptcha check failed');
    test.done();
}
