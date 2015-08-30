/**
 * Created by wzhan039 on 2015-08-25.
 */
var app=angular.module('app',['ui.tree']);









app.factory('dataService',function($http){
    //读取根目录的下级信息(子目录和文档)
    var readRootFolder=function(){
        return $http.post('personalArticle',{},{});
    }
    //读取目录的下级信息(子目录和文档)
    var readFolder=function(folderId){
        return $http.post('personalArticle/readFolder',{folderId:folderId},{});
    }
    //修改目录名字
    var renameFolder=function(folderId,oldName,newName){
        return $http.post('personalArticle/rename',{folderId:folderId,oldFolderName:oldName,oldFolderName:newName},{});
    }
    //移动目录
    var moveFolder=function(folderId,oldParentFolderId,newParentFolderId){
        return $http.post('personalArticle/moveFolder',{folderId:folderId,oldParentFolderId:oldParentFolderId,newParentFolderId:newParentFolderId},{});
    }
    //新增目录
    var createFolder=function(parentFolderId,folderName){
        return $http.post('personalArticle/createFolder',{parentFolderId:folderName,folderName:folderName},{});
    }
    //删除目录
    var deleteFolder=function(folderId){
        return $http.post('personalArticle/deleteFolder',{folderId:folderId},{});
    }
    //添加文档
    var createArticleFolder=function(parentFolderId,articleId){
        return $http.post('personalArticle/createArticleFolder',{parentFolderId:parentFolderId},{});
    }
    //删除文档（实际）
    var removeArticle=function(articleId){
        return $http.post('personalArticle/removeArticle',{articleId:articleId},{});
    }
    //删除文档(移入垃圾箱)
    var deleteArticle=function(articleId,oldParentFolderId){
        return $http.post('personalArticle/deleteArticle',{articleId:articleId,oldParentFolderId:oldParentFolderId},{});
    }
    //移动文档
    var moveArticle=function(articleId,oldParentFolderId,newParentFolderId){
        return $http.post('personalArticle/moveArticle',{articleId:articleId,oldParentFolderId:oldParentFolderId,newParentFolderId:newParentFolderId},{});
    }

    return {readRootFolder:readRootFolder,readFolder:readFolder,renameFolder:renameFolder,moveFolder:moveFolder,createFolder:createFolder,deleteFolder:deleteFolder,
        createArticleFolder:createArticleFolder,removeArticle:removeArticle,deleteArticle:deleteArticle,moveArticle:moveArticle}
})
app.controller('personalArticleController',function($scope,dataService){
    var showErrMsg=function(msg){
        $scope.errorModal={state:'show',title:'错误',msg:msg,
            close:function(){
                this.state=''
            }
        }
    }

    var service=dataService.readRootFolder();
    service.success(function(data,status,header,config){
        if(0===data.rc){
            $scope.data=data.msg
        }
        //console.log(data.msg)
    }).error(function(data,status,header,config){
        //console.log(data.msg)
    })
    $scope.remove = function (scope) {
        console.log('in')
        console.log(scope.collapsed)
        console.log(scope.$parentNodeScope)
        //scope.remove();

    };

    $scope.toggle = function (scope) {
        scope.toggle();

    };

    $scope.moveLastToTheBeginning = function () {
        var a = $scope.data.pop();
        $scope.data.splice(0, 0, a);
    };

    $scope.newSubItem = function (scope) {
        var nodeData = scope.$modelValue;
//console.log(nodeData)
        var service=dataService.createArticleFolder(nodeData.id);
        service.success(function(data,status,header,config){
            if(0===data.rc){
                nodeData.nodes.push(data.msg)
            }else{
                showErrMsg(data.msg)
            }
            //console.log(data.msg)
        }).error(function(data,status,header,config){
            //console.log(data.msg)
        })
/*        nodeData.nodes.push({
            id: nodeData.id * 10 + nodeData.nodes.length,
            title: nodeData.title + '.' + (nodeData.nodes.length + 1),
            nodes: []
        });*/
    };

    $scope.collapseAll = function (scope) {
        $scope.$broadcast('collapse');
        console.log(scope.collapsed)
    };
    $scope.collapse = function (scope) {
        $scope.$broadcast('collapse');
        console.log(scope.collapsed)
    };
    $scope.expandAll = function () {
        $scope.$broadcast('expandAll');
    };
    //console.log('nodeData')
    //$scope.collapsed=false;
    $scope.data = [{
        'id': 1,
        'title': 'node1',
        folder:true,
        type:'fa-folder-o',
        'data-collapsed':true,
        'nodes': [
            {
                'id': 11,
                'title': 'node1.1',
                folder:true,
                type:'fa-folder-o',
                collapsed:true,
                'data-collapsed':true,
                'nodes': [
                    {
                        'id': 111,
                        'title': 'node1.1.1',
                        folder:false,
                        type:'fa-file-pdf-o',
                        collapsed:false,
                        'nodes': []
                    }
                ]
            },
            {
                'id': 12,
                'title': 'node1.2',
                'nodes': []
            }
        ]
    }, {
        'id': 2,
        'title': 'node2',
        'nodes': [
            {
                'id': 21,
                'title': 'node2.1',
                'nodes': []
            },
            {
                'id': 22,
                'title': 'node2.2',
                'nodes': []
            }
        ]
    }, {
        'id': 3,
        'title': 'node3',
        'nodes': [
            {
                'id': 31,
                'title': 'node3.1',
                'nodes': []
            }
        ]
    }];
})