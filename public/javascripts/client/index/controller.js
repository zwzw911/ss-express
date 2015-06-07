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

indexApp.factory('userExistServiceHttp',function($http){

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
    return {checkUser:checkUser};
});

indexApp.controller('LoginController',function($scope,$filter,userExistServiceHttp,$window,$location){
    var inputInitSetting={value:'',blur:false,focus:true};
    var currentItem={};
    $scope.login={
        items:[
            {value:'',blur:false,focus:true,itemName:"name",itemType:"text",itemIcon:"fa-user",itemClass:"",itemLabelName:"用户名",required:true,minLength:"2",maxLength:"20",itemExist:false},
            {value:'',blur:false,focus:true,itemName:"password",itemType:"password",itemIcon:"fa-lock",itemClass:"",itemLabelName:"密码",required:true,minLength:"2",maxLength:"20",itemExist:false}

        ],
        captcha: {value:'',blur:false,focus:true,itemName:"captcha",itemClass:'',required:true,minLength:4,maxLength:4,itemExist:false},
        wholeMsg:{msg:'',show:false}
    }
    $scope.inputBlurFocus=function(currentItem,blurValue,focusValue) {
        //currentItem=$scope.login.items[index];

        currentItem.blur=blurValue;
        currentItem.focus=focusValue;
        if(blurValue) {
            //console.log(currentItem.itemName);
            //currentItem.value='asadf';
            var validateResult=JSON.stringify($scope.form_login.name.$error);
            if (validateResult==="{}" ) {
                currentItem.itemClass="has-success";
            }else{
                currentItem.itemClass="has-error";
            }
        };
        if(focusValue){
            currentItem.itemClass="";
        }
    }
    $scope.checkUser=function(userName){
        //console.log(userExistServiceHttp.checkUser(userName));
        //userExistServiceHttp.checkUser(userName);
        //userExistServiceHttp.checkUser(userName);
        //console.log(userExistServiceHttp.data);
        var service=userExistServiceHttp.checkUser(userName);
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

});

//var indexService=angular.module('indexService',[]);
//indexService.factory('userUniqueService',function(){
//    var inputBlurFocus= function($scope,index,blurValue,focusValue)
//    {
//        currentItem=$scope.login.items[index];
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