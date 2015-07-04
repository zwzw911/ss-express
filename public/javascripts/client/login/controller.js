/**
 * Created by ada on 2015/5/23.
 */
var indexApp=angular.module('indexApp',['ngMessages','restangular']);
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
    /*var checkUser=function(userName)
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
    };*/
    var loginUser=function(userName, userPwd,captcha,rememberMe){
        return $http.post('/loginUser',{name:userName,pwd:userPwd,captcha:captcha,rememberMe:rememberMe},{});
    }
    //return {checkUser:checkUser,login:login};
    return {loginUser:loginUser};
});
indexApp.factory('regenCaptchaService',function($http){
    var regen=function(){
        return $http.post('/regen_captcha',{});
    }
    return ({regen:regen})
})
indexApp.controller('LoginController',function($scope,$filter,userServiceHttp,regenCaptchaService,$window,$location){
    var inputInitSetting={value:'',blur:false,focus:true};
    var currentItem={};

    $scope.login={
        items:[
            {value:'',blur:false,focus:true,itemName:"name",itemType:"text",itemIcon:"fa-user",itemClass:"",itemLabelName:"用户名",required:true,minLength:"2",maxLength:"20",itemExist:false,valid:false,invalid:false,msg:"",msgShow:false},//set bot valid and invalid as init state of glyphicon-ok and glyphicon-remove
            {value:'',blur:false,focus:true,itemName:"password",itemType:"password",itemIcon:"fa-lock",itemClass:"",itemLabelName:"密码",required:true,minLength:"2",maxLength:"20",itemExist:false,valid:false,invalid:false,msg:"",msgShow:false}

        ],
        captcha: {value:'',blur:false,focus:true,itemName:"captcha",itemClass:'',required:true,minLength:4,maxLength:4,itemExist:false,valid:false,invalid:false,msg:"",msgShow:false},
        //rememberMe:{},
        wholeMsg:{msg:'',show:false},

        captchaUrl:''
        //rememberMe:

    }
    //console.log($scope.login.rememberMe)
    //console.log($scope.login.rememberMe)
    //$cookieStore.put('ememberMe','test')
    //console.log($cookies.rememberMe);
    //$cookies.rememberMe=1
/*    if(undefined!=$cookies.rememberMe){
        $scope.login.items[0].value=$cookies.rememberMe
    }*/
/*$scope.checkRememberMe=function(){
    console.log($scope.login.rememberMe)
//$scope.login.rememberMe=!$scope.login.rememberMe
}*/
    $scope.inputBlurFocus=function(currentItem,blurValue,focusValue) {
        //currentItem=$scope.login.items[login];


        currentItem.blur=blurValue;
        currentItem.focus=focusValue;

        currentItem.itemClass = "";
        //icon
        currentItem.valid = false;
        currentItem.invalid = false;
        //init error msg(exclude ngMessages,like server side and repassword)
        currentItem.msg="";
        currentItem.msgShow=false;

        if(blurValue) {
            //console.log(currentItem.itemName);
            //currentItem.value='asadf';
            var validateResult;
            switch (currentItem.itemName){
                case 'name':
                    validateResult=JSON.stringify($scope.form_login.name.$error);
                    break;
                case 'password':
                    validateResult=JSON.stringify($scope.form_login.password.$error);
                    break;
                case 'captcha':
                    validateResult=JSON.stringify($scope.form_login.captcha.$error);
                    break;
            }
            if (validateResult==="{}" ) {
                currentItem.itemClass="has-success";
                currentItem.valid=true;//if the input content is validate
                currentItem.invalid=false;
            }else{
                currentItem.itemClass="has-error";
                currentItem.valid=false;
                currentItem.invalid=true;
            }

        };

    }
    // $scope.allValidate=function(){//检查是不是所有的输入字段都valid了
    //     return $scope.login.items[0].valid && $scope.login.items[1].valid && $scope.captcha.valid
    // }

    $scope.loginUser=function(){
        /*before login, reset error msg*/
        $scope.login.items[0].msg="";
        $scope.login.items[0].msgShow=false;
        $scope.login.items[1].msg="";
        $scope.login.items[1].msgShow=false;
        $scope.login.captcha.msg="";
        $scope.login.captcha.msgShow=false;
        $scope.login.wholeMsg.msg="";
        $scope.login.wholeMsg.show=false;
        //console.log('test')
        var service=userServiceHttp.loginUser($scope.login.items[0].value,$scope.login.items[1].value,$scope.login.captcha.value,$scope.login.rememberMe);
        service.success(function(data,status,header,config){
            switch (data.rc){
                case 0:
                    $window.location.href=data.newurl;
                    break;
                case 1:
                    $scope.login.items[0].msg=data.msg;
                    $scope.login.items[0].msgShow=true;
                    break;
                case 2:
                    $scope.login.items[1].msg=data.msg;
                    $scope.login.items[1].msgShow=true;
                    break;
                case 3:
                    $scope.login.captcha.msg=data.msg;
                    $scope.login.captcha.msgShow=true;
                    $scope.captchaUrl=data.url
                    break;
                case 4://rememberMe
                    break;
                case 5:
                    $scope.login.wholeMsg.msg=data.msg;
                    $scope.login.wholeMsg.show=true;
                default:
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
