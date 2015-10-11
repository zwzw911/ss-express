
 /* Created by wzhan039 on 2015-09-17.
 */
//'use strict';
var app=angular.module('app',['ngRoute','inputDefineApp','generalFuncApp']);

app.factory('dataService',function($http) {
//    因为toolbar属于页面，而不是某个$routeProvider对应的部分，所以需要单独的controller获得信息
var getUserInfo=function(){
    return $http.post('personalInfo',{},{});
}
 var getBasicInfo = function () {
     return $http.post('personalInfo/getBasicInfo',{},{});
 }
 var saveBasicInfo = function (userName,mobilePhone) {
     return $http.post('personalInfo/saveBasicInfo',{userName:userName,mobilePhone:mobilePhone},{});
 }
 var savePasswordInfo = function (oldPassword,newPassword,rePassword) {
     return $http.post('personalInfo/savePasswordInfo',{oldPassword:oldPassword,newPassword:newPassword,rePassword:rePassword},{});
 }
 return {getBasicInfo: getBasicInfo,saveBasicInfo:saveBasicInfo,savePasswordInfo:savePasswordInfo,getUserInfo:getUserInfo}
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

 app.controller('mainController',['dataService','$scope','func','inputDefine','$window',function(dataService,$scope,func,inputDefine,$window){
     //var service=dataService.getUserInfo()
     dataService.getUserInfo().success(function(data,status,header,config){
         if(data.rc>0){
             $scope.errorModal=func.showErrMsg(data.msg)
             //if(data.rc==40001){
             //    setTimeout( $window.location.href='login',3000)
             //}
         }else{
             //$scope.input[0].curValue=data.msg.name
             //$scope.input[1].curValue=data.msg.mobilePhone
             $scope.userInfo=data.msg.userInfo
         }
     }).error(function(data,status,header,config){

     })

     $scope.quit=function(){
         //console.log('quit')
         var quit=func.quit()
         quit.success(function(data,status,header,config){
             //console.log(1)
             if(data.rc===0){
                 //console.log(1.5)
                 $window.location.href='main'
                 //console.log(1.6)
             }
             //console.log(2)
         }).error(function(data,status,header,config){

         })
     }

     //空格分割（input）转换成+分割（URL）
     $scope.search=function(){
         //console.log($scope.searchString)
//console.log($scope.searchString,inputDefine.search.searchTotalKeyLen.define)
         var convertedString=func.convertInputSearchString($scope.searchString,inputDefine.search.searchTotalKeyLen.define)
         //console.log(convertedString)
         //搜索字符串为空，直接返回
         if(false===convertedString){
             return false
         }
         $window.location.href='searchResult?wd='+convertedString
     }
 }])
 app.controller('menuController',['$scope',function($scope){
     $scope.menuItem={
         userInfo:{active:true},
         changePassword:{active:false}
     }
    $scope.clickMenu=function(item){
        switch (item){
            case 'userInfo':
                $scope.menuItem.userInfo.active=true
                $scope.menuItem.changePassword.active=false
                break;
            case 'changePassword':
                $scope.menuItem.userInfo.active=false
                $scope.menuItem.changePassword.active=true
                break
        }

    }
 }])
app.controller('basicInfoController',['$scope','dataService','$window','inputDefine','func',function($scope,dataService,$window,inputDefine,func){

/*    var showErrMsg=function(msg){
        $scope.errorModal={state:'show',title:'错误',msg:msg,
            close:function(){
                this.state=''
            }
        }
    }*/;
    $scope.globalVar={edit:false,allValidateOK:true}//初始从db读出，为OK
    $scope.input=[
        {labelName:'用户名',inputName:'name',curValue:'',oldValue:undefined,validateOK:true},//初始从db读出，为OK
        {labelName:'手机',inputName:'mobilePhone',curValue:'',oldValue:undefined,validateOK:true}
    ]
    var service=dataService.getBasicInfo()
    service.success(function(data,status,header,config){
        if(data.rc>0){
           $scope.errorModal=func.showErrMsg(data.msg)
            if(data.rc==40001){
                setTimeout( $window.location.href='login',3000)
            }
        }else{
            $scope.input[0].curValue=data.msg.name
            $scope.input[1].curValue=data.msg.mobilePhone
            //$scope.userInfo=data.msg.userInfo
        }
    }).error(function(data,status,header,config){

    })

    //点击 保存
    $scope.saveBasicInfo=function(){
        //检测是否所有的输入都已经OK
        $scope.globalVar.allValidateOK=true;
        for(var i=0;i<$scope.input.length;i++){
            $scope.globalVar.allValidateOK=$scope.globalVar.allValidateOK && $scope.input[i].validateOK
        }
        if(!$scope.globalVar.allValidateOK){
            return false
        }
        //检测是否没有更改
        var allNotChange=true
        for(var i=0;i<$scope.input.length;i++){
           if($scope.input[i].curValue.toString()!==$scope.input[i].oldValue.toString()){
               //console.log($scope.input[i])
               allNotChange=false
               break
           }
        }
        if(allNotChange){
            $scope.globalVar.edit=false
            return true
        }
        //有更改，并且更改后数据validate，保存
        var userName=$scope.input[0].curValue;
        var mobilePhone=$scope.input[1].curValue;
        var service=dataService.saveBasicInfo(userName,mobilePhone)
        service.success(function(data,status,header,config){
            if(data.rc>0){
               $scope.errorModal=func.showErrMsg(data.msg)
            }else{
                $scope.globalVar.edit=false
            }
        }).error(function(data,status,header,config){

        })
    }
    //点击  编辑
    $scope.editBasicInfo=function(){
        for(var i=0;i<$scope.input.length;i++){
            $scope.input[i].oldValue=$scope.input[i].curValue
        }
        $scope.globalVar.edit=true
    }
    //点击 取消
    $scope.cancelBasicInfo=function(){
        for(var i=0;i<$scope.input.length;i++){
            $scope.input[i].curValue=$scope.input[i].oldValue
            $scope.input[i].errorMsg=''
            $scope.input[i].validateOK=true;
        }
        $scope.globalVar.edit=false
    }

    //输入完毕，检测输入
    $scope.checkInput=function(idx){
        //获得name，然后从根据name从inputDefine中获得对应的检查定义
        var inputName=$scope.input[idx].inputName
        var item=$scope.input[idx];
        //必须 检查
        if(inputDefine.user[inputName].require.define && (''===item.curValue || undefined===item.curValue || null===item.curValue)){
            item.errorMsg=inputDefine.user[inputName].require.msg
            item.validateOK=false
            return false
        }
        //格式检查
        if(!inputDefine.user[inputName].type.define.test(item.curValue)){
            item.errorMsg=inputDefine.user[inputName].type.msg
            item.validateOK=false
            return false
        }
        item.errorMsg=''
        item.validateOK=true
    }
}])


app.controller('passwordInfoController',['$scope','dataService','inputDefine','func',function($scope,dataService,inputDefine,func){
/*    var showErrMsg=function(msg){
        $scope.errorModal={state:'show',title:'错误',msg:msg,
            close:function(){
                this.state=''
            }
        }
    };*/
/*    var showSuccessMsg=function(msg){
        $scope.errorModal={state:'show',title:'信息',msg:msg,
            close:function(){
                this.state=''
            }
        }
    };*/
    var initState=function(){
        for(var i=0;i<$scope.input.length;i++){
            $scope.input[i].curValue='';
            $scope.input[i].errorMsg='';
            $scope.input[i].validateOK=true;
        }
        $scope.globalVar.allValidateOK=false;
    }
    $scope.globalVar={allValidateOK:false}//初始为空，所有NOK;不用edit，直接使用allValidateOK就可表示按钮胡状态
    $scope.input=[
        {labelName:'旧密码',inputName:'oldPassword',curValue:'',errorMsg:'',validateOK:true},
        {labelName:'新密码',inputName:'newPassword',curValue:'',errorMsg:'',validateOK:true},
        {labelName:'重复密码',inputName:'rePassword',curValue:'',errorMsg:'',validateOK:true}
    ]

    $scope.checkInput=function(idx){
        var item=$scope.input[idx]
//console.log(item)
        //所有的3个密码表单都不能为空
        if(inputDefine.user.password.require.define && (''===item.curValue || undefined===item.curValue || null===item.curValue)){
            item.errorMsg=inputDefine.user.password.require.msg
            item.validateOK=false
            return false
        }
        //所有的3个表单都要符合
        if(!inputDefine.user.password.type.define.test(item.curValue)){
            item.errorMsg=inputDefine.user.password.type.msg
            item.validateOK=false
            return false
        }
        //如果是 再次输入
        if(idx===2){
            var newPwdItem=$scope.input[1]
            if(item.curValue.toString()!==newPwdItem.curValue.toString()){
                item.errorMsg=inputDefine.user.rePassword.equal.msg;
                item.validateOK=false
                return false
            }
        }
        item.errorMsg=''
        item.validateOK=true;

        //check if all 3 input are OK
        for(var i=0;i<$scope.input.length;i++){
            var finalResult=true;
            var item=$scope.input[i]
            finalResult=finalResult && item.validateOK
        }
        $scope.globalVar.allValidateOK=finalResult
        return true;
    }

    $scope.savePasswordInfo=function(){
        if(!$scope.globalVar.allValidateOK){
            return false
        }
        //var oldPasswordItem=$scope.input[0]
        var newPasswordItem=$scope.input[1]
        var rePasswordItem=$scope.input[2]
        var oldPassword=$scope.input[0].curValue
        var newPassword=$scope.input[1].curValue
        var rePassword=$scope.input[2].curValue
        //console.log($scope.input)
        if(oldPassword===newPassword && (''!==oldPassword || undefined!==oldPassword || null!==oldPassword)){
            newPasswordItem.errorMsg='新旧密码不能一样';
            newPasswordItem.validateOK=false;
            return false
        }
        if(rePassword!==newPassword && (''!==newPassword || undefined!==newPassword || null!==newPassword)){
            rePasswordItem.errorMsg=inputDefine.user.rePassword.equal.msg
            rePasswordItem.validateOK=false;
            return false
        }
        var service=dataService.savePasswordInfo(oldPassword,newPassword,rePassword)
        service.success(function(data,status,header,config){
            if(data.rc===0){
                initState();
                $scope.errorModal=func.showInfoMsg('密码更改成功')
                //showSuccessMsg('密码更改成功')
                //return false
            }else{
               $scope.errorModal=func.showErrMsg(data.msg)
            }
        }).error(function(data,status,header,config){

        })
    }

    $scope.cancelPasswordInfo=function(){
        initState();
    }



}]);




