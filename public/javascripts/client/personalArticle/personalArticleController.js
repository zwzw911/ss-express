/**
 * Created by wzhan039 on 2015-08-25.
 */
var app=angular.module('app',['ui.tree']);

app.controller('personalArticleController',function($scope){
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
        console.log(nodeData)
        nodeData.nodes.push({
            id: nodeData.id * 10 + nodeData.nodes.length,
            title: nodeData.title + '.' + (nodeData.nodes.length + 1),
            nodes: []
        });
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
        'nodes': [
            {
                'id': 11,
                'title': 'node1.1',
                folder:true,
                type:'fa-folder-o',
                collapsed:true,
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