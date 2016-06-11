/**
 * Created by wzhan039 on 2015-08-25.
 */
var app=angular.module('app',['ui.tree','inputDefineApp','generalFuncApp']);

app.factory('dataService',function($http){
    //检测当前目录是否为根目录
    var checkIfRootFolder=function(folderId){
        return $http.put('personalArticle/checkIfRootFolder',{folderId:folderId},{});
    }
    //读取根目录的下级信息(子目录和文档)
    var readRootFolder=function(){
        return $http.put('personalArticle',{});
    }
    //读取目录的下级信息(子目录和文档)
    var readFolder=function(folderId){
        return $http.put('personalArticle/readFolder',{folderId:folderId},{});
    }
    //修改目录名字
    var renameFolder=function(folderId,oldName,newName){
        return $http.put('personalArticle/rename',{folderId:folderId,oldFolderName:oldName,newFolderName:newName},{});
    }
    //移动目录
    var moveFolder=function(folderId,oldParentFolderId,newParentFolderId){
        return $http.put('personalArticle/moveFolder',{folderId:folderId,oldParentFolderId:oldParentFolderId,newParentFolderId:newParentFolderId},{});
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
        return $http.put('personalArticle/deleteArticle',{articleHashId:articleHashId,oldParentFolderId:oldParentFolderId},{});
    }
    //移动文档
    var moveArticle=function(articleId,oldParentFolderId,newParentFolderId){
        return $http.put('personalArticle/moveArticle',{articleId:articleId,oldParentFolderId:oldParentFolderId,newParentFolderId:newParentFolderId},{});
    }
    //更改文档名
    var updateArticle=function(articleHashId,articleNewName,state){
        return $http.put('personalArticle/updateArticle',{articleHashId:articleHashId,articleNewName:articleNewName,state:state},{});
    }
    //获得文档分页信息
    var pagination=function(total,curPage){
        return $http.put('personalArticle/pagination',{total:total,curPage:curPage},{})
    }
    return {checkIfRootFolder:checkIfRootFolder,readRootFolder:readRootFolder,readFolder:readFolder,renameFolder:renameFolder,moveFolder:moveFolder,createFolder:createFolder,deleteFolder:deleteFolder,
        createArticleFolder:createArticleFolder,removeArticle:removeArticle,deleteArticle:deleteArticle,moveArticle:moveArticle,updateArticle:updateArticle,
        pagination:pagination}
})

