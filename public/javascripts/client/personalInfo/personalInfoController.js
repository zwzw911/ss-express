/**
 * Created by wzhan039 on 2015-09-08.
 */
var app=angular.module('app',[]);
app.factory('dataService',function($http) {
    var getBasicInfo = function () {

    }
    var saveBasicInfo = function (mobilePhone) {

    }
    var savePasswordInfo = function (newPassword) {

    }
    return {getBasicInfo: getBasicInfo}
})

app.config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider){
    $routeProvider.
        when('/basicInfo',{

        })
        .when('/passwordInfo',{

        })
        .otherwise({redirectTo:'/basicInfo'})
}])
app.controller('basicInfo',function($scope,dataService){})
app.controller('passwordInfo',function($scope,dataService){})
