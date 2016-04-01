/**
 * Created by zw on 2016/2/13.
 */
'use strict'

//load数据的状态
var dataStateEnum={loading:1,loaded:2,fail:3};

var inputTYpeEnum={text:'text',password:'password',number:'number'};

var app=angular.module('app',['inputDefineApp','generalFuncApp']);

app.factory('adminService',function($http){


    var getItemData=function(itemArray)
    {
        return $http.post('admin/getItemData',{items:itemArray},{});
    }
    var setItemData=function(setting){
        return $http.post('admin/setItemData',{setting:setting},{});
    }
    var checkItemData=function(fileListObject){
        return $http.post('checkItemData',{file:fileListObject},{});
    }
    var checkSubitemData=function(setting){
        return $http.post('admin/checkData',{setting:setting},{});
    }
    var adminLogin=function(userName,password) {
        return $http.post('admin/adminLogin', {inputUserNamePassword:{userName: {value:userName}, password:{value:password} }}, {});
    }

    return {getItemData:getItemData,setItemData:setItemData,checkItemData:checkItemData,checkSubitemData:checkSubitemData,adminLogin:adminLogin};

})

app.controller('AdminController',function($scope,adminService,func,inputDefine,inputFunc){

    $scope.loginModal={state:'show',
        title:"请先登录",
        show:function(){this.state='show'},
        close:function(){this.state=''},
        //直接使用$scope中的数据，所以无需传递参数
        login:function(){
            //console.log(Object.keys($scope.loginItems))
            for(var itemKey in $scope.loginItems){
                if(false===checkInput(itemKey)){
                    return false
                }
            }
        }}

    //用户是否已经登录，默认没有
    $scope.loginFlag=false
    //初始隐藏
    $scope.loginModal.close()
//valid: undefined的时候，显示初始化界面（既没有正确的勾，也没有错误的信息和X）
    $scope.loginItems={
            userName:{value:'',blur:false,focus:true,itemType:"text",itemIcon:"fa-user",chineseName:"用户名",itemExist:false,valid:undefined,errorMsg:""},//set bot valid and invalid as init state of glyphicon-ok and glyphicon-remove
            password:{value:'',blur:false,focus:true,itemType:"password",itemIcon:"fa-lock",chineseName:"密码",itemExist:false,valid:undefined,errorMsg:""}}
    $scope.loginDefine={
        userName:{require:true,type:'str',minLength:2,maxLength:40},
        password:{require:true,type:'str',minLength:2,maxLength:20}
    }

    $scope.setting={inner_image:{},userIcon:{},article:{},articleFolder:{},search:{},main:{},miscellaneous:{},attachment:{}}
    $scope.settingState={inner_image:{showData:false},userIcon:{showData:false},article:{showData:false},articleFolder:{showData:false},search:{showData:false},main:{showData:false},miscellaneous:{showData:false},attachment:{showData:false}}
    //value: equal to define in server side
    //originalData: if modify data, store the original one
    //checkedL if the subItem is check to save or check(in server side)
    //inputType: text/number
    //length: the length of input

    /*      check rule define   */
    var ruleCheckResult=inputFunc.checkInputRule($scope.loginDefine)
    //console.log(ruleCheckResult)
    if(0<ruleCheckResult.rc){
        //console.log('in')
        $scope.errorModal=func.showErrMsg(ruleCheckResult.msg)
    }







    //check input value,trigger by blur
    var checkInput=function(itemName){
        var validResult
        if(undefined!==$scope.loginDefine[itemName]['equalTo']){
            validResult=inputFunc.checkInput($scope.loginItems[itemName],$scope.loginDefine[itemName],$scope.loginItems[$scope.loginDefine[itemName]['equalTo']])
        }else{
            validResult=inputFunc.checkInput($scope.loginItems[itemName],$scope.loginDefine[itemName])
        }
        //console.log(validResult)
        //validResult:true或者错误信息
        if(0===validResult.rc){
            $scope.loginItems[itemName]['errorMsg']=''
            $scope.loginItems[itemName]['valid']=true
            return true
        }else{
            $scope.loginItems[itemName]['errorMsg']=validResult.msg
            $scope.loginItems[itemName]['valid']=false
            return false
        }
        //console.log( $scope.loginItems[itemName])
    }

    $scope.checkInput=checkInput
    //开始或者重新输入input，消除错误信息，或者正确的图标
    $scope.startInput=function(itemName){
        $scope.loginItems[itemName]['errorMsg']=''
        $scope.loginItems[itemName]['valid']=undefined
    }


    //    处理notlogin错误：如果没有登录，显示登录框
    //  返回ture：已经处理；false：未处理
    var processNotLogin=function(data){
        //尚未登录，显示登录界面
        if(data.rc===41106){
            $scope.loginModal.show()
            return true
        }
        return false
    }
    //    处理非notlogin错误：如果错误，使用弹出框
    //  返回ture：已经处理；false：未处理
    var processNonNotLogin=function(data){
        //达到最大登录次数
        if(data.rc>0 && data.rc!==41106){
            $scope.loginModal.close()
            $scope.errorModal=func.showErrMsg(data.msg)
            return true
        }
        return false
    }

    //$scope.showHideData=function(itemName){
    var showHideData=function(itemName){
        $scope.settingState[itemName]['showData']=!$scope.settingState[itemName]['showData']
/*        if(true===$scope.settingState[itemName]['showData']){
            var itemNameArray=[itemName]

            itemNameArray.forEach(function(e){
                //console.log(e)
                if(undefined===$scope.setting[e] || null===$scope.setting[e] || 0===Object.keys($scope.setting[e]).length){
                    getItemData(itemNameArray)
                }
            })
        }*/
    }

    $scope.showHideData=showHideData
    var dataState;
    $scope.getItemData=function(itemNameArray) {
        dataState = dataStateEnum.loading;
/*        for (var singleItem of itemNameArray){

        }*/
        //实际数组只有一个值
        //如果当前处于hide状态，那么从server获得数据
        if(false===$scope.settingState[itemNameArray[0]]['showData']){
            var service = adminService.getItemData(itemNameArray);
            service.success(function (data, status, header, config) {
                /*            if(data.rc===50020){
                 $scope.loginModal.show()
                 $scope.loginFlag=false
                 return false
                 }*/
                var processResult
                processResult=processNotLogin(data)
                if(true===processResult){
                    return true
                }
                processResult=processNonNotLogin(data)
                if(true===processResult){
                    return true
                }
                //错误显示由数据直接显示,所以直接把server端数据付给client即可
                if (undefined !== data.msg && null !== data.msg) {
                    for (var item in data.msg) {
                        $scope.setting[item]={}
                        for (var subItem of Object.keys(data.msg[item])) {
                            $scope.setting[item][subItem]={}
                            $scope.setting[item][subItem]['currentData']=$scope.setting[item][subItem]['value'] =$scope.setting[item][subItem]['originalData']= data.msg[item][subItem]['value'];
                            /*                        $scope.setting[item][subItem]['type'] = data.msg[item][subItem]['type'];
                             $scope.setting[item][subItem]['minLength'] = data.msg[item][subItem]['minLength'];
                             $scope.setting[item][subItem]['maxLength'] = data.msg[item][subItem]['maxLength'];*/
                            if (undefined === $scope.setting[item][subItem]['checked']) {
                                $scope.setting[item][subItem]['checked'] = false
                            }

                            $scope.setting[item][subItem]['needCheck'] = false;//刚载入数据,无需检查
                            $scope.setting[item][subItem]['checkResult'] = undefined;
                            $scope.setting[item][subItem]['checkErrMsg'] = undefined;
                        }
                        showHideData(itemNameArray[0])
                    }
                    dataState = dataStateEnum.loaded
                }
                //console.log($scope.setting)
            }).error(function (data, status, header, config) {
                dataState = dataStateEnum.fail
            })
        }else{
            showHideData(itemNameArray[0])
        }

    }



/*    //如果检查出错，显示出错内容在input
    var processCheckError=function(data){

    }*/
/*    $scope.getItemData=function(itemNameArray){
        console.log(itemNameArray)
        if(undefined!==itemNameArray && typeof itemNameArray !== 'object' && Array == itemNameArray.constructor){


        }else{
            console.log('err')
        }

    }*/



    $scope.monitorNeedCheck=function(item,subItem){
    /*    console.log($scope.setting[item][subItem]['value'])
        console.log($scope.setting[item][subItem]['originalData'])*/
        if($scope.setting[item][subItem]['value']!==$scope.setting[item][subItem]['originalData']){
            $scope.setting[item][subItem]['needCheck']=true
        }else{
            $scope.setting[item][subItem]['needCheck']=false;
        }
        //只要数据发生了更改,之前的error标记和errorMsg都清空
        $scope.setting[item][subItem]['checkResult']=undefined;
        $scope.setting[item][subItem]['checkErrMsg']=undefined;
        //console.log( $scope.setting[item][subItem]['needCheck'])
    }

    $scope.checkSubitemData=function(itemKey,subitemKey){
        var setting={};
        setting[itemKey]={}
        setting[itemKey][subitemKey]={}
        setting[itemKey][subitemKey]['value']=$scope.setting[itemKey][subitemKey]['value']
//console.log(setting[itemKey][subitemKey])
        var service = adminService.checkSubitemData(setting);

        service.success(function (data, status, header, config) {
            var processResult
            processResult=processNotLogin(data)
            if(true===processResult){
                return true
            }
            processResult=processNonNotLogin(data)
            if(true===processResult){
                return true
            }
            if(0===data.rc){
                $scope.setting[itemKey][subitemKey]['needCheck']=false
                $scope.setting[itemKey][subitemKey]['checkResult']=true
                $scope.setting[itemKey][subitemKey]['checkErrMsg']=undefined
            }else{
                if(0===data[itemKey][subitemKey]['rc']){
                    $scope.setting[itemKey][subitemKey]['needCheck']=false
                    $scope.setting[itemKey][subitemKey]['needCheck']=false
                    $scope.setting[itemKey][subitemKey]['checkResult']=true
                    $scope.setting[itemKey][subitemKey]['checkErrMsg']=undefined
                }else{
                    $scope.setting[itemKey][subitemKey]['checkResult']=false
                    $scope.setting[itemKey][subitemKey]['checkErrMsg']=data[itemKey][subitemKey]['msg']
                }

            }
        }).error(function (data, status, header, config) {
            dataState = dataStateEnum.fail
        })
    }

    $scope.saveItemData=function(itemKey){
        var setting={};
        var subItemKey;
        setting[itemKey]={}
        //item下有数据,那么组装并回给server进行判断
        if(undefined!==$scope.setting[itemKey] && null!==$scope.setting[itemKey]){
            for(var subItemKey of Object.keys($scope.setting[itemKey])) {
                setting[itemKey][subItemKey]={}
                setting[itemKey][subItemKey]['value']=$scope.setting[itemKey][subItemKey]['value']
            }
        }

        var service = adminService.setItemData(setting);

        service.success(function (data, status, header, config) {
            if(data.rc===50020){
                $scope.loginModal.show()
                return false
            }
            if(data.rc && data.rc>0){
                //hacker msg
                alert(data.msg)
            }
            if(data.rc && 0===data.rc){
                for(subItemKey of Object.keys($scope.setting[itemKey])) {
                    $scope.setting[itemKey][subItemKey]['needCheck']=false
                    $scope.setting[itemKey][subItemKey]['checkResult']=true
                    $scope.setting[itemKey][subItemKey]['checkErrMsg']=undefined
                }

            }else{
                //$scope.setting[itemKey][subitemKey]['needCheck']=false
                for(subItemKey of Object.keys($scope.setting[itemKey])) {
                    $scope.setting[itemKey][subItemKey]['needCheck']=false
                    if(0===data[itemKey][subItemKey]['rc']){
                        $scope.setting[itemKey][subItemKey]['checkResult']=true
                        $scope.setting[itemKey][subItemKey]['checkErrMsg']=undefined
                    }else{
                        $scope.setting[itemKey][subItemKey]['checkResult']=false
                        $scope.setting[itemKey][subItemKey]['checkErrMsg']=data[itemKey][subItemKey]['msg']
                    }

                }

            }
        }).error(function (data, status, header, config) {
            dataState = dataStateEnum.fail
        })
    }



    $scope.adminLogin=function(){
//console.log('clickLogin')
        var service = adminService.adminLogin($scope.loginItems.userName.value,$scope.loginItems.password.value);
        service.success(function (data, status, header, config) {
            if(0<data.rc){
                $scope.loginModal.msg=data.msg

            }else{
                $scope.loginModal.close()
            }
        }).error(function (data, status, header, config) {

        })
    }


})
