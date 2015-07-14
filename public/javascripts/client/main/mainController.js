/**
 * Created by wzhan039 on 2015-07-07.
 */

var app=angular.module('app',[]);
app.factory('initGetAllData',function($http){
    var getInitData=function(){
        return $http.post('/getInitData',{},{});
    }
    return {getInitData:getInitData};
})
app.controller('MainController',function($scope,initGetAllData){

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
        item.showFlag ? item.showCSS='fa-angle-double-down':item.showCSS='fa-angle-double-up';
    }

    $scope.getInitData=function(){
        var service=initGetAllData.getInitData();
        service.success(function(data,status,header,config){

        })
    }

})
