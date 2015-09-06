/**
 * Created by wzhan039 on 2015-08-25.
 */
var app=angular.module('app',['ui.tree']);

app.factory('dataService',function($http){
    //检测当前目录是否为根目录
    var checkIfRootFolder=function(folderId){
        return $http.post('personalArticle/checkIfRootFolder',{folderId:folderId},{});
    }
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
        return $http.post('personalArticle/rename',{folderId:folderId,oldFolderName:oldName,newFolderName:newName},{});
    }
    //移动目录
    var moveFolder=function(folderId,oldParentFolderId,newParentFolderId){
        return $http.post('personalArticle/moveFolder',{folderId:folderId,oldParentFolderId:oldParentFolderId,newParentFolderId:newParentFolderId},{});
    }
    //新增目录
    var createFolder=function(parentFolderId,folderName){
/*        if(undefined===folderName || null===folderName || ''===folderName){
            folderName=''
        }*/
        return $http.post('personalArticle/createFolder',{parentFolderId:parentFolderId,folderName:folderName},{});
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
    var removeArticle=function(articleHashId){
        return $http.post('personalArticle/removeArticle',{articleHashId:articleHashId},{});
    }
    //删除文档(移入垃圾箱)
    var deleteArticle=function(articleHashId,oldParentFolderId){
        return $http.post('personalArticle/deleteArticle',{articleHashId:articleHashId,oldParentFolderId:oldParentFolderId},{});
    }
    //移动文档
    var moveArticle=function(articleId,oldParentFolderId,newParentFolderId){
        return $http.post('personalArticle/moveArticle',{articleId:articleId,oldParentFolderId:oldParentFolderId,newParentFolderId:newParentFolderId},{});
    }
    //更改文档名
    var renameArticle=function(articleHashId,articleNewName){
        return $http.post('personalArticle/renameArticle',{articleHashId:articleHashId,articleNewName:articleNewName},{});
    }
    return {checkIfRootFolder:checkIfRootFolder,readRootFolder:readRootFolder,readFolder:readFolder,renameFolder:renameFolder,moveFolder:moveFolder,createFolder:createFolder,deleteFolder:deleteFolder,
        createArticleFolder:createArticleFolder,removeArticle:removeArticle,deleteArticle:deleteArticle,moveArticle:moveArticle,renameArticle:renameArticle}
})
app.controller('personalArticleController',function($scope,dataService){
    var showErrMsg=function(msg){
        $scope.errorModal={state:'show',title:'错误',msg:msg,
            close:function(){
                this.state=''
            }
        }
    };
$scope.test=function(){
    console.log('test')
}

    $scope.treeOptions = {
        //don't use beforeDrag cause it will trigger twice
        dragMove:function(event){
            var sourceNodeScope=event.source.nodeScope;

            var nodeData=sourceNodeScope.$modelValue
            if(nodeData.folder){
                var service=dataService.checkIfRootFolder(nodeData.id)
                service.success(function(data,status,header,config){
                    if(0===data.rc){
                        return true
                    }else{

                        showErrMsg(data.msg)
                        return false
                    }
                    //console.log(data.msg)
                }).error(function(data,status,header,config){
                    //console.log(data.msg)
                })
            }
        },
        beforeDrop:function(event){
            var sourceNode=event.source.nodeScope.$modelValue;
            var destNode=event.dest.nodesScope.$modelValue;
/*            console.log(event.dest.index)
            console.log(sourceNode)
            console.log(destNode)*/
        },
        accept: function(sourceNodeScope, destNodesScope, destIndex) {
/*            console.log(destNodesScope.$modelValue)
            if(destNodesScope.$modelValue.folder===true){
                return true
            }else{
                return false
            }*/
            //console.log(destNodesScope.$nodeScope)
            return (null!=destNodesScope.$nodeScope)
            //return true
        },
        dropped:function(event){
            //console.log('dropped')
            var sourceNode=event.source.nodeScope.$modelValue;
            var sourceParentNode=event.source.nodeScope.$parentNodeScope.$modelValue
            var parentDestNode=event.dest.nodesScope.$nodeScope.$modelValue;
            //父节点不变，无需触发move操作
            if(sourceParentNode.id===parentDestNode.id){
                return true
            }
            //console.log(sourceNode.id)
            //console.log(parentDestNode.id)
            if(sourceNode.folder){
                var service=dataService.moveFolder(sourceNode.id,sourceParentNode.id,parentDestNode.id)
            }else{
                var service=dataService.moveArticle(sourceNode.id,sourceParentNode.id,parentDestNode.id)
            }
            service.success(function(data,status,header,config){
                if(0===data.rc){
                    return true
                }else{

                    showErrMsg(data.msg)
                    return false
                }
                //console.log(data.msg)
            }).error(function(data,status,header,config){
                //console.log(data.msg)
            })
            //console.log(event.dest.nodesScope.$nodeScope)
/*            console.log(event.dest.index)
            console.log(sourceNode)
            console.log(destNode)*/
    /*        destNode.push(sourceNode);
            sourceNode.remove()*/
        }

        /*accept: function(sourceNodeScope, destNodesScope, destIndex) {
            var curNodeId,curParentId,newNodeId
            var curNode=sourceNodeScope.$modelValue
            console.log(curNode)
            var curParentNode=sourceNodeScope.$parentNodeScope
            var newNode=destNodesScope.$modelValue
            if(null===curNode){ curNodeId=null}else(curNodeId=curNode.id)
            if(null===curParentNode){ curParentId=null}else{curParentId=curParentNode.id}
            if(null===newNode){ newNodeId=null}else{newNodeId=newNode.id}
            var service=dataService.moveFolder(curNodeId,curParentId,newNodeId)
            service.success(function(data,status,header,config){
                if(0===data.rc){
                    return true
                }else{

                    showErrMsg(data.msg)
                    return false
                }
                //console.log(data.msg)
            }).error(function(data,status,header,config){
                //console.log(data.msg)
            })
        }*/
    };
    var service=dataService.readRootFolder();
    service.success(function(data,status,header,config){
        if(0===data.rc){
            $scope.data=data.msg
            //console.log($scope.data)
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
        console.log('toggle')
        scope.toggle();

    };

    $scope.moveLastToTheBeginning = function () {
        var a = $scope.data.pop();
        $scope.data.splice(0, 0, a);
    };
    $scope.expandFolder = function (scope) {
        //console.log(scope.collapsed)
        var nodeData = scope.$modelValue;
        //console.log(nodeData.nodes.length)

        //collapsed实际意义和字面意思正好相反: true:打开;false:折叠
        if(scope.collapsed){
            //处于折叠状态,并且nodes的长度是0(server端已经初始化过为[]),说明没有打开过,才需要重新读取数据
            if(0===nodeData.nodes.length){

                var service=dataService.readFolder(nodeData.id)
                service.success(function(data,status,header,config){
                    nodeData.nodes=[];
                    if(0===data.rc){
                        nodeData.nodes=data.msg;//返回的是数组,所以直接赋值
                    }else{
                        showErrMsg(data.msg)
                    }
                    //console.log(data.msg)
                }).error(function(data,status,header,config){
                    //console.log(data.msg)
                })
            }
        }
    };
    $scope.addNewArticle = function (scope) {
        var nodeData = scope.$modelValue;
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
    $scope.addNewFolder = function (scope) {
        var nodeData = scope.$modelValue;
        $scope.expandFolder(scope)
//console.log(nodeData)
        console.log(nodeData.id)
        var service=dataService.createFolder(nodeData.id);
        service.success(function(data,status,header,config){
            if(0===data.rc){
                console.log(data.msg)
                nodeData.nodes.push(data.msg)
            }else{
                showErrMsg(data.msg)
            }
            //console.log(data.msg)
        }).error(function(data,status,header,config){
            //console.log(data.msg)
        })
/*                nodeData.nodes.push({
         id: nodeData.id * 10 + nodeData.nodes.length,
         title: nodeData.title + '.' + (nodeData.nodes.length + 1),
         nodes: []
         });*/
    };
    $scope.deleteFolder=function(scope){
        var nodeData = scope.$modelValue;
        var service=dataService.deleteFolder(nodeData.id);
        service.success(function(data,status,header,config){
            if(0===data.rc){
                scope.remove()
            }else{
                showErrMsg(data.msg)
            }
            //console.log(data.msg)
        }).error(function(data,status,header,config){
            //console.log(data.msg)
        })
    }


    $scope.startRename=function(scope){
        var nodeData = scope.$modelValue;
        nodeData.edit=true
        nodeData.oldTitle=nodeData.title;//保存当前名字
    }

    $scope.endRename=function(scope){
        var nodeData = scope.$modelValue;
        if(!nodeData.edit){return true} //当前没有处于编辑状态，直接退出
        //新旧名字改过了,才发送request到server
        if(nodeData.oldTitle!=nodeData.title){
            if(nodeData.folder){
                var service=dataService.renameFolder(nodeData.id,nodeData.oldTitle,nodeData.title)
            }else{
                var service=dataService.renameArticle(nodeData.id,nodeData.title)//调用article的函数,无需oldTitle
            }
            service.success(function(data,status,header,config){
                if(0===data.rc){
                    nodeData.oldTitle=undefined;
                    nodeData.edit=false;
                }else{
                    showErrMsg(data.msg)
                }
                //console.log(data.msg)
            }).error(function(data,status,header,config){
                //console.log(data.msg)
            })
        }else{
            nodeData.oldTitle=undefined;
            nodeData.edit=false;
        }
    }

    $scope.deleteArticle=function(scope){
        var nodeData = scope.$modelValue;
        var parentScope=scope.$parentNodeScope
        var parentNodeData=parentScope.$modelValue
        if('垃圾箱'===parentNodeData.title){
            //直接删除
            var service=dataService.removeArticle(nodeData.id);
            service.success(function(data,status,header,config){
                if(0===data.rc){
                    scope.remove()
                }else{
                    showErrMsg(data.msg)
                }
                //console.log(data.msg)
            }).error(function(data,status,header,config){
                //console.log(data.msg)
            })
        }else{
            //移动到垃圾箱
            var service=dataService.deleteArticle(nodeData.id,parentNodeData.id);
            service.success(function(data,status,header,config){
                if(0===data.rc){
                    //console.log(scope)
                    scope.remove()
                    //console.log(scope)
                    $scope.data[1].nodes.push(nodeData)
                }else{
                    showErrMsg(data.msg)
                }
                //console.log(data.msg)
            }).error(function(data,status,header,config){
                //console.log(data.msg)
            })
        }

        service.success(function(data,status,header,config){
            if(0===data.rc){
                scope.remove()
            }else{
                showErrMsg(data.msg)
            }
            //console.log(data.msg)
        }).error(function(data,status,header,config){
            //console.log(data.msg)
        })
    }
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
    /*$scope.data = [{
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
    }];*/
})