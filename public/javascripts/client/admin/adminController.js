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
    var setItemData=function(){
        return $http.post('setItemData',{},{});
    }
    var checkItemData=function(fileListObject){
        return $http.post('checkItemData',{file:fileListObject},{});
    }
    var checkSubitemData=function(articleHashId,comment){
        return $http.post('checkSubitemData',{content:comment},{});
    }
    return {getItemData:getItemData,setItemData:setItemData,checkItemData:checkItemData,checkSubitemData:checkSubitemData};
})

app.controller('AdminController',function($scope,adminService,func,inputDefine){

    var dataState;
    var getItemData=function(itemNameArray) {
        dataState = dataStateEnum.loading;
        var service = adminService.getItemData(itemNameArray);
        service.success(function (data, status, header, config) {
            //错误显示由数据直接显示,所以直接把server端数据付给client即可
            if (undefined !== data.msg && null !== data.msg) {
                for (var item of Object.keys(data.msg)) {
                    $scope.setting[item]={}
                    for (var subItem of Object.keys(data.msg[item])) {
                        $scope.setting[item][subItem]={}
                        $scope.setting[item][subItem]['currentData'] = data.msg[item][subItem]['currentData'];
                        $scope.setting[item][subItem]['originalData'] = null;
                        $scope.setting[item][subItem]['type'] = data.msg[item][subItem]['type'];
                        $scope.setting[item][subItem]['minLength'] = data.msg[item][subItem]['minLength'];
                        $scope.setting[item][subItem]['maxLength'] = data.msg[item][subItem]['maxLength'];
                        if (undefined === $scope.setting[item][subItem]['checked']) {
                            $scope.setting[item][subItem]['checked'] = false
                        }
                    }
                }
                dataState = dataStateEnum.loaded
            }
        }).error(function (data, status, header, config) {
            dataState = dataStateEnum.fail
        })
    }

/*    $scope.getItemData=function(itemNameArray){
        console.log(itemNameArray)
        if(undefined!==itemNameArray && typeof itemNameArray !== 'object' && Array == itemNameArray.constructor){


        }else{
            console.log('err')
        }

    }*/

    $scope.showHideData=function(itemName){
        $scope.settingState[itemName]['showData']=!$scope.settingState[itemName]['showData']
        if(true===$scope.settingState[itemName]['showData']){
            var itemNameArray=[itemName]

            itemNameArray.forEach(function(e){
                console.log(e)
                if(undefined===$scope.setting[e] || null===$scope.setting[e] || 0===Object.keys($scope.setting[e]).length){
                    getItemData(itemNameArray)
                }
            })
        }
    }
	//init setting's item, so that can show panel in page
	$scope.setting={inner_image:{},userIcon:{},article:{},articleFolder:{},search:{},main:{},miscellaneous:{},attachment:{}}
    $scope.settingState={inner_image:{showData:false},userIcon:{showData:false},article:{showData:false},articleFolder:{showData:false},search:{showData:false},main:{showData:false},miscellaneous:{showData:false},attachment:{showData:false}}
    //currentData: equal to define in server side
    //originalData: if modify data, store the original one
    //checkedL if the subItem is check to save or check(in server side)
    //inputType: text/number
    //length: the length of input
/*    $scope.setting={
        inner_image:{
            path:{currentData:1,originalData:null,checked:true,inputType:'text',maxLength:length,minLength:length}
        }
    };*/

//console.log('4')
//    $scope.getItemData(['inner_image'])
})
