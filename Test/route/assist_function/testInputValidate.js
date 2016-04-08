/**
 * Created by wzhan039 on 2016-02-29.
 */
    'use strict'
var testModule=require('../../../routes/assist_function/inputValid').inputValid;
var inputGeneral=require('../../../routes/error_define/input_validate').inputGeneral
var checkInput=testModule.checkInput;
var formatRegex=require('../../../routes/assist/globalConstantDefine').constantDefine.regex
var inputDataType=require('../../../routes/assist/enum_define/inputValidEnumDefine').enum.inputDataType
var ruleCheck=require('../../../routes/assist_function/inputValid').inputValid.ruleCheck;

var defaultGlobalSetting=require('../../../routes/inputDefine/adminLogin/defaultGlobalSetting').defaultSetting

var checkMandatoryField=function(test){
    test.expect(6);
    var adminLogin={
        checkType:{
            chineseName:'用户名',
            require:{define:true,error:{rc:8000}},
            minLength:{define:2,error:{rc:8002}},
            maxLength:{define:4,error:{rc:8004}}},
    }

    //var inputValue={checkType:{value:11}}
    var result=ruleCheck(adminLogin)
    test.equal(result.rc,inputGeneral.general.mandatoryFiledNotExist.rc,'no type check failed');

   adminLogin={
       checkChineseName:{
           type:inputDataType.string,
           require:{define:true,error:{rc:8005}},
           //minLength:{define:2,error:{rc:9006}},
           //maxLength:{define:20,error:{rc:9008}},
           format:{define:formatRegex.loosePassword,error:{rc:8010}}
       },
   }
     result=ruleCheck(adminLogin)
    //console.log(result)
    test.equal(result.rc,inputGeneral.general.mandatoryFiledNotExist.rc,'no chineseName check failed');

    adminLogin={
        checkRequire:{
            chineseName:'用户名',
            type:inputDataType.string,

        },
    }
    //var inputValue={checkRule:{value:11}}
    result=ruleCheck(adminLogin)
    test.equal(result.rc,inputGeneral.general.mandatoryFiledNotExist.rc,'no require check failed');

    adminLogin={
        checkChineseName:{
            type:inputDataType.string,
            chineseName:'用户名',
            require:{define:true,error:{rc:8005}},
            //minLength:{define:2,error:{rc:9006}},
            //maxLength:{define:20,error:{rc:9008}},
            format:{define:formatRegex.loosePassword,error:{rc:8010}}
        },
    }
    result=ruleCheck(adminLogin)
    test.equal(result.rc,0,'all mandatory filed exist check failed');

    adminLogin={
        checkChineseName:{
            type:inputDataType.string,
            chineseName:'用户名',
            require:{define:true,errr:{rc:8005}},
            //minLength:{define:2,error:{rc:9006}},
            //maxLength:{define:20,error:{rc:9008}},
            //format:{define:formatRegex.loosePassword,error:{rc:8010}}
        },
    }
    result=ruleCheck(adminLogin)
    test.equal(result.rc,inputGeneral.general.errorFieldNotDefine.rc,'error not defined check failed');

    adminLogin={
        checkChineseName:{
            type:inputDataType.string,
            chineseName:'用户名',
            require:{define:true,error:{rcd:8005}},
            //minLength:{define:2,error:{rc:9006}},
            //maxLength:{define:20,error:{rc:9008}},
            //format:{define:formatRegex.loosePassword,error:{rc:8010}}
        },
    }
    result=ruleCheck(adminLogin)
    test.equal(result.rc,inputGeneral.general.rcFieldNotDefine.rc,'rc not defined check failed');

    test.done()
}



