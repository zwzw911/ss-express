
 /* Created by wzhan039 on 2015-09-17.
 */
'use strict';
var app=angular.module('app',['ngRoute']);
app.factory('dataService',function($http) {
 var getBasicInfo = function () {
     return $http.post('personalInfo/getBasicInfo',{},{});
 }
 var saveBasicInfo = function (userName,mobilePhone) {
     return $http.post('personalInfo/saveBasicInfo',{userName:userName,mobilePhone:mobilePhone},{});
 }
 var savePasswordInfo = function (oldPassword,newPassword,rePassword) {
     return $http.post('personalInfo/savePasswordInfo',{oldPassword:oldPassword,newPassword:newPassword,rePassword:rePassword},{});
 }
 return {getBasicInfo: getBasicInfo,saveBasicInfo:saveBasicInfo,savePasswordInfo:savePasswordInfo}
 })

app.config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider){
    $routeProvider.
        when('/personalInfo/basicInfo',{
            templateUrl:'basicInfo',
            controller:'basicInfoController'
        })
        .when('/personalInfo/passwordInfo',{
            templateUrl:'passwordInfo',
            controller:'passwordInfoController'
        })
        .otherwise({redirectTo:'/personalInfo/basicInfo'})

    $locationProvider.html5Mode(true)
}]);


app.controller('basicInfoController',['$scope','dataService','$window',function($scope,dataService,$window){
    var showErrMsg=function(msg){
        $scope.errorModal={state:'show',title:'错误',msg:msg,
            close:function(){
                this.state=''
            }
        }
    };
    $scope.edif=false
    $scope.input=[
        {labelName:'用户名',inputName:'user',curValue:'',oldValue:undefined},
        {labelName:'手机',inputName:'mobilePhone',curValue:'',oldValue:undefined}
    ]
    var service=dataService.getBasicInfo()
    service.success(function(data,status,header,config){
        if(data.rc>0){
            showErrMsg(data.msg)
            if(data.rc==40001){
//console.log(1)
                setTimeout( $window.location.href='login',3000)
            }
        }else{
            $scope.input[0].curValue=data.msg.name
            $scope.input[1].curValue=data.msg.mobilePhone
        }
    }).error(function(data,status,header,config){

    })

    //点击 保存
    $scope.saveBasicInfo=function(){
        var userName=$scope.input[0].curValue;
        var mobilePhone=$scope.input[1].curValue;
        var service=dataService.saveBasicInfo(userName,mobilePhone)
        service.success(function(data,status,header,config){
            if(data.rc>0){
                showErrMsg(data.msg)
            }else{
                $scope.edit=false
            }
        }).error(function(data,status,header,config){

        })
    }
    //点击  编辑
    $scope.editBasicInfo=function(){
        for(var i=0;i<$scope.input.length;i++){
            $scope.input[i].oldValue=$scope.input[i].curValue
        }
        $scope.edit=true
    }
    //点击 取消
    $scope.cancelBasicInfo=function(){
        for(var i=0;i<$scope.input.length;i++){
            $scope.input[i].curValue=$scope.input[i].oldValue
        }
        $scope.edit=false
    }
}]);
app.controller('passwordInfoController',['$scope','dataService',function($scope,dataService){
    var showErrMsg=function(msg){
        $scope.errorModal={state:'show',title:'错误',msg:msg,
            close:function(){
                this.state=''
            }
        }
    };
    var showSuccessMsg=function(msg){
        $scope.errorModal={state:'show',title:'信息',msg:msg,
            close:function(){
                this.state=''
            }
        }
    };
    $scope.input=[
        {labelName:'旧密码',inputName:'oldPassword',value:''},
        {labelName:'新密码',inputName:'newPassword',value:''},
        {labelName:'重复密码',inputName:'repassword',value:''}
    ]
}]);




