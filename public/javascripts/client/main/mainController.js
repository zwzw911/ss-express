/**
 * Created by wzhan039 on 2015-07-07.
 */

var app=angular.module('app',['inputDefineApp','generalFuncApp']);
app.factory('initGetAllData',function($http){
    var getInitData=function(){
        return $http.post('main',{},{});
    }
    return {getInitData:getInitData};
})
app.controller('MainController',function($scope,initGetAllData,inputDefine,func,$window){
     //showFlag:当前是否可以显示/隐藏内容
     $scope.lastWeek=[
        {name:'上周收藏',showFlag:false,showCSS:'fa-angle-double-down',loadingFlag:false,articleList:[
            {title:'test', author:'TestTestTestTest', date:'2015-01-01 15:01:30' },
            {title:'test', author:'TestTestTestTest', date:'2015-01-01 15:01:30' },
            {title:'test', author:'TestTestTestTest', date:'2015-01-01 15:01:30' }
        ]},
        {name:'上周点击',showFlag:false,showCSS:'fa-angle-double-down',loadingFlag:false,articleList:[
        {title:'test', author:'TestTestTestTest', date:'2015-01-01 15:01:30' },
        {title:'test', author:'TestTestTestTest', date:'2015-01-01 15:01:30' },
        {title:'test', author:'TestTestTestTest', date:'2015-01-01 15:01:30' }
        ]}
    ];

    $scope.latestArticle={loadingFlag:false,articleList:[
        {title:"test",author:'testtest',keyword:['key1','key2'],date:'2015-01-01 15:01:30',content:'asdfasfasfasfasf奥斯丁发射点法asdfasfasfasfasf奥斯丁发射点法asdfasfasfasfasf奥斯丁发射点法asdfasfasfasfasf奥斯丁发射点法asdfasfasfasfasf奥斯丁发射点法asdfasfasfasfasf奥斯丁发射点法'},
        {title:"test",author:'testtest',keyword:['key1','key2'],date:'2015-01-01 15:01:30',content:'asdfasfasfasfasf奥斯丁发射点法asdfasfasfasfasf奥斯丁发射点法asdfasfasfasfasf奥斯丁发射点法asdfasfasfasfasf奥斯丁发射点法asdfasfasfasfasf奥斯丁发射点法asdfasfasfasfasf奥斯丁发射点法'}
    ]}

    $scope.showHidelastWeek=function(item){
        item.showFlag=!item.showFlag;
        //item.showFlag ? item.showCSS='fa-angle-double-down':item.showCSS='fa-angle-double-up';
    }

    //$scope.getInitData=function(){
        var service=initGetAllData.getInitData();
        service.success(function(data,status,header,config){
            if(0===data.rc){
                $scope.lastWeek[0].articleList=data.msg.lastWeekCollect
                $scope.lastWeek[1].articleList=data.msg.lastWeekClick
                $scope.latestArticle.articleList=data.msg.latestArticle
                $scope.userInfo=data.msg.userInfo
            }
        }).error(function(data,status,header,config){})
    //}


    $scope.quit=function(){
        var quit=func.quit()
        quit.success(function(data,status,header,config){
            //console.log(data)
            if(data.rc===0){
                $window.location.href='main'
            }
        }).error(function(data,status,header,config){})
    }

    //空格分割（input）转换成+分割（URL）
    $scope.search=function(){
//console.log($scope.searchString,inputDefine.search.searchTotalKeyLen.define)
        var convertedString=func.convertInputSearchString($scope.searchString,inputDefine.search.searchTotalKeyLen.define)
        //console.log(convertedString)
        //搜索字符串为空，直接返回
        if(false===convertedString){
            return false
        }
        $window.location.href='searchResult?wd='+convertedString
    }

})
