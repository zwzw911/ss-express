
 /* Created by wzhan039 on 2015-09-17.
 */
//'use strict';
// 创建crop和upload的factory

 //bgConver定位top/left（不包括滚动条）
 window.onscroll=function (){
     var bgCover=document.getElementById('bgCover')
     bgCover.style.top=window.scrollY+'px'
     bgCover.style.left=window.scrollX+'px'
 }
 userIconOnLoad=function(){
     $('#chooseIcon').show()
     $('#saveIcon').show()
 }
 var componentApp=angular.module('componentApp',['inputDefineApp','generalFuncApp'])
 var cropOption={
/*     //和裁剪操作有关的按钮元素
     btnId:{
         chooseImgBtnId:'chooseImg',
         cropImgBtnId:'cropImg',
     },*/
     elementId:{
         L1_origImg:'L1_origImg',
         L2_coverZone:'L2_coverZone',
         L3_cropImgBorder:'L3_cropImgBorder',
         //croppedImg:'croppedImg',
     },
     L1origImgMaxWH:{
         width:1920,
         height:1080,
     },
     L1ViewImgMaxWH:{
         width:960,
         height:768
     },
     L3BorderWidth:{
         borderLeftWidth:1,
         borderTopWidth:1,
     },
     //最终裁剪出来的图片size
     cropImgWH:{
         width:95,
         height:95,
     },
     //滚轮滚动时，WH
     zoomStep:{
         horizontal:10,//左右每边
         vertical:10,//上下每边
     },
     /*        bindedEvent:{
      zoomZone:'mousewheel DOMMouseScroll',
      moveZone:'mousemove',//bind to body, when this event binded, the choose img in L1_origImg show in L3_cropImgBorder
      cropChooseImg:'click', //bind to L3_cropImgBorder, this event define if moveZone still be binded(L3_cropImgBorder still show choosn img or not)
      }*/
 }
 componentApp.factory('cropFactory',function(Crop,asyncFunc){
     //和裁剪操作有关的按钮元素
     var btnId={
         chooseImgBtnId:'chooseImg',
         cropImgBtnId:'cropImg',
         cropImgOK:'cropImgOK',
         cropImgCancel:'cropImgCancel'
     };
     var _crop;
//var _tm
     //var _miscOption
     var service={}
/*service.setTmp=function(tmp){
    _tmp=tmp
}
     service.getTmp=function(){
         console.log(_tmp)
     }
     service.getCrop=function(){
         console.log(_crop)
     }*/
     service.createInst=function(option){
         var result
         //console.log(option)
         _crop=Crop.Create(option);
//console.log('create')
         result=_crop.loadParameter()
         //console.log(result)
         if(result.rc>0){
             alert(result.msg)
             return false
         }

         //_miscOption=miscOption
         //为按钮添加事件,ng-change不起作用
         $('#'+btnId.chooseImgBtnId).bind('change',function(e){readImg()})
         //$('#'+_crop.defaultOptions.btnId.cropImgBtnId).bind('click',function(e){_crop.allElement.croppedImg.setAttribute('src',_crop.cropGenerateDataURL())})
     }
     service.cropImg=function(){
         //crop之后才能确定
         setBtnState(btnId.cropImgOK,true)
         return _crop.cropGenerateDataURL()
     }
//service.cropImg=_crop.cropGenerateDataURL

     var setBtnState=function(btnId,enableFlag){
         //var stateChangeBtnId=[btnId.cropImgBtnId,btnId.cropImgOK]
         //for(var ele in stateChangeBtnId ){
         //stateChangeBtnId.forEach(function(ele){
             var htmlEle=document.getElementById(btnId)
             if(true===enableFlag) {
                 htmlEle.className=htmlEle.className.replace('disabled', '')
             }else{
                 htmlEle.className+= ' disabled'
             }
         //})
     }
     var readImg=function () {
         //console.log('readImg')
         return asyncFunc.readFile(btnId.chooseImgBtnId,'dataURL',20000000).then(
             function(data) {
                 var img = document.getElementById(_crop.defaultOptions.elementId.L1_origImg)
                 img.src = data;
//console.log(data)
                 img.onload = function (e) {
                     //只有首先显示img，才能读取到img的参数
                     _crop.showView()

                     //因为crop需要获取原始img的大小参数，所以要在img载入后，进行参数初始化
                     var result = _crop.initViewBasedOnImg()

                     if (result.rc > 0) {

                         setBtnState(btnId.cropImgBtnId,false)
                         return alert(result.msg)
                     }else{
                         //console.log(_crop.cropGenerateDataURL())
                     }
                 }

                 setBtnState(btnId.cropImgBtnId,true)
             },
             function(err){
                 return alert(err.msg)
             })
     }

     //显示整个crop界面（初始化元素）
     //service.initCropView=initCropView()
     //隐藏crop界面
     //service.hidePage=hidePage
     //如果采用其他元素作为选择图片（美化，input难看），点击后实际调用input
     //service.delegateClick=delegateClick
     //图片选择后，以dataURL的格式读入，传给img
     //service.readImg=readImg

     var bgCover=document.getElementById('bgCover')
     //供主页面调用
     service.initCropView=function(){
         //初始化crop和按钮元素
         //console.log('enter show page');
         _crop.hideView()
         setBtnState(btnId.cropImgBtnId,false)
         setBtnState(btnId.cropImgOK,false)
         //bgCover.style.display=''
         document.getElementById('croppedImg').setAttribute('src','')
         document.getElementById('croppedImg').style.display='none'

         //containerMiddle()
     }



/*     service.hidePage=function(){
         bgCover.style.display='none'
     }*/

     service.delegateClick=function(){
         var originalEle=document.getElementById('chooseImg')
         originalEle.click()
     }




 /*    var containerMiddle=function(){
         var cropContainer=document.getElementById('cropContainer')
//        console.log(bgCover.style.width)
//        console.log(cropContainer.style.width)
         var cropContainerWidth=parseInt(cropContainer.style.width.replace('px',''))

         cropContainer.style.marginLeft=cropContainer.style.marginRight=parseInt((document.body.clientWidth-cropContainerWidth)/2)+'px'
         //console.log(parseInt((document.body.clientWidth-cropContainerWidth)/2))
//        不包括滚动条的页面
         /!*        console.log(document.documentElement.clientWidth)
          console.log(document.body.clientWidth)
          console.log(document.body.scrollWidth)*!/

//        屏幕宽度（包括滚动条）
//        console.log(window.innerWidth)/!**!/
     }*/
     return service
 })

 var uploadOption={
     dataURL:'',//传入数据为dataURL，通过factory内部函数转换成fd，然后传给Upload
     serverURL:"/personalInfo/uploadCroppedImg",
     event:{
         progress:function (evt) {
             if (evt.lengthComputable) {
                 var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                 //return {rc:0,msg:percentComplete}
                 console.log(percentComplete)
             }
             else {
                 /*                    console.log('fail')
                  document.getElementById('progressNumber').innerHTML = 'unable to compute';*/
                 return upload.error.eventCalcUploadProgressFailed
             }
         },
         error:function(evt) {
             console.log(evt)
             alert("There was an error attempting to upload the file.");
         },
         abort:function(evt) {
             alert("The upload has been canceled by the user or the browser dropped the connection.");
         },
         load:function(evt) {
             /* This event is raised when the server send back a response */
             console.log(evt.target.responseText)
             return evt.target.responseText
         },
     }

 }
 componentApp.factory('uploadFactory',function(Upload,func){
     var _upload;
     var service={}
     service.createInst=function(option){
         //判断dataURL是否存在已经格式是否正确
         if(option.dataURL && option.dataURL!=='' && -1!==option.dataURL.indexOf('data:image/png;base64')){
             var fd=new FormData()
             var blob = func.dataURLtoBlob(option.dataURL);
             fd.append('file',blob)
             option.fd=fd
         }else{
             return {rc:1,msg:'图片格式不正确'}
         }
         _upload=Upload.Create()
         return _upload.init(option)
     }
/*     service.upload=function(){
          _upload.upload()
     }*/
    service.upload=function(){
        return _upload.upload()
    }
     return service
 })
 /*********************************************************************************************/
 /**********************          crop            ********************************/
 /*********************************************************************************************/
 var cropApp=angular.module('cropApp',['inputDefineApp','generalFuncApp','componentApp']);

 cropApp.controller('cropController',function($scope,cropFactory,uploadFactory){
     //cropFactory.getCrop()
    //     不同的controller不能使用同一个实例（_crop即便在其他controller实例化过，但是在新的ctrl中无法使用）
     cropFactory.createInst(cropOption)
     //载入时，初始化界面（之后，退出时初始化）
     cropFactory.initCropView()
     //cropFactory.getCrop()
     $scope.cropImg=function(){
         cropFactory.cropImg()
     }
     //隐藏crop界面
     $scope.hidePage=function(){
         //cropFactory.getCrop()
         $('#bgCover').hide()
         cropFactory.initCropView()
     }
     //如果采用其他元素作为选择图片（美化，input难看），点击后实际调用input
     $scope.delegateClick=function(){cropFactory.delegateClick()}
     //图片选择后，以dataURL的格式读入，传给img
     //$scope.readImg=function(){cropFactory.readImg()}
     $scope.cropImg=function(){

         $scope.croppedImgDataURL=cropFactory.cropImg()
         if(-1!==$scope.croppedImgDataURL.indexOf('data:image/png;base64')){
             $('#cropImgOK').removeClass('disabled')
         }
         $('#croppedImg').show()
     }

     $scope.transferCroppedImg=function(){
         document.getElementById('userIcon').setAttribute('src',$scope.croppedImgDataURL)
     }
 })
 /*********************************************************************************************/
 /**********************          common            ********************************/
 /*********************************************************************************************/
 var commonApp=angular.module('commonApp',['inputDefineApp','generalFuncApp']);
 commonApp.factory('dataService',function($http) {
     //console.log('common')
     //    因为toolbar属于页面，而不是某个$routeProvider对应的部分，所以需要单独的controller获得信息
     var getUserInfo=function(){
         return $http.put('personalInfo',{},{});
     }

     return {getUserInfo:getUserInfo}
 })




 commonApp.controller('mainController',function(dataService,$scope,func,inputDefine,$window,$timeout){
//console.log('commom')
     var timer=$timeout(
         function() {
             dataService.getUserInfo().success(function (data, status, header, config) {
                 //console.log( "Timeout executed", Date.now() );
                 if (data.rc > 0) {
                     $scope.errorModal = func.showErrMsg(data.msg)
                     //if(data.rc==40001){
                     //    setTimeout( $window.location.href='login',3000)
                     //}
                 } else {
                     //$scope.input[0].curValue=data.msg.name
                     //$scope.input[1].curValue=data.msg.mobilePhone
                     $scope.userInfo = data.msg.userInfo
                 }
             }).error(function (data, status, header, config) {

             })
         }
         ,2000
     )

     $scope.quit=function(){
         //console.log('quit')
         var quit=func.quit()
         quit.success(function(data,status,header,config){
             //console.log(1)
             if(data.rc===0){
                 //console.log(1.5)
                 $window.location.href='/main'
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
         $window.location.href='/searchResult?wd='+convertedString
     }
 })


 /*********************************************************************************************/
 /**********************          common            ********************************/
 /*********************************************************************************************/
var app=angular.module('app',['ngRoute','inputDefineApp','generalFuncApp','componentApp']);

app.factory('dataService',function($http) {
 var getBasicInfo = function () {
     return $http.put('personalInfo/getBasicInfo',{},{});
 }
 var saveBasicInfo = function (userName,mobilePhone) {
     return $http.put('personalInfo/saveBasicInfo',{userName:userName,mobilePhone:mobilePhone},{});
 }
 var savePasswordInfo = function (oldPassword,newPassword,rePassword) {
     return $http.put('personalInfo/savePasswordInfo',{oldPassword:oldPassword,newPassword:newPassword,rePassword:rePassword},{});
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
        //.when('/main',{
        //    $window.location.href='main'
        //})
        .otherwise({redirectTo:'/personalInfo/basicInfo'})

    $locationProvider.html5Mode(true)
}]);


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




app.controller('basicInfoController',function($scope,dataService,$window,inputDefine,func,uploadFactory,modalNew){
    //console.log('ba')
    //不管如何，先创建实例
    //modalNew.showErrMsg('err')

    $scope.showCropPage=function(){
        $('#bgCover').show()
/*        cropFactory.createInst(cropOption);
        //cropFactory.setTmp('basic')
        cropFactory.initCropView()*/
        //cropFactory.cropImg()
    }


    var showErrMsg=function(msg){
        $scope.errorModal={state:'show',title:'错误',msg:msg,
            close:function(){
                this.state=''
            }
        }
    };

    $scope.file={};

    $scope.globalVar={edit:false,allValidateOK:true}//初始从db读出，为OK
    $scope.userIcon={
        labelName:'用户头像',inputName:'',curValue:'',oldValue:undefined,validateOK:true
    }
    $scope.input=[
        {labelName:'用户名',inputName:'name',curValue:'',oldValue:undefined,validateOK:true},//初始从db读出，为OK
        {labelName:'手机',inputName:'mobilePhone',curValue:'',oldValue:undefined,validateOK:true}
    ]
    var service=dataService.getBasicInfo()
    setTimeout(
        function(){
            service.success(function(data,status,header,config){
                if(data.rc>0){
                   $scope.errorModal=func.showErrMsg(data.msg)
                    if(data.rc==40001){
                        setTimeout( $window.location.href='/login',3000)
                    }
                }else{

                    $scope.userIcon.curValue=data.msg.thumbnail
                    $scope.input[0].curValue=data.msg.name
                    $scope.input[1].curValue=data.msg.mobilePhone
                    $('#userIcon').show()
                    //$scope.userInfo=data.msg.userInfo
                }
            }).error(function(data,status,header,config){

            })
        }
        ,3000
    )
    //文件和数据上传格式不同，因此需要2个不同的上传函数
    //onchange时检测
    $scope.saveUserIcon=function(){
        //检查当前userIcon的src
        //if($scope.userIcon.curValue && -1===$scope.userIcon.curValue.indexOf('data:image/png;base64')){
        if(-1===$('#userIcon').attr('src').indexOf('data:image/png;base64')){
            return modalNew.showInfoMsg('头像文件尚未更改，无法保存')
        }
        uploadOption.dataURL=document.getElementById('userIcon').getAttribute('src')
        var result=uploadFactory.createInst(uploadOption)
        if(result.rc>0){
             return modalNew.showErrMsg(result.msg)
            //alert()
        }else{
            uploadFactory.upload().then(function(data){
                if(0===data.rc && undefined===data.msg){
                    modalNew.showInfoMsg('头像上传完毕')
                }
                if(0===data.rc && undefined!==data.msg){
                    console.log(data.msg)
                }
            },function(err){
                if(2===err.rc){
                    modalNew.showErrMsg(err.msg)
                }
            })
        }

    }


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
           if($scope.input[i].curValue!==$scope.input[i].oldValue){
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
})


app.controller('passwordInfoController',function($scope,dataService,inputDefine,func){
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



});



 //angular only autoboot the first ng-app
 //so need to manually boot 2nd/3rd/4th.... ng-app
 angular.bootstrap(document.getElementById("route"),['app']);
 angular.bootstrap(document.getElementById("bgCover"),['cropApp']);

