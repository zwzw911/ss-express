/**
 * Created by zw on 2015/9/20.
 */
var app=angular.module('app',['generalFuncApp','inputDefineApp']);

app.factory('dataService',function($http){
    //根据关键字搜索文档
    var getSearchResult=function(key,curPage){
        //return $http.post('searchResult',{key:key,type:type},{});
        return $http.post('searchResult',{wd:key,curPage:curPage},{});
    }

    return {getSearchResult:getSearchResult}
})

app.controller('searchResultController',['$scope','dataService','$location','$window','func','inputDefine','$sce',function($scope,dataService,$location,$window,func,inputDefine,$sce){
    var getSearchKey=function(){
        //searchResult?wd=fdd+capa
        //把搜索字符从URL中提出出来，变成key1 key2 key3的格式（input中的格式）
        var absURL=$location.absUrl();
        var searchString=absURL.split('=').pop()
        //截取的=后面的字符串和分割后的字符串一样，说明没有=
        if(searchString===absURL){
            //console.log(1)
            $scope.errorModal=func.showErrMsg(inputDefine.search.format.msg)
            return false
        }
        if(''===searchString ){
            //console.log(1)
            $scope.errorModal=func.showErrMsg(inputDefine.search.format.msg)
            return false
        }
        var tmp=searchString.split('+');
        var convertedKey='';
        for(var i=0;i<tmp.length;i++){
            convertedKey+=tmp[i]
            convertedKey+=' '
        }

        return convertedKey.trim()

    }

    var getSearchResult=function(curPage,key){

        var service=dataService.getSearchResult(key,curPage)
        service.success(function(data,status,header,config){
            if(data.rc===0 && undefined!==data.msg){
                //对可能的html进行处理，一边可以使用ng-bind-html
                data.msg.results.forEach(function(e){
                    e.title=$sce.trustAsHtml(e.title)
                    e.pureContent=$sce.trustAsHtml(e.pureContent)
                    e.keys.forEach(function(singleKey){
                        singleKey=$sce.trustAsHtml(singleKey)
                    })
                })
                $scope.results=data.msg.results
                $scope.userInfo=data.msg.userInfo
                $scope.pageRange=func.generatePaginationRange(data.msg.pagination)
//console.log($scope.pageRange)
                $scope.paginationInfo=data.msg.pagination
            }else{
                generalFunc.showErrMsg($scope.errorModal,data.msg)
                //showErrMsg(data.msg)
            }
        }).error(function(data,status,header,config){

        })
    }

    $scope.results//初始化非undefined,而是空数组,防止页面直接现实没有结果(要等到发出POST后,才能根据结果显式)
    $scope.paginationInfo

    key=getSearchKey()
    //console.log(key)
    if(key===false){
        $window.location.href="searchPage"
    }else{
        getSearchResult(1,key)
    }


    $scope.getSearchResult=function(curPage){
        key=getSearchKey()
        //console.log(key)
        if(key===false){
            $window.location.href="searchPage"
        }else{
            getSearchResult(curPage,key)
        }
    }

    $scope.search=function(){
        //getSearchResult(1)
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