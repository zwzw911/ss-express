/**
 * Created by wzhan039 on 2015-06-25.
 */
var app=angular.module('app',[]);
app.controller('registerController',function($scope){
   $scope.items=[
       {name:'name',type:'text',value:'',required:true,minlength:2,maxlength:20},
       {name:'password',type:'text',value:'',required:true,minlength:2,maxlength:20},
       {name:'re-password',type:'text',value:'',required:true,minlength:2,maxlength:20}
   ]
})