/**
 * Created by wzhan039 on 2015-06-25.
 */
    //var errorMsg=require('../routes/assist/input_error').registerLoginErrorMsg;
var app=angular.module('app',['inputDefineApp','generalFuncApp']);
app.factory('checkUserService',function($http){
    var checkUser=function(userName){
        return $http.put('register/checkUser',{name:userName},{})
    }
    var checkMobilePhone=function(phone){
        return $http.put('register/checkPhone',{name:phone},{})
    }
    var addUser=function(userName,password,repassword){
        return $http.post('register/addUser',{name:userName,password:password,repassword:repassword},{})
    }
    return {checkUser:checkUser,checkMobilePhone:checkMobilePhone,addUser:addUser}
})

app.controller('RegisterController',function($scope,checkUserService,$window,inputDefine,func){
   $scope.commonItems=[
       {name:'name',type:'text',value:'',itemLabelName:"用户名",blur:false,focus:true,valid:undefined,msg:""},
       {name:'password',type:'password',value:'',itemLabelName:"密码",blur:false,focus:true,valid:undefined,msg:""},
       {name:'repassword',type:'password',value:'',itemLabelName:"重复密码",blur:false,focus:true,valid:undefined,msg:""}
   ];
    $scope.vendorItems=[
        {name:'name',type:'text',value:'',itemClass:"",itemLabelName:"用户名",required:true,minLength:2,maxLength:20,blur:false,focus:true,valid:false,invalid:false,msg:"",msgShow:false},
        {name:'password',type:'password',value:'',itemClass:"",itemLabelName:"密码",required:true,minLength:2,maxLength:20,blur:false,focus:true,valid:false,invalid:false,msg:"",msgShow:false},
        {name:'repassword',type:'password',value:'',itemClass:"",itemLabelName:"重复密码",required:true,minLength:2,maxLength:20,blur:false,focus:true,valid:false,invalid:false,msg:"",msgShow:false},
        {name:'mobilePhone',type:'text',value:'',itemClass:"",itemLabelName:"手机号",required:true,minLength:11,maxLength:13,blur:false,focus:true,valid:false,invalid:false,msg:"",msgShow:false}
    ];

    $scope.items=$scope.commonItems;

    $scope.inputFocusBlur=function(currentItem,focus,blur){
        currentItem.blur=blur;
        currentItem.focus=focus;

        //if(focus){
        //    currentItem.itemClass = "";
            //icon
            currentItem.valid = undefined;
            //currentItem.invalid = false;
            //init error msg(exclude ngMessages,like server side and repassword)
            currentItem.msg="";
            //currentItem.msgShow=false;
        //}

        //client side(ngMessages)
        if(blur) {
            var validateResult;
            switch (currentItem.name){
                case 'name':
                    validateResult=JSON.stringify($scope.form_register.name.$error);
                    break;
                case 'password':
                    validateResult=JSON.stringify($scope.form_register.password.$error);
                    break;
                case 'repassword':
                    validateResult=JSON.stringify($scope.form_register.repassword.$error);
                    break;
                case 'mobilePhone':
                    validateResult=JSON.stringify($scope.form_register.mobilePhone.$error);
                    break;
            }
            //console.log(currentItem)
            //console.log($scope.form_register.name.$error)
            //console.log($scope.form_register.{{currentItem.name}})
            if (validateResult != "{}") {
                //currentItem.itemClass = "has-error";
                currentItem.valid = false;
                //currentItem.invalid = true;
                return false;
            }

            //currentItem.itemClass = "has-success";
            currentItem.valid = true;//if the input content is validate
            //currentItem.invalid = false;
            /*since use ng-repeat, so item check should place in blur instead of single function*/
            //check user valid
            if('name'===currentItem.name){
                var userName=currentItem.value;
                var service=checkUserService.checkUser(userName);
                service.success(function(data,status,header,config){
                    //console.log('success');
                    if(data.rc!=0) {
                        currentItem.valid = false;
                        //currentItem.invalid = true;
                        //currentItem.itemClass="has-error";
                        currentItem.msg = data.msg;
                        //currentItem.msgShow = true;
                    }
                })
            }
            //check if password contain HanZ
            if('password'===currentItem.name){
                if(!inputDefine.user.password.type.define.test(currentItem.value)){
                    currentItem.valid = false;
                    //currentItem.invalid = true;
                    //currentItem.itemClass="has-error";
                    //currentItem.msg="密码不能包含汉字"
                    currentItem.msg=inputDefine.user.password.type.msg;
                    //currentItem.msgShow=true;
                /*var pattern=/^[A-Za-z0-9\~\\!\@\#\$\%\^\&\*\)\(\_\+\=\-\`\}\{\:\"\|\?\>\<\,\./;'\\\[\]]$/
                for (var i=0;i<currentItem.value.length;i++){
                    if(currentItem.value.charCodeAt(i)>255 || false===pattern.test(currentItem.value[i]) ){
                        currentItem.valid = false;
                        currentItem.invalid = true;
                        currentItem.itemClass="has-error";
                        //currentItem.msg="密码不能包含汉字"
                        currentItem.msg='密码由2到20个字母、数字和特殊符号组成';
                        currentItem.msgShow=true;
                    }
                */}
            }
            //check if repassword equal to password
            if('repassword'===currentItem.name){
                //console.log(currentItem.value)
                //console.log($scope.items[1].value)
                if(''===currentItem.value){
                    currentItem.valid = false;
                }
                if(currentItem.value!=$scope.items[1].value){
                    currentItem.valid = false;
                    //currentItem.invalid = true;
                    //currentItem.itemClass="has-error";
                    currentItem.msg=inputDefine.user.rePassword.equal.msg
                    //currentItem.msgShow=true;
                }
            }
/*            //check if mobilePhone OK
            if('mobilePhone'===currentItem.name){
                //console.log(currentItem.value)
                //console.log($scope.items[1].value)
                var pattern=/\d{11}/

                if(pattern.test(currentItem.value)){
                    currentItem.valid = false;
                    currentItem.invalid = true;
                    currentItem.itemClass="has-error";
                    currentItem.msg="手机号码不正确"
                    currentItem.msgShow=true;
                }
            }*/
        }


        //if('name'===currentItem.itemName){
        //    $scope.checkUser();
        //}
    };
    $scope.addUser=function(){
        //console.log('te')
        $scope.commonItems.forEach(function(e){
            if(false==e.valid){
                return false
            }
        })
        var userName=$scope.items[0].value;
        var password=$scope.items[1].value;
        var repassword=$scope.items[2].value;
        var service=checkUserService.addUser(userName,password,repassword);
        service.success(function(data,status,header,config){
            //console.log('1te')
            if(0===data.rc){
                $window.location.href='/main';
            }else{
                $scope.errorModal=func.showErrMsg(data.msg)
                //console.log($scope.errorModal)
            }
        })
    }
/*    $scope.checkUser=function(){
        //init user state(server side)
        $scope.items[0].msg=""
        $scope.items[0].msgShow=false;

        var userName=$scope.items[0].value;
        var service=userServiceHttp.checkUser(userName);
        service.success(function(data,status,header,config){
            //console.log('success');
            if(data.rc!=0) {

                $scope.items[0].msg = "用户名已经存在";
                $scope.items[0].msghow = true;

            }
        })
    };*/
});