//1. $scope.subItemInFolder：点击folder时，把其下nodes中的所有数据，包括目录和文档（引用）存储在此变量中
//2.   $scope.subArticleInFolder:  从1通过getCurPageArticle过滤出来所有article
//3.    $scope.curPageArticles:     从2中根据pagination得出的当前显示数据
app.controller('personalArticleController',function($scope,dataService,inputDefine,func,$window){
/*    var showErrMsg=function(msg){
        $scope.errorModal=func.showErrMsg(data.msg)
*//*        {state:'show',title:'错误',msg:msg,
            close:function(){
                this.state=''
            }
        }*//*
    };*/
    $scope.curFolderName="尚未选择文件夹"
    var checkIfRoot=function(node){
        var rootFolder=['我的文件夹','垃圾箱']
        return -1!=rootFolder.indexOf(node.title)
    }


/*    //点击folder,在右侧显示其下所有folder和article
    $scope.readFolderAndArticle=function(scope){
        //if(scope.collapsed){
        //    console.log('open')
        //}
        //console.log($scope.subItemInFolder)
        $scope.subItemInFolder=scope.$modelValue.nodes
        console.log($scope.subItemInFolder)
    }*/

    $scope.tableEdit=function(idx){
        var curItem=$scope.curPageArticles[idx]
        //console.log(curItem)
        curItem.tableEdit=!curItem.tableEdit
        curItem.oldTitle=curItem.title;
        curItem.oldState=curItem.state;
    }
    $scope.tableRemoveArticle=function(idx){
        var curItem=$scope.curPageArticles[idx]
        var sourceFolderId=$scope.curFolderId
        var articleHashId=curItem.id
        var service=dataService.deleteArticle(articleHashId,sourceFolderId)

        service.success(function(data,status,header,config){
            if(0===data.rc){
                $scope.curPageArticles.splice(idx,1)
            }else{
                $scope.errorModal=func.showErrMsg(data.msg)
                //showErrMsg(data.msg)
                return false
            }
            //console.log(data.msg)
        }).error(function(data,status,header,config){
            //console.log(data.msg)
        })
    }
    $scope.tableCancelEdit=function(idx){
        var curItem=$scope.curPageArticles[idx]
//console.log(curItem)
        curItem.tableEdit=!curItem.tableEdit
        curItem.title=curItem.oldTitle;
        curItem.state=curItem.oldState;
        curItem.oldTitle=undefined;
        curItem.oldState=undefined;
    }
    $scope.tableSaveArticle=function(idx){
        var curItem=$scope.curPageArticles[idx]
        var oldTitle=curItem.oldTitle;
        var curTitle=curItem.title;
        var oldState=curItem.oldState;
        var curState=curItem.state;
        var articleHashId=curItem.id;

        if(oldTitle===curTitle && oldState===curState){
            return true
        }else{
            var service=dataService.updateArticle(articleHashId,curTitle,curState)
            service.success(function(data,status,header,config){
                if(0===data.rc){
                    curItem.oldTitle=undefined;
                    curItem.oldState=undefined;
                    curItem.tableEdit=false
                }else{
                    $scope.errorModal=func.showErrMsg(data.msg)
                    //showErrMsg(data.msg)
                    return false
                }
                //console.log(data.msg)
            }).error(function(data,status,header,config){
                //console.log(data.msg)
            })
        }

    }

    var getCurPageArticle=function(curPage){
        //如果没有子目录和文档，无需执行任何操作
        if(0===$scope.subItemInFolder.length){
            return true
        }

        //curPage对应的数据
        $scope.curPageArticles=[]
        //过滤子文档
        $scope.subArticleInFolder=[]
        for(var i=0;i<$scope.subItemInFolder.length;i++){
            if(!$scope.subItemInFolder[i].folder){
                $scope.subArticleInFolder.push($scope.subItemInFolder[i])
            }
        }
        //过滤出的文档数量为0，无需执行任何操作
        if(0===$scope.subArticleInFolder.length){
            return true
        }
        var service=dataService.pagination($scope.subArticleInFolder.length,curPage)
        service.success(function(data,status,header,config){
            if(0===data.rc){
//获得分页信息，根据分页信息获得当前页的数据
                $scope.paginationInfo=data.msg;
                //必需和general.js中一致
                var articleFolderPageSize=3;
                var articleFolderPageLength=5;
                //可能在后端重新计算过curPage
                var newCurPage=$scope.paginationInfo.curPage
                var startIdx=(newCurPage-1)*articleFolderPageSize
                var endIdx=startIdx+articleFolderPageSize-1;
                var lastIdx=$scope.subArticleInFolder.length-1;//所有文档的最后一个idx
                if(endIdx>lastIdx){endIdx=lastIdx}
                for(var i=startIdx;i<=endIdx;i++){
                    $scope.curPageArticles.push($scope.subArticleInFolder[i])
                }
                $scope.pageRange=func.generatePaginationRange($scope.paginationInfo)
            }else{
                $scope.errorModal=func.showErrMsg(data.msg)
                //showErrMsg(data.msg)
                return false
            }
            //console.log(data.msg)
        }).error(function(data,status,header,config){
            //console.log(data.msg)
        })
    }

   /* var generatePaginationRange=function(paginationInfo){
        var start=paginationInfo.start;
        var end=paginationInfo.end;
        var curPage=paginationInfo.curPage;
        var pageRange=[];
        if(0!=end && 0!=start && end>start){
            var pageNum=end-start+1
            for(var i=0;i<pageNum;i++){
                var ele={pageNo:start+i,active:''}
                if(curPage==start+i){
                    ele.active='active'
                }
                pageRange.push(ele)
            }
        }
        if(0!=end && 0!=start && end===start){
            var ele={pageNo:start,active:''}
            ele.active='active';
            pageRange.push(ele)
        }
//console.log(pageRange)
        return pageRange
    }*/
    $scope.getCurPageArticle=function(curPage){
        getCurPageArticle(curPage)
    }
    $scope.treeOptions = {
        //判断当前节点是否可以移动
        beforeDrag:function(sourceNodeScope){
            var sourceNode=sourceNodeScope.$modelValue
            //console.log(sourceNode.folder && checkIfRoot(sourceNode))
            //源节点为default,则不能移动
            //先在客户端产
            if(sourceNode.folder && checkIfRoot(sourceNode)){
                //然后在server端查询
                var service=dataService.checkIfRootFolder(sourceNode.id)
                service.success(function(data,status,header,config){
                    if(0===data.rc){
                        return data.msg
                    }else{
                        $scope.errorModal=func.showErrMsg(data.msg)
                        //showErrMsg(data.msg)
                        return false
                    }
                    //console.log(data.msg)
                }).error(function(data,status,header,config){
                    //console.log(data.msg)
                })
            }else{
                return true
            }
        },
        //don't use beforeDrag cause it will trigger twice
/*        dragMove:function(event){
            var sourceNodeScope=event.source.nodeScope;


        },*/
        beforeDrop:function(event){
            var sourceNode=event.source.nodeScope.$modelValue;
            var destNode=event.dest.nodesScope.$modelValue;
/*            console.log(event.dest.index)
            console.log(sourceNode)
            console.log(destNode)*/
        },
        //accept在节点移动时,会触发多次,所以不适用
/*        accept: function(sourceNodeScope, destNodesScope, destIndex) {
            var sourceNode=sourceNodeScope.$modelValue
            var sourceParentNode=sourceNodeScope.$parentNodeScope.$modelValue
            var destParentNode=destNodesScope.$nodeScope.$modelValue
            console.log('log')
*//*            //如果当前
            if(sourceNodeScope.folder && checkIfRoot(sourceNode)){
                return false
            }
            return (null!=destNodesScope.$nodeScope)
            //return true*//*
        },*/
        dropped:function(event){
            //console.log('dropped')
            //return false
            var sourceNode=event.source.nodeScope.$modelValue;
            var sourceParentNode=event.source.nodeScope.$parentNodeScope.$modelValue
            var parentDestNode=event.dest.nodesScope.$nodeScope.$modelValue;
            //父节点不变，无需触发move操作
            if(sourceParentNode.id===parentDestNode.id){
                return true
            }
            //console.log(sourceNode)
            //console.log(sourceNode.id)
            //console.log(parentDestNode.id)
            if(sourceNode.folder){
                var service=dataService.moveFolder(sourceNode.id,sourceParentNode.id,parentDestNode.id)
            }else{
                var service=dataService.moveArticle(sourceNode.id,sourceParentNode.id,parentDestNode.id)
            }
            service.success(function(data,status,header,config){
                if(0===data.rc){
                    $scope.subItemInFolder=parentDestNode.nodes
                    setTimeout(function(){
                            getCurPageArticle(1)
                        }
                        ,1000)

                    return true
                }else{
                    $scope.errorModal=func.showErrMsg(data.msg)
                    //showErrMsg(data.msg)
                    return false
                }
                //console.log(data.msg)
            }).error(function(data,status,header,config){
                //console.log(data.msg)
            })

        }


    };

    setTimeout(function(){
            var service=dataService.readRootFolder();
            service.success(function(data,status,header,config){
                if(0===data.rc){
                    $scope.data=data.msg.defaultRootFolder
                    $scope.userInfo=data.msg.userInfo
                    //console.log($scope.data)
                }else{
                    $scope.errorModal=func.showErrMsg(data.msg)
                }
                //console.log(data.msg)
            }).error(function(data,status,header,config){
                //console.log(data.msg)
            })
            $scope.remove = function (scope) {
                /*        console.log('in')
                 console.log(scope.collapsed)
                 console.log(scope.$parentNodeScope)*/
                //scope.remove();

            };
    }
        ,1000)


    $scope.toggle = function (scope) {
        //console.log('toggle')
        scope.toggle();

    };

    $scope.moveLastToTheBeginning = function () {
        var a = $scope.data.pop();
        $scope.data.splice(0, 0, a);
    };

    $scope.lastClickFolderId=undefined//初始化

    $scope.expandFolder = function (scope) {
        //console.log(scope.collapsed)

        var nodeData = scope.$modelValue;

        //console.log(nodeData.nodes.length)

        if(true===scope.collapsed){
            //处于折叠状态,并且nodes的长度是0(server端已经初始化过为[]),说明没有打开过,才需要重新读取数据
        //|| JSON.stringify(nodeData.nodes)==='[{}]'
        //    var readData=false
        //    if(undefined===$scope.lastClickFolderId){
        //        readData=true
        //        $scope.lastClickFolderId=nodeData.id
        //        //$scope.lastCilckFolderId=nodeData.id
        //    }else{
        //        console.log($scope.lastClickFolderId)
        //        if($scope.lastClickFolderId===nodeData.id){
        //            readData=false
        //        }else{
        //            readData=true
        //            $scope.lastClickFolderId=nodeData.id
        //        }
        //        console.log(readData)
        //        console.log(nodeData)
        //
        //    }
        //    if(true===readData ){// && 0===nodeData.nodes.length

                var service=dataService.readFolder(nodeData.id)
                service.success(function(data,status,header,config){
                    nodeData.nodes=[];
                    if(0===data.rc){
                        nodeData.nodes=data.msg;//返回的是数组,所以直接赋值
                        $scope.curFolderName=nodeData.title;//在table上显示
                        $scope.curFolderId=nodeData.id;//保存当前folder的id
                        $scope.subItemInFolder=scope.$modelValue.nodes;//打开目录的同时,把其下的文档显示在table中;不直接使用data.msg,而用ui-tree的数据,以便保持tree和table间的同步;需要包含当前目录名,以便显示在table上
                        $scope.paginationInfo=data.pagination
                        setTimeout(function(){
                                getCurPageArticle(1)
                            }
                            ,1000)
                        //console.log('expand')
                        scope.expand()
                        //scope.collapsed=false
                    }else{
                        $scope.errorModal=func.showErrMsg(data.msg)
                        //showErrMsg(data.msg)
                    }
                    //console.log(data.msg)
                }).error(function(data,status,header,config){
                    //console.log(data.msg)
                })
            //}
        }
    };
    $scope.addNewArticle = function (scope) {
        var nodeData = scope.$modelValue;
        $scope.expandFolder(scope)
        var service=dataService.createArticleFolder(nodeData.id);
        service.success(function(data,status,header,config){
            if(0===data.rc){
                //打开状态，或者子节点不为空，才push
                //if(!scope.collapsed || 0!==nodeData.nodes.length){
                    nodeData.nodes.push(data.msg)
                    $scope.subItemInFolder=nodeData.nodes//同步到table数据
                //console.log($scope.paginationInfo)
                    var curPage;
                    if(undefined===$scope.paginationInfo){
                        curPage=1
                    }else{
                        curPage=$scope.paginationInfo.curPage
                    }

                setTimeout(function(){
                        getCurPageArticle(curPage)
                    }
                    ,1000)

                //}

            }else{
                $scope.errorModal=func.showErrMsg(data.msg)
                //showErrMsg(data.msg)
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
//        console.log(nodeData.id)
        var service=dataService.createFolder(nodeData.id);
        service.success(function(data,status,header,config){
            if(0===data.rc){
                //console.log(data.msg)
                nodeData.nodes.push(data.msg)
                $scope.subItemInFolder=nodeData.nodes//同步到table数据
            }else{
                $scope.errorModal=func.showErrMsg(data.msg)
                //showErrMsg(data.msg)
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
                $scope.subItemInFolder=scope.$parentNodesScope//同步到table
            }else{
                $scope.errorModal=func.showErrMsg(data.msg)
                //showErrMsg(data.msg)
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
                var service=dataService.updateArticle(nodeData.id,nodeData.title)//调用article的函数,无需oldTitle
            }
            service.success(function(data,status,header,config){
                if(0===data.rc){
                    nodeData.oldTitle=undefined;
                    nodeData.edit=false;
                }else{
                    $scope.errorModal=func.showErrMsg(data.msg)
                    //showErrMsg(data.msg)
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
                    $scope.subItemInFolder=scope.$parentNodesScope//同步到table
                    setTimeout(function(){
                            getCurPageArticle($scope.paginationInfo.curPage)
                        }
                        ,1000)

                }else{
                    $scope.errorModal=func.showErrMsg(data.msg)
                    //showErrMsg(data.msg)
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
                    setTimeout(function(){
                            getCurPageArticle($scope.paginationInfo.curPage)
                        }
                        ,1000)

                }else{
                    $scope.errorModal=func.showErrMsg(data.msg)
                    //showErrMsg(data.msg)
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
                $scope.errorModal=func.showErrMsg(data.msg)
                //showErrMsg(data.msg)
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
    $scope.search=function(){
//console.log($scope.searchString,inputDefine.search.searchTotalKeyLen.define)
        var convertedString=func.convertInputSearchString($scope.searchString,inputDefine.search.searchTotalKeyLen.define)
        //console.log(convertedString)
        //搜索字符串为空，直接返回
        if(false===convertedString){
            return false
        }
        $window.location.href='/searchResult?wd='+convertedString
    }
})