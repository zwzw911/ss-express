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

indexApp.controller('LoginController',function($scope,$filter,userExistServiceHttp){
    var inputInitSetting={value:'',blur:false,focus:true};
    var currentItem={};
    $scope.login={
        items:[
            {value:'',blur:false,focus:true,itemName:"name",itemType:"text",itemIcon:"fa-user",itemClass:"",itemLabelName:"用户名",required:true,minLength:"2",maxLength:"20",itemExist:false},
            {value:'',blur:false,focus:true,itemName:"password",itemType:"password",itemIcon:"fa-lock",itemClass:"",itemLabelName:"密码",required:true,minLength:"2",maxLength:"20",itemExist:false}
        ]}
    $scope.inputBlurFocus=function(index,blurValue,focusValue) {
        currentItem=$scope.login.items[index];
        currentItem.blur=blurValue;
        currentItem.focus=focusValue;
        if(blurValue) {
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
            if(data.rc===0){
                $scope.login.items[0].itemExist=data.exists;
                if(data.exists){
                    $scope.login.items[0].itemClass="has-error";
                }else{
                    $scope.login.items[0].itemClass="has-success";
                }
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