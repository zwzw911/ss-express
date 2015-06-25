/**
 * Created by ada on 2015/5/23.
 */
var indexApp=angular.module('indexApp',['ngMessages','restangular','ngCookies']);
//indexApp.config(function(RestangularProvider){
//    //RestangularProvider.setBaseUrl()''
//});

//indexApp.factory('userExistService',['Restangular',function(Restangular){
//    var user=Restangular.one('/checkUser');
//
//    var checkUser=function(userName)
//    {
//        var newUserName={name:userName};//POST的参数必须是 对象
//        user.post(newUserName).then(function(res)
//        {
//
//            console.log(res);
//            //return res;
//        }
//        ,
//        function (err) {
//            console.log(err);
//        }
//        )
//    };
//    return {checkUser:checkUser};
//}]);

indexApp.factory('userServiceHttp',function($http){

    var returnData;
    var checkUser=function(userName)
    {
        //$http({
        //    method:"POST",
        //    url:'/checkUser',
        //    params:{name:userName}
        //})

        return $http.post('/checkUser',{name:userName},{})
        //).success(function(data,status,header,config){
        //        returnData=data;
        //        return returnData;
        //}).error(function(data,status,header,config){
        //
        //});
        //return returnData;
        //var newUserName={name:userName};//POST的参数必须是 对象
        //user.post(newUserName).then(function(res)
        //    {
        //
        //        console.log(res);
        //        //return res;
        //    }
        //    ,
        //    function (err) {
        //        console.log(err);
        //    }
        //)
    };
    var loginUser=function(userName, userPwd,captcha){
        return $http.post('/login',{name:userName,pwd:userPwd,captcha:captcha},{});
    }
    return {checkUser:checkUser,login:login};
});
indexApp.factory('regenCaptchaService',function($http){
    var regen=function(){
        return $http.post('/regen_captcha',{});
    }
    return ({regen:regen})
})
indexApp.controller('LoginController',function($scope,$cookies,$cookieStore,$filter,userServiceHttp,regenCaptchaService,$window,$location){
    var inputInitSetting={value:'',blur:false,focus:true};
    var currentItem={};

    $scope.login={
        items:[
            {value:'',blur:false,focus:true,itemName:"name",itemType:"text",itemIcon:"fa-user",itemClass:"",itemLabelName:"用户名",required:true,minLength:"2",maxLength:"20",itemExist:false,valid:false,invalid:false},//set bot valid and invalid as init state of glyphicon-ok and glyphicon-remove
            {value:'',blur:false,focus:true,itemName:"password",itemType:"password",itemIcon:"fa-lock",itemClass:"",itemLabelName:"密码",required:true,minLength:"2",maxLength:"20",itemExist:false,valid:false,invalid:false}

        ],
        captcha: {value:'',blur:false,focus:true,itemName:"captcha",itemClass:'',required:true,minLength:4,maxLength:4,itemExist:false,valid:false,invalid:false},
        wholeMsg:{msg:'',show:false},
        captchaUrl:''
        
    }
    $cookieStore.put('ememberMe','test')
    //console.log($cookies.rememberMe);
    //$cookies.rememberMe=1
/*    if(undefined!=$cookies.rememberMe){
        $scope.login.items[0].value=$cookies.rememberMe
    }*/

    $scope.inputBlurFocus=function(currentItem,blurValue,focusValue) {
        //currentItem=$scope.login.items[login];

        currentItem.blur=blurValue;
        currentItem.focus=focusValue;
        if(blurValue) {
            //console.log(currentItem.itemName);
            //currentItem.value='asadf';
            var validateResult=JSON.stringify($scope.form_login.name.$error);
            if (validateResult==="{}" ) {
                currentItem.itemClass="has-success";
                currentItem.valid=true;//if the input content is validate
                currentItem.invalid=false;
            }else{
                currentItem.itemClass="has-error";
                currentItem.valid=false;
                currentItem.invalid=true;
            }
            if('name'===currentItem.itemName){
                $scope.checkUser();
            }
        };
        if(focusValue){
            currentItem.itemClass="";
        }
    }
    // $scope.allValidate=function(){//检查是不是所有的输入字段都valid了
    //     return $scope.login.items[0].valid && $scope.login.items[1].valid && $scope.captcha.valid
    // }
    $scope.checkUser=function(){
        //console.log(userExistServiceHttp.checkUser(userName));
        //userExistServiceHttp.checkUser(userName);
        //userExistServiceHttp.checkUser(userName);
        //console.log(userExistServiceHttp.data);
        var userName=$scope.login.items[0].value;
        var service=userServiceHttp.checkUser(userName);
        service.success(function(data,status,header,config){
            console.log('success');
            if(data.rc===0){
                $scope.login.items[0].itemExist=data.exists;
                if(data.exists){
                    $scope.login.wholeMsg.msg="";
                    $scope.login.wholeMsg.show=false;
                }else{
                    $scope.login.wholeMsg.msg="用户名或密码错误";
                    $scope.login.wholeMsg.show=true;
                }
            }else{
                //console.log('redirect');
                $window.location.href=data.newurl;
                //window.location.href='/users/api';
            }

        })
        //if(data.rc===0){
        //    if(data.exists){
        //        $scope.items[0].exists=true;
        //    }
        //}
    }
    $scope.loginUser=function(){
        var service=userServiceHttp.loginUser($scope.login.items[0].value,$scope.login.items[1].value,$scope.captcha.value);
        service.success(function(data,status,header,config){
            if(0===data.rc){
                $window.location.href=data.newurl;//添加成功，页面跳转
            }else{
                //显示错误
            }
        })
    }
    $scope.regen=function(){
        //console.log('client');
        var func_regen=regenCaptchaService.regen();
        func_regen.success(function(data,status,header,config){
            $scope.captchaUrl=data.url;
        })
    }
});

//var indexService=angular.module('indexService',[]);
//indexService.factory('userUniqueService',function(){
//    var inputBlurFocus= function($scope,login,blurValue,focusValue)
//    {
//        currentItem=$scope.login.items[login];
//        currentItem.blur=blurValue;
//        currentItem.focus=focusValue;
//        if(blurValue) {
//            var validateResult=JSON.stringify($scope.form_login.name.$error);
//            if (validateResult==="{}" ) {
//                currentItem.itemClass="has-success";
//            }else{
//                currentItem.itemClass="has-error";
//            }
//        };
//        if(focusValue){
//            currentItem.itemClass="";
//        }
//    };
//    return {inputBlurFocus:inputBlurFocus};
//})
//exports.indexApp=indexApp;
