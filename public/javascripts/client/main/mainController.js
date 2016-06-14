/**
 * Created by wzhan039 on 2015-07-07.
 */

var app=angular.module('app',['inputDefineApp','generalFuncApp']);
app.factory('initGetAllData',function($http){
    var getInitData=function(){
        return $http.put('main',{},{});
    }
    return {getInitData:getInitData};
})

/*app.provider('cropProvider',function(){
    var _crop;
    var _miscOption
    //var option
    //console.log(passInOption)
    //var miscOption;
        //Crop,asyncFunc
    this.$get=function(Crop,asyncFunc) {
        //var crop=Crop.Create(option)
        return {
            //passInOption:option,
            var that=this
            createInst:function(option,miscOption){
                _crop=Crop.Create(option);
                _miscOption=miscOption
                //为按钮添加事件
                $('#'+_crop.defaultOptions.btnId.chooseImgBtnId).bind('click',function(e){this.chooseImg()})
                $('#'+_crop.defaultOptions.btnId.cropImgBtnId).bind('click',function(e){_crop.allElement.croppedImg.setAttribute('src',this.cropImg())})
                //crop.allBtnElement['chooseImgBtnId']
                //crop.allBtnElement['cropImg']
            },
            cropImg:function(){
                //console.log(_crop.cropGenerateDataURL)
                return _crop.cropGenerateDataURL()
            },
           chooseImg:function () {
               //console.log(_miscOption)
                return asyncFunc.readFile(_miscOption.chooseImgBtnId,'dataURL',20000000).then(
                    function(data) {
                    //console.log(data)
                    //    if (data.rc) {
                            console.log(data.msg)
                    //        //return data
                    //    }
                    //    else {
                            var img = document.getElementById(_crop.defaultOptions.elementId.L1_origImg)
                            //option.
                            img.onload = function (e) {
                                //因为crop需要获取原始img的大小参数，所以要在img载入后，进行初始化
                                var result = _crop.init()
                                if (result.rc > 0) {
                                    alert(result.msg)
                                }
                            }
                            img.src = data;
                            //return {rc:0}
                        //}
                    },
                    function(err){
                        //console.log(err)
                        alert(err)
                    })
            }
        }
    }
})*/




//app.config(function(cropProviderProvider){
//    //cropProvider.miscOption={
//    //    chooseImgBtnId:'chooseImg'
//    //}
//    cropProviderProvider.passInOption=cropOption
//})
app.controller('MainController',function($scope,initGetAllData,inputDefine,func,$window,modalNew){

/*    $scope.chooseImg=function(){

        cropProvider.chooseImg().then(function(data){console.log(data)},function(err){console.log(err)});
        //console.log(result)
    }
    $scope.crop=function(){
        $scope.cropedDataURL=cropProvider.cropImg()
    }*/

//modalNew.showErrMsg('test')

     $scope.lastWeek=[{},{}]
    $scope.latestArticle={}
    $scope.latestArticle.loadingFlag=true;

    $scope.showHidelastWeek=function(item){
        item.showFlag=!item.showFlag;
        //item.showFlag ? item.showCSS='fa-angle-double-down':item.showCSS='fa-angle-double-up';
    }
    var convertLatestArticle=function(dataFromServer){
        $scope.latestArticle.articleList=[]
        //console.log(dataFromServer)
        if(undefined!==dataFromServer && 0<dataFromServer.length){
            dataFromServer.forEach(function(e){
                //console.log(e)
                $scope.latestArticle.articleList.push({hashId: e.hashId,title: e.title,author: e.author.name,keys: e.keys,mDateConv: e.mDateConv,content: e.pureContent})
            })
        }
        //console.log($scope.latestArticle.articleList)
    }



    //console.log(1)
    setTimeout(function(){
        var service=initGetAllData.getInitData();
        service.success(function(data,status,header,config){
            $scope.latestArticle.loadingFlag=false;
            if(0===data.rc){
                //console.log(2)
                $scope.lastWeek[0].articleList=data.msg.lastWeekCollect
                $scope.lastWeek[1].articleList=data.msg.lastWeekClick
                //console.log(3)
                convertLatestArticle(data.msg.latestArticle)
                //console.log($scope.latestArticle)
                $scope.userInfo=data.msg.userInfo
            }else{
                $scope.errorModal=func.showErrMsg(data.msg)
            }
        }).error(function(data,status,header,config){})
    }
    ,500)


    $scope.quit=function(){
        var quit=func.quit()
        quit.success(function(data,status,header,config){
            //console.log(data)
            if(data.rc===0){
                $window.location.href='/main'
            }
        }).error(function(data,status,header,config){})
    }

    //空格分割（input）转换成+分割（URL）
    $scope.search=function($event){
//console.log($scope.searchString,inputDefine.search.searchTotalKeyLen.define)
/*        var convertedString=func.convertInputSearchString($scope.searchString,inputDefine.search.searchTotalKeyLen.define)
        //console.log(convertedString)
        //搜索字符串为空，直接返回
        if(false===convertedString){
            return false
        }
        $window.location.href='/searchResult?wd='+convertedString*/
        //console.log($event.keyCode)
        if(13===$event.keyCode && undefined!==$scope.searchString && ''!==$scope.searchString && ''!==$scope.searchString.trim()){
            var convertedString=func.convertInputSearchString($scope.searchString,inputDefine.search.searchTotalKeyLen.define)
            //console.log(convertedString)
            //搜索字符串为空，直接返回
            if(false===convertedString){
                return false
            }
            $window.location.href='/searchResult?wd='+convertedString
        }
    }




})
