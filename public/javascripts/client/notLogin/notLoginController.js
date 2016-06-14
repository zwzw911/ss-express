/**
 * Created by wzhan039 on 2016-06-13.
 */
var app=angular.module('app',[]);

app.factory('myInterceptor',function($q){
    return {
        request:function(config){console.log('req');console.log(config);return config},
        response:function(response){console.log('res');console.log(response);return config},
        requestError:function(rejection){console.log('reqErr');;console.log(rejection);return rejection},
        responseError:function(rejection){console.log('resErr');console.log(rejection);return rejection},
    }
})

app.config(function($httpProvider) {
        $httpProvider.interceptors.push('myInterceptor');
});

app.controller('notLoginController',function($scope,$http) {
    console.log(document.referer)
    //检测当前目录是否为根目录
    $scope.redirect=function(){
        //console.log('test')
        $http.get('notLogin/redirect').then(
            function(date){console.log(data)},
            function(err){console.log(err)}
        )
    }
})