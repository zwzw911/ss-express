/**
 * Created by ada on 2015/5/23.
 */
var indexApp=angular.module('indexApp',['inputDefineApp','generalFuncApp']);

indexApp.factory('userServiceHttp',function($http){

    var returnData;

    var loginUser=function(userName, userPwd,captcha,rememberMe){
        return $http.post('login/loginUser',{name:userName,pwd:userPwd,captcha:captcha,rememberMe:rememberMe},{});
    }
    //return {checkUser:checkUser,login:login};
    return {loginUser:loginUser};
});

indexApp.factory('regenCaptchaService',function($http){
    var regen=function(){
        return $http.post('login/regen_captcha',{});
    }
    return ({regen:regen})
})

indexApp.controller('LoginController',function($scope,$filter,userServiceHttp,regenCaptchaService,$window,$location,inputDefine,func){
console.log($scope.rememberMe)
    var inputInitSetting={value:'',blur:false,focus:true};
    var currentItem={};


    $scope.loging=false;
    $scope.regening=false//初始时候，captcha已经生成

    $scope.login={
        items:[
            {value:'',blur:false,focus:true,itemName:"name",itemType:"text",itemIcon:"fa-user",itemLabelName:"用户名",itemExist:false,valid:undefined,msg:""},//set bot valid and invalid as init state of glyphicon-ok and glyphicon-remove
            {value:'',blur:false,focus:true,itemName:"password",itemType:"password",itemIcon:"fa-lock",itemLabelName:"密码",itemExist:false,valid:undefined,msg:""}

        ],
        captcha: {value:'',blur:false,focus:true,itemName:"captcha",itemExist:false,valid:undefined,msg:""},
        //rememberMe:{},
        wholeMsg:{msg:'',show:false},

        captchaUrl:''
        //rememberMe:true

    }

    $scope.inputBlurFocus=function(currentItem,blurValue,focusValue) {
        //currentItem=$scope.login.items[login];
        currentItem.blur=blurValue;
        currentItem.focus=focusValue;

        //currentItem.itemClass = "";
        //icon
        currentItem.valid = undefined;
        //currentItem.invalid = false;
        //init error msg(exclude ngMessages,like server side and repassword)
        currentItem.msg="";
        //currentItem.msgShow=false;

        if(blurValue) {
            //console.log(currentItem.itemName);
            //console.log(currentItem.value);

            //currentItem.value='asadf';
            //var validateResult;
            var inputName=currentItem.itemName;

             if(inputDefine.user[inputName].require.define && (undefined===currentItem.value || null===currentItem.value || ''===currentItem.value)){
                currentItem.valid=false;
                currentItem.msg=inputDefine.user[inputName].require.msg
                 //console.log(currentItem)
                return false
            }
            if(!inputDefine.user[inputName].type.define.test(currentItem.value)){
                currentItem.valid=false;
                currentItem.msg=inputDefine.user[inputName].type.msg
                return false
            }
            currentItem.valid=true;
        }



    }
    // $scope.allValidate=function(){//检查是不是所有的输入字段都valid了
    //     return $scope.login.items[0].valid && $scope.login.items[1].valid && $scope.captcha.valid
    // }

    $scope.loginUser=function(){
        /*before login, check if all input are ok*/
        //console.log($scope.login)
        if(false===$scope.login.items[0].valid || false===$scope.login.items[1].valid ||  false=== $scope.login.captcha.valid){
            $scope.errorModal=func.showErrMsg('填写的信息有误，更正后重试')
            return false
        }
        $scope.login.items[0].msg="";
        $scope.login.items[0].valid=undefined
        $scope.login.items[1].msg="";
        $scope.login.items[1].valid=undefined;
        $scope.login.captcha.msg="";
        $scope.login.captcha.valid=undefined;
        $scope.login.wholeMsg.msg="";
        $scope.login.wholeMsg.show=false;

        $scope.loging=true
        var service=userServiceHttp.loginUser($scope.login.items[0].value,$scope.login.items[1].value,$scope.login.captcha.value,$scope.rememberMe);
        service.success(function(data,status,header,config){
            if(0===data.rc){
                $scope.errorModal=func.showInfoMsg('登录成功，正在跳转')
                setTimeout(function(){
                    $window.location.href='/main';
                },500)

                return true
            }
            //name空/格式错
            if(10002==data.rc || 10004===data.rc){
                $scope.login.items[0].msg=data.msg;
                $scope.login.items[0].valid=false;
                $scope.captchaUrl=data.url
                $scope.loging=false
                return false
            }
            //pwd空/格式错
            if(10006==data.rc || 10008===data.rc){
                $scope.login.items[1].msg=data.msg;
                $scope.login.items[1].valid=false;
                $scope.captchaUrl=data.url
                $scope.loging=false
                return false
            }
            //captcha空/格式错/不正确
            if(10042==data.rc || 10044===data.rc || 40102===data.rc || 40108===data.rc){
                $scope.login.captcha.msg=data.msg;
                $scope.login.captcha.valid=false;
                $scope.captchaUrl=data.url
                $scope.loging=false
                return false
            }
            //用户名密码不匹配
            if(30018==data.rc){
                $scope.login.wholeMsg.msg=data.msg;
                $scope.login.wholeMsg.valid=false;
                $scope.captchaUrl=data.url
                $scope.loging=false
                return false
            }
            //其余剩下的错误：隐藏正在登录，显示对话框
            $scope.loging=false
            $scope.errorModal=func.showErrMsg(data.msg)
        })
    }

    $scope.regen=function(){
        //console.log('client');
        $scope.regening=true
        var func_regen=regenCaptchaService.regen();
        func_regen.success(function(data,status,header,config){
            if(data.rc===0){
                $scope.captchaUrl=data.url;
            }else{

                $scope.errorModal=func.showErrMsg(data.msg)
                //console.log($scope.errorModal)
            }
            $scope.regening=false
        })
    }
});