var testRelatedFiled=function(test){
    test.expect(5);
    var adminLogin={
        checkChineseName:{
            type:inputDataType.int,
            chineseName:'用户名',
            require:{define:true,error:{rc:8005}},
            //minLength:{define:2,error:{rc:9006}},
            //maxLength:{define:20,error:{rc:9008}},
            //format:{define:formatRegex.loosePassword,error:{rc:8010}}
        },
    }
    var inputValue={needMaxLength:{value:'11'}}
    var result=ruleCheck(adminLogin)
    test.equal(result.rc,inputGeneral.general.needMin.rc,'need min check failed')
    
    adminLogin={
        checkChineseName:{
            type:inputDataType.int,
            chineseName:'用户名',
            require:{define:true,error:{rc:8005}},
            min:{define:1,error:{rc:8005}}
            //minLength:{define:2,error:{rc:9006}},
            //maxLength:{define:20,error:{rc:9008}},
            //format:{define:formatRegex.loosePassword,error:{rc:8010}}
        },
    }
    result=ruleCheck(adminLogin)
    test.equal(result.rc,inputGeneral.general.needMax.rc,'need max check failed')
    
    adminLogin={
        checkChineseName:{
            type:inputDataType.number,
            chineseName:'用户名',
            require:{define:true,error:{rc:8005}},
            //minLength:{define:2,error:{rc:9006}},
            //maxLength:{define:20,error:{rc:9008}},
            //format:{define:formatRegex.loosePassword,error:{rc:8010}}
        },
    }
    result=ruleCheck(adminLogin)
    test.equal(result.rc,inputGeneral.general.needMaxLength.rc,'need maxLength check failed')
    
    
    adminLogin={
        checkChineseName:{
            type:inputDataType.int,
            chineseName:'用户名',
            require:{define:true,error:{rc:8005}},
            min:{define:1,error:{rc:8005}},
            max:{define:10,error:{rc:8005}}
            //minLength:{define:2,error:{rc:9006}},
            //maxLength:{define:20,error:{rc:9008}},
            //format:{define:formatRegex.loosePassword,error:{rc:8010}}
        },
    }
    result=ruleCheck(adminLogin)
    test.equal(result.rc,0,'min max exist check failed')

    adminLogin={
        checkChineseName:{
            type:inputDataType.number,
            chineseName:'用户名',
            require:{define:true,error:{rc:8005}},
            //min:{define:1,error:{rc:8005}}
            maxLength:{define:10,error:{rc:8005}}
            //minLength:{define:2,error:{rc:9006}},
            //maxLength:{define:20,error:{rc:9008}},
            //format:{define:formatRegex.loosePassword,error:{rc:8010}}
        },
    }
    result=ruleCheck(adminLogin)
    test.equal(result.rc,0,'maxLength exist check failed')

    test.done()
}

var testCheckRuleDefine=function(test){
    test.expect(7);

    var adminLogin= {
        checkMaxLength: {
            chineseName: '受计划',
            type: inputDataType.string,
            require:{define:true,error:{rc:8005}},
            maxLength: {define: '1x', error: {rc: 7000}}
        },
    }
    var result=ruleCheck(adminLogin)
    test.equal(result.rc,inputGeneral.general.maxLengthDefineNotInt.rc,'maxLength should be int check failed')

    adminLogin={
        checkMinLength:{
            chineseName:'受计划',
            type:inputDataType.string,
            require:{define:true,error:{rc:8005}},
            minLength:{define:'1x',error:{rc:7000}}
        },}
    result=ruleCheck(adminLogin)
    test.equal(result.rc,inputGeneral.general.minLengthDefineNotInt.rc,'minLength should be int check failed')

    adminLogin={
        checkExactLength:{
            chineseName:'受计划',
            type:inputDataType.string,
            require:{define:true,error:{rc:8005}},
            exactLength:{define:'1x',error:{rc:7000}}
        },}
    result=ruleCheck(adminLogin)
    test.equal(result.rc,inputGeneral.general.exactLengthDefineNotInt.rc,'exactLength should be int check failed')

    adminLogin={
        checkMax:{
            chineseName:'受计划',
            type:inputDataType.int,
            require:{define:true,error:{rc:8005}},
            min:{define:1,error:{rc:7000}},
            max:{define:'1x',error:{rc:7000}}
        },}
    result=ruleCheck(adminLogin)
    test.equal(result.rc,inputGeneral.general.maxDefineNotInt.rc,'max should be int check failed')


    adminLogin={
        checkMin:{
            chineseName:'受计划',
            type:inputDataType.int,
            require:{define:true,error:{rc:8005}},
            min:{define:'1x',error:{rc:7000}},
            max:{define:2,error:{rc:7000}}
        },
    }
    result=ruleCheck(adminLogin)
    test.equal(result.rc,inputGeneral.general.minDefineNotInt.rc,'min should be int check failed')


    adminLogin={
        checkMinLength:{
            chineseName:'受计划',
            type:inputDataType.string,
            require:{define:true,error:{rc:8005}},
            minLength:{define:2,error:{rc:7000}},
            maxLength:{define:4,error:{rc:7000}}
        },}
    result=ruleCheck(adminLogin)
    test.equal(result.rc,0,'minLength maxLength are int check failed')

    adminLogin={
        checkMin:{
            chineseName:'受计划',
            type:inputDataType.int,
            require:{define:true,error:{rc:8005}},
            min:{define:1,error:{rc:7000}},
            max:{define:2,error:{rc:7000}}
        },
    }
    result=ruleCheck(adminLogin)
    test.equal(result.rc,0,'min max are int check failed')

    test.done();
}



