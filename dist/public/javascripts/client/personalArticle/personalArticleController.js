var app=angular.module("app",["ui.tree","inputDefineApp","generalFuncApp"]);app.factory("dataService",["$http",function(a){var b=function(b){return a.post("personalArticle/checkIfRootFolder",{folderId:b},{})},c=function(){return a.post("personalArticle",{},{})},d=function(b){return a.post("personalArticle/readFolder",{folderId:b},{})},e=function(b,c,d){return a.post("personalArticle/rename",{folderId:b,oldFolderName:c,newFolderName:d},{})},f=function(b,c,d){return a.post("personalArticle/moveFolder",{folderId:b,oldParentFolderId:c,newParentFolderId:d},{})},g=function(b,c){return a.post("personalArticle/createFolder",{parentFolderId:b,folderName:c},{})},h=function(b){return a.post("personalArticle/deleteFolder",{folderId:b},{})},i=function(b,c){return a.post("personalArticle/createArticleFolder",{parentFolderId:b},{})},j=function(b){return a.post("personalArticle/removeArticle",{articleHashId:b},{})},k=function(b,c){return a.post("personalArticle/deleteArticle",{articleHashId:b,oldParentFolderId:c},{})},l=function(b,c,d){return a.post("personalArticle/moveArticle",{articleId:b,oldParentFolderId:c,newParentFolderId:d},{})},m=function(b,c,d){return a.post("personalArticle/updateArticle",{articleHashId:b,articleNewName:c,state:d},{})},n=function(b,c){return a.post("personalArticle/pagination",{total:b,curPage:c},{})};return{checkIfRootFolder:b,readRootFolder:c,readFolder:d,renameFolder:e,moveFolder:f,createFolder:g,deleteFolder:h,createArticleFolder:i,removeArticle:j,deleteArticle:k,moveArticle:l,updateArticle:m,pagination:n}}]),app.controller("personalArticleController",["$scope","dataService","inputDefine","func","$window",function(a,b,c,d,e){a.curFolderName="尚未选择文件夹";var f=function(a){var b=["我的文件夹","垃圾箱"];return-1!=b.indexOf(a.title)};a.tableEdit=function(b){var c=a.curPageArticles[b];c.tableEdit=!c.tableEdit,c.oldTitle=c.title,c.oldState=c.state},a.tableRemoveArticle=function(c){var e=a.curPageArticles[c],f=a.curFolderId,g=e.id,h=b.deleteArticle(g,f);h.success(function(b,e,f,g){return 0!==b.rc?(a.errorModal=d.showErrMsg(b.msg),!1):void a.curPageArticles.splice(c,1)}).error(function(a,b,c,d){})},a.tableCancelEdit=function(b){var c=a.curPageArticles[b];c.tableEdit=!c.tableEdit,c.title=c.oldTitle,c.state=c.oldState,c.oldTitle=void 0,c.oldState=void 0},a.tableSaveArticle=function(c){var e=a.curPageArticles[c],f=e.oldTitle,g=e.title,h=e.oldState,i=e.state,j=e.id;if(f===g&&h===i)return!0;var k=b.updateArticle(j,g,i);k.success(function(b,c,f,g){return 0!==b.rc?(a.errorModal=d.showErrMsg(b.msg),!1):(e.oldTitle=void 0,e.oldState=void 0,e.tableEdit=!1,void 0)}).error(function(a,b,c,d){})};var g=function(c){if(0===a.subItemInFolder.length)return!0;a.curPageArticles=[],a.subArticleInFolder=[];for(var e=0;e<a.subItemInFolder.length;e++)a.subItemInFolder[e].folder||a.subArticleInFolder.push(a.subItemInFolder[e]);if(0===a.subArticleInFolder.length)return!0;var f=b.pagination(a.subArticleInFolder.length,c);f.success(function(b,c,e,f){if(0!==b.rc)return a.errorModal=d.showErrMsg(b.msg),!1;a.paginationInfo=b.msg;var g=3,h=a.paginationInfo.curPage,i=(h-1)*g,j=i+g-1,k=a.subArticleInFolder.length-1;j>k&&(j=k);for(var l=i;j>=l;l++)a.curPageArticles.push(a.subArticleInFolder[l]);a.pageRange=d.generatePaginationRange(a.paginationInfo)}).error(function(a,b,c,d){})};a.getCurPageArticle=function(a){g(a)},a.treeOptions={beforeDrag:function(c){var e=c.$modelValue;if(!e.folder||!f(e))return!0;var g=b.checkIfRootFolder(e.id);g.success(function(b,c,e,f){return 0===b.rc?b.msg:(a.errorModal=d.showErrMsg(b.msg),!1)}).error(function(a,b,c,d){})},beforeDrop:function(a){a.source.nodeScope.$modelValue,a.dest.nodesScope.$modelValue},dropped:function(c){var e=c.source.nodeScope.$modelValue,f=c.source.nodeScope.$parentNodeScope.$modelValue,h=c.dest.nodesScope.$nodeScope.$modelValue;if(f.id===h.id)return!0;if(e.folder)var i=b.moveFolder(e.id,f.id,h.id);else var i=b.moveArticle(e.id,f.id,h.id);i.success(function(b,c,e,f){return 0===b.rc?(a.subItemInFolder=h.nodes,setTimeout(function(){g(1)},1e3),!0):(a.errorModal=d.showErrMsg(b.msg),!1)}).error(function(a,b,c,d){})}},setTimeout(function(){var c=b.readRootFolder();c.success(function(b,c,e,f){0===b.rc?(a.data=b.msg.defaultRootFolder,a.userInfo=b.msg.userInfo):a.errorModal=d.showErrMsg(b.msg)}).error(function(a,b,c,d){}),a.remove=function(a){}},1e3),a.toggle=function(a){a.toggle()},a.moveLastToTheBeginning=function(){var b=a.data.pop();a.data.splice(0,0,b)},a.lastClickFolderId=void 0,a.expandFolder=function(c){var e=c.$modelValue;if(!0===c.collapsed){var f=b.readFolder(e.id);f.success(function(b,f,h,i){e.nodes=[],0===b.rc?(e.nodes=b.msg,a.curFolderName=e.title,a.curFolderId=e.id,a.subItemInFolder=c.$modelValue.nodes,a.paginationInfo=b.pagination,setTimeout(function(){g(1)},1e3),c.expand()):a.errorModal=d.showErrMsg(b.msg)}).error(function(a,b,c,d){})}},a.addNewArticle=function(c){var e=c.$modelValue;a.expandFolder(c);var f=b.createArticleFolder(e.id);f.success(function(b,c,f,h){if(0===b.rc){e.nodes.push(b.msg),a.subItemInFolder=e.nodes;var i;i=void 0===a.paginationInfo?1:a.paginationInfo.curPage,setTimeout(function(){g(i)},1e3)}else a.errorModal=d.showErrMsg(b.msg)}).error(function(a,b,c,d){})},a.addNewFolder=function(c){var e=c.$modelValue;a.expandFolder(c);var f=b.createFolder(e.id);f.success(function(b,c,f,g){0===b.rc?(e.nodes.push(b.msg),a.subItemInFolder=e.nodes):a.errorModal=d.showErrMsg(b.msg)}).error(function(a,b,c,d){})},a.deleteFolder=function(c){var e=c.$modelValue,f=b.deleteFolder(e.id);f.success(function(b,e,f,g){0===b.rc?(c.remove(),a.subItemInFolder=c.$parentNodesScope):a.errorModal=d.showErrMsg(b.msg)}).error(function(a,b,c,d){})},a.startRename=function(a){var b=a.$modelValue;b.edit=!0,b.oldTitle=b.title},a.endRename=function(c){var e=c.$modelValue;if(!e.edit)return!0;if(e.oldTitle!=e.title){if(e.folder)var f=b.renameFolder(e.id,e.oldTitle,e.title);else var f=b.updateArticle(e.id,e.title);f.success(function(b,c,f,g){0===b.rc?(e.oldTitle=void 0,e.edit=!1):a.errorModal=d.showErrMsg(b.msg)}).error(function(a,b,c,d){})}else e.oldTitle=void 0,e.edit=!1},a.deleteArticle=function(c){var e=c.$modelValue,f=c.$parentNodeScope,h=f.$modelValue;if("垃圾箱"===h.title){var i=b.removeArticle(e.id);i.success(function(b,e,f,h){0===b.rc?(c.remove(),a.subItemInFolder=c.$parentNodesScope,setTimeout(function(){g(a.paginationInfo.curPage)},1e3)):a.errorModal=d.showErrMsg(b.msg)}).error(function(a,b,c,d){})}else{var i=b.deleteArticle(e.id,h.id);i.success(function(b,f,h,i){0===b.rc?(c.remove(),a.data[1].nodes.push(e),setTimeout(function(){g(a.paginationInfo.curPage)},1e3)):a.errorModal=d.showErrMsg(b.msg)}).error(function(a,b,c,d){})}i.success(function(b,e,f,g){0===b.rc?c.remove():a.errorModal=d.showErrMsg(b.msg)}).error(function(a,b,c,d){})},a.collapseAll=function(b){a.$broadcast("collapse"),console.log(b.collapsed)},a.collapse=function(b){a.$broadcast("collapse"),console.log(b.collapsed)},a.expandAll=function(){a.$broadcast("expandAll")},a.quit=function(){var a=d.quit();a.success(function(a,b,c,d){0===a.rc&&(e.location.href="main")}).error(function(a,b,c,d){})},a.search=function(){var b=d.convertInputSearchString(a.searchString,c.search.searchTotalKeyLen.define);return!1===b?!1:void(e.location.href="searchResult?wd="+b)}}]);