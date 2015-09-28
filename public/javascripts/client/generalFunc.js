/**
 * Created by zw on 2015/9/27.
 */
var generalFuncApp=angular.module('generalFuncApp',[]);

/*generalFuncApp.constant('inputDefine',{
    showErrMsg:function(modalInfo,msg){
        modalInfo={state:'show',title:'错误',msg:msg,
            close:function(){
                this.state=''
            }
        }
    }
})*/

generalFuncApp.factory('func',function(){
    var showErrMsg=function(msg){
         return {state:'show',title:'错误',msg:msg,
            close:function(){
                this.state=''
            }
        }

    }

    var generatePaginationRange=function(paginationInfo){
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
    }
    return {showErrMsg:showErrMsg,generatePaginationRange:generatePaginationRange}
})