/*          rule check              */
var testCheckInput=function(test){
    test.expect(34);
    var adminLogin={
        userName:{
            chineseName:'用户名',
            type:inputDataType.string,
            require:{define:true,error:{rc:8000}},
            minLength:{define:2,error:{rc:8002}},
            maxLength:{define:4,error:{rc:8004}}},
        password:{
            chineseName:'密码',
            type:inputDataType.string,
            require:{define:true,error:{rc:8005}},
            //minLength:{define:2,error:{rc:9006}},
            //maxLength:{define:20,error:{rc:9008}},
            format:{define:formatRegex.loosePassword,error:{rc:8010}}
        },
        repassword:{
            chineseName:'密码',
            type:inputDataType.string,
            require:{define:true,error:{rc:8005}},
            //minLength:{define:2,error:{rc:9006}},
            //maxLength:{define:20,error:{rc:9008}},
            equalTo:{define:'password',error:{rc:8010}}
        },
        mobile:{
            chineseName:'手机号',
            type:inputDataType.string,
            require:{define:false,error:{rc:8012}},
            format:{define:formatRegex.mobilePhone,error:{rc:8014}}
        },
        captcha:{
            chineseName:'验证码',
            type:inputDataType.string,
            require:{define:true,error:{rc:8024}},
            exactLength:{define:4,error:{rc:8026}}
        },

        default1:{
            chineseName:'用户名',
            default:'',
            type:inputDataType.string,
            require:{define:true,error:{rc:8030}}
        },
        default2:{
            chineseName:'用户名',
            default:'',
            type:inputDataType.string,
            require:{define:false,error:{rc:8032}}
        },
        default3:{
            chineseName:'用户名',
            default:'1',
            type:inputDataType.string,
            require:{define:true,error:{rc:8040}},
            minLength:{define:2,error:{rc:8042}},
        },
        minMaxCheck:{
            chineseName:'最大最小值检测',
            type:inputDataType.number,
            require:{define:true,error:{rc:8044}},
            maxLength:{define:2,error:{rc:8045}},
            min:{define:2,error:{rc:8046}},
            max:{define:20,error:{rc:8048}}
        },
        intCheck:{
            chineseName:'int检测',
            type:inputDataType.int,
            require:{define:true,error:{rc:8054}},
            maxLength:{define:4,error:{rc:8055}},
            min:{define:2,error:{rc:8056}},
            max:{define:20,error:{rc:8058}}
        }


    }
    var result=ruleCheck(adminLogin)
    test.equal(result.rc,0,'testCheckInput rule check failed');

    /*      inputValue不正确     */
    var inputValue={}
    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,inputGeneral.general.noValue.rc,'inputValue {} check failed');

    inputValue={userName:{}}
    result=checkInput(inputValue,adminLogin)
    //console.log(result)
    test.equal(result['userName']['rc'],adminLogin.userName.require.error.rc,'inputValue check failed');


    /*require=true, value为空*/
    inputValue={userName:{value:''}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['userName'].rc,adminLogin.userName.require.error.rc,'empty value check failed');
    inputValue={userName:{value:'           '}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['userName'].rc,adminLogin.userName.require.error.rc,'blank value check failed');
    inputValue={userName:{value:undefined}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['userName'].rc,adminLogin.userName.require.error.rc,'undefined value check failed');
    inputValue={userName:{value:null}}
    result=checkInput(inputValue,adminLogin)
    //console.log(result.rc)
    //console.log(adminLogin.userName.require.error.rc)
    test.equal(result['userName'].rc,adminLogin.userName.require.error.rc,'null value check failed');

    /*          minLength           */
    inputValue={userName:{value:'a'}}
    result=checkInput(inputValue,adminLogin)
