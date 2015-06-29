/**
 * Created by wzhan039 on 2015-06-25.
 */
var app=angular.module('app',[]);
app.factory('checkUserService',function($http){
    var checkUser=function(userName){
        return $http.post('login/checkUser',{name:userName},{})
    }
    var checkMobilePhone=function(phone){
        return $http.post('login/checkPhone',{name:phone},{})
    }
    return {checkUser:checkUser,checkMobilePhone:checkMobilePhone}
})

app.controller('registerController',function($scope){
   $scope.commonItems=[
       {name:'name',type:'text',value:'',itemClass:"",itemLabelName:"用户名",required:true,minlength:2,maxlength:20,validate:false},
       {name:'password',type:'text',value:'',itemClass:"",itemLabelName:"密码",required:true,minlength:2,maxlength:20,validate:false},
       {name:'re-password',type:'text',value:'',itemClass:"",itemLabelName:"重复密码",required:true,minlength:2,maxlength:20,validate:false}
   ]
    $scope.vendorItems=[
        {name:'name',type:'text',value:'',itemClass:"",itemLabelName:"用户名",required:true,minlength:2,maxlength:20,validate:false},
        {name:'password',type:'text',value:'',itemClass:"",itemLabelName:"密码",required:true,minlength:2,maxlength:20,validate:false},
        {name:'re-password',type:'text',value:'',itemClass:"",itemLabelName:"重复密码"required:true,minlength:2,maxlength:20,validate:false},
        {name:'mobilePhone',type:'text',value:'',itemClass:"",itemLabelName:"手机号"required:true,minlength:11,maxlength:13,validate:false}
    ]

    $scope.inputFocusBlur=function(currentItem,focus,blur){
        var validateResult=JSON.stringify(form_register.name.$error);
        if({}===validateResult){
            currentItem.itemClass="has-success";
            currentItem.validate=true;
        }else{
            currentItem.itemClass="has-error";
            currentItem.validate=false;
        }
    }
})