//console.log(result)
    test.equal(result['userName'].rc,adminLogin.userName.minLength.error.rc,'minLength check failed');

    /*          maxLength           */
    inputValue={userName:{value:'12345'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['userName'].rc,adminLogin.userName.maxLength.error.rc,'maxLength check failed');
    //test.equal(result.rc,inputGeneral.general.noType.rc,'no type check failed');
    /*          format           */
    inputValue={password:{value:'11'}}
/*    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,adminLogin.password.format.error.rc,'loose format case 1 check failed');
    inputValue={password:{value:'aa'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,adminLogin.password.format.error.rc,'loose format case 2 check failed');*/
    result=checkInput(inputValue,adminLogin)
    test.equal(result['password'].rc,0,'loose format case 1 check failed');
    inputValue={password:{value:'aa'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['password'].rc,0,'loose format case 2 check failed');
    inputValue={password:{value:'1a'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['password'].rc,0,'loose format case 3 check failed');

    adminLogin.password.format.define=formatRegex.strictPassword
    inputValue={password:{value:'111111'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['password'].rc,adminLogin.password.format.error.rc,'strict format check failed');
    inputValue={password:{value:'aaaaaa'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['password'].rc,adminLogin.password.format.error.rc,'strict format check failed');
    inputValue={password:{value:'1@34asdf'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['password'].rc,0,'strict format check failed');
    /*          repassword                      */
    inputValue={password:{value:'1@34asdf'},repassword:{}}
    result=checkInput(inputValue,adminLogin)
    //console.log(result)
    test.equal(result['repassword'].rc,adminLogin.repassword.equalTo.error.rc,'repassword empty not equal to password check failed');

    inputValue={password:{value:'1@34asdf'},repassword:{value:'1@345678'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['repassword'].rc,adminLogin.repassword.equalTo.error.rc,'repassword not equal to password check failed');

    inputValue={password:{value:'1@34asdf'},repassword:{value:'1@34asdf'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['repassword'].rc,0,'repassword equal to password check failed');
    /*          手机号，require＝false       */

    adminLogin.mobile.format.define=formatRegex.mobilePhone
    inputValue={mobile:{value:''}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['mobile'].rc,0,'empty mobile check failed');
    inputValue={mobile:{value:'123456789'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['mobile'].rc,adminLogin.mobile.format.error.rc,'mobile check failed');


    /*          captcha                     */
    inputValue={captcha:{value:'1'}}
    result=checkInput(inputValue,adminLogin)
//console.log(result)
    test.equal(result['captcha'].rc,adminLogin.captcha.exactLength.error.rc,'ecaptcha check failed');
    inputValue={captcha:{value:'1adsf5'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['captcha'].rc,adminLogin.captcha.exactLength.error.rc,'ecaptcha check failed');



    /*          default1         */
    /*      require=true && default is empty && input is empty, should report require.rc since default value set to inputValue   */
    inputValue={default1:{value:''}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['default1'].rc,adminLogin.default1.require.error.rc,'default1 check failed');
    /*      require=false && default is empty && input is empty,should pass    */
    inputValue={default2:{value:''}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['default2'].rc,0,'default2 check failed');
    /*      require=true && default is 1 && input is empty && minLength is 2, should fail in minLLength check. To check default value set to inputValue     */
    inputValue={default3:{value:''}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['default3'].rc,adminLogin.default3.minLength.error.rc,'default3 check failed');
    inputValue={default3:{value:'123'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['default3'].rc,0,'default3 check failed');

    /*          min/max check           */
    inputValue={minMaxCheck:{value:1}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['minMaxCheck'].rc,adminLogin.minMaxCheck.min.error.rc,'min check failed');
    inputValue={minMaxCheck:{value:21}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['minMaxCheck'].rc,adminLogin.minMaxCheck.max.error.rc,'max check failed');
    inputValue={minMaxCheck:{value:2}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['minMaxCheck'].rc,0,'min check failed');
    inputValue={minMaxCheck:{value:20}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['minMaxCheck'].rc,0,'max check failed');
    inputValue={minMaxCheck:{value:10}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['minMaxCheck'].rc,0,'middle value check failed');

    /*          int check           */
    inputValue={intCheck:{value:10}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['intCheck'].rc,0,'int value check failed');
    inputValue={intCheck:{value:'10'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['intCheck'].rc,0,'int string value  check failed');
    inputValue={intCheck:{value:'asdf'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['intCheck'].rc,inputGeneral.general.typeWrong.rc,'int string value  check failed');



    test.done();
}

var testRealValueCheckInput=function(test){
    test.expect(1);
    /*          实际数据        */
    let inputValue={"uploadPath":{value:"h:/ss_express/ss-express/"},"maxWidth":{value:"asdf"},"maxHeight":{value:"600"},"maxSize":{value:"900"},"maxNum":{value:"5"}}
    console.log(defaultGlobalSetting.inner_image)
    let result=checkInput(inputValue,defaultGlobalSetting.inner_image)
//console.log(result)
    test.equal(result['maxWidth'].rc,inputGeneral.general.typeWrong.rc,'int string value  check failed');

    test.done();
}






var testCheckType=function(test){
    test.expect(15);
    var adminLogin= {
        needMaxLength: {
            chineseName: '受计划',
            type: inputDataType.number,
            require: {define: true,error:{rc:7000}}
        },
/*        emptyType:{
            chineseName:'用户名',
            //type:inputDataType.string,
        },*/
        typeCheckFail:{
            chineseName:'用户名',
            type:inputDataType.int,
            require:{define:true,error:{rc:8028}},
        },
        typeFile:{
            chineseName:'文件',
            type:inputDataType.file,
            require:{define:true,error:{rc:8050}},
            maxLength:{define:254,error:{rc:8042}},
        },
        typeFolder:{
            chineseName:'目录',
            type:inputDataType.folder,
            require:{define:true,error:{rc:8050}},
            maxLength:{define:1024,error:{rc:8042}},
        },
        typeNumber:{
            chineseName:'用户名',
            type:inputDataType.number,
            require:{define:true,error:{rc:8050}},
            maxLength:{define:3,error:{rc:8042}},
            format:{define:formatRegex.number}
        },
        typeDate:{
            chineseName:'用户名',
            type:inputDataType.date,
            require:{define:true,error:{rc:8050}},
            //maxLength:{define:1,error:{rc:8042}},
            //format:{define:formatRegex.number}
        },
    }




    /*          empty type            */
/*    var inputValue={emptyType:{value:'111'}}
   var result=checkInput(inputValue,adminLogin)
    test.equal(result.rc,inputGeneral.general.noType.rc,'no type check failed');*/
    /*          type int           */
    var inputValue={typeCheckFail:{value:'asdf'}}
    var result=checkInput(inputValue,adminLogin)
    test.equal(result['typeCheckFail'].rc,inputGeneral.general.typeWrong.rc,'typeCheckFail check failed');
    inputValue={typeCheckFail:{value:'11'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['typeCheckFail'].rc,0,'typeCheckFail check failed');

    /*          type file/folder        */
    //var existedFile='C:/InstallConfig.ini'
    var existedFile='C:/ClientInstallInfo.txt'
    var existedFolder='C:/'
    var notExistFile='c:/asdv'
    var notExistFolder='ZZ:/'

    inputValue={typeFile:{value:existedFolder}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['typeFile'].rc,inputGeneral.general.typeWrong.rc,'typeFile check failed');
    inputValue={typeFile:{value:existedFile}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['typeFile'].rc,0,'typeFile check failed');

    inputValue={typeFolder:{value:existedFile}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['typeFolder'].rc,inputGeneral.general.typeWrong.rc,'typeFolder check failed');
    inputValue={typeFolder:{value:existedFolder}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['typeFolder'].rc,0,'typeFolder check failed');

    inputValue={typeFolder:{value:notExistFolder}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['typeFolder'].rc,inputGeneral.general.typeWrong.rc,'typeFolder check failed');
    inputValue={typeFile:{value:notExistFile}}
    result=checkInput(inputValue,adminLogin)
//console.log(result)
    test.equal(result['typeFile'].rc,inputGeneral.general.typeWrong.rc,'typeFolder check failed');
    /*          type number        */
    inputValue={typeNumber:{value:'1x'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['typeNumber'].rc,inputGeneral.general.typeWrong.rc,'non number check failed');
    //check maxLength first
    inputValue={typeNumber:{value:'111x'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['typeNumber'].rc,adminLogin.typeNumber.maxLength.error.rc,'non number check failed');
    inputValue={typeNumber:{value:11}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['typeNumber'].rc,0,'number check failed');

    /*          type date        */
    inputValue={typeDate:{value:'2013-02-29'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['typeDate'].rc,inputGeneral.general.typeWrong.rc,'date 2013-02-29 check failed');
    inputValue={typeDate:{value:'9999-99-99'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['typeDate'].rc,inputGeneral.general.typeWrong.rc,'date 9999-99-99 check failed');
    inputValue={typeDate:{value:'1234-0-2'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['typeDate'].rc,inputGeneral.general.typeWrong.rc,'date 1234-0-2 check failed');
    inputValue={typeDate:{value:'1980-02-21'}}
    result=checkInput(inputValue,adminLogin)
    test.equal(result['typeDate'].rc,0,'date 1980-02-21 check failed');

    test.done()
}

var testCheckActualRule=function(test){
    test.expect(11);

    for(let item in defaultGlobalSetting){
        let result=ruleCheck(defaultGlobalSetting[item])
        //console.log(result)
        test.equal(result.rc,0,'global setting check failed');
    }



    test.done()

}

exports.test={
    checkMandatoryField:checkMandatoryField,
    testRelatedFiled:testRelatedFiled,
    testCheckRuleDefine:testCheckRuleDefine,
    testCheckInput:testCheckInput,
    testRealValueCheckInput:testRealValueCheckInput,
    testCheckType:testCheckType,
    testCheckActualRule:testCheckActualRule,

}

