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

generalFuncApp.factory('func',function($http){

    var quit=function(){
        return $http.post('/logOut',{},{})
    }
    var showErrMsg=function(msg){
         return {state:'show',title:'错误',msg:msg,
            close:function(){
                this.state=''
            }
        }

    }

    var showInfoMsg=function(msg){
        return {state:'show',title:'信息',msg:msg,
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

    //把input中用空格分隔的字符转换成+分割，并且长度在允许范围内的字符，以便在url中传输
    var convertInputSearchString=function(searchString,totalLen){
        if(undefined!==searchString || ''!==searchString ){
            var tmpStr=searchString.split(/\s+/)
            //var totalLen=general.searchTotalKeyLen
            var strNum=tmpStr.length
            var curStrLen=0;//计算当前处理的字符长度
            var curStr='';//转换后的搜索字符串（使用空格分隔）
            for(var i=0;i<strNum;i++){
                //第一个key就超长，直接截取20个字符
                if(0===i && tmpStr[0].length>totalLen){
                    curStr=tmpStr[0].substring(0,totalLen)
                    return curStr.trim()
                }
                //如果当前已经处理的字符串+下一个要处理的字符串的长度超出，返回当前已经处理的字符串，舍弃之后的字符串
                //-i:忽略空格的长度
                if(curStr.length+tmpStr[i].length-i>totalLen){
                    return curStr.trim()
                }
                curStr+=tmpStr[i]
                curStr+=' ';

            }

            return curStr.trim()
        }else{
            return false
        }
    }

    //从客户端返回的日期字符串=>正常格式
    var formatLongDate=function(date){
        var reg=/T/g
        var reg1=/\.\d{3}Z/g
        return date.toString().replace(reg,' ').replace(reg1,' ');
    }
    var formatShortDate=function(date){
        var reg=/T.+/g
        //var reg1=/\.\d{3}Z/g
        return date.toString().replace(reg,' ');
    }

    var getDate=function(dateString){
        var p=/\s+/
        var tmpStr=dateString.split(p)
        if(2===tmpStr){
            return tmpStr[0]
        }
        return false
    }

    var getTime=function(dateString){
        var p=/\s+/
        var tmpStr=dateString.split(p)
        if(2===tmpStr){
            return tmpStr[1]
        }
        return false
    }


    return {
        quit:quit,
        showInfoMsg:showInfoMsg,
        showErrMsg:showErrMsg,
        generatePaginationRange:generatePaginationRange,
        convertInputSearchString:convertInputSearchString,
        formatLongDate:formatLongDate,
        formatShortDate:formatShortDate,
        getDate:getDate,
        getTime:getTime,

    }
})

generalFuncApp.service('asyncFunc',function($q){
    //0. 检测fileRead是否可用
    //1，根据readType检测文件类型是否正确
    //2. 检测文件size是否介于0和maxLength
    //3. 根据readType读取文件
    var readFile=function(inputId,readType,maxLength){
        //在onload触发之后，才能获得file内容，所以是异步操作
        var deferred = $q.defer();
        if(undefined === typeof FileReader){
            deferred.resolve({rc:1,msg:"当前浏览器版本过低，请升级到最新版本后重试"});
            return deferred.promise;
        }

        var reader=new FileReader()
        var file=document.getElementById(inputId).files[0]

        if(undefined===file){
            deferred.resolve ({rc:2,msg:'请先选择要上传的文件'})
            return deferred.promise
            //return {rc:2,msg:'请先选择要上传的文件'}
        }

        if(0===file.size){
            deferred.resolve({rc:3,msg:'文件内容为空'})
            return deferred.promise;
        }
        if(maxLength<file.size){
            deferred.resolve({rc:4,msg:'文件超过预定义大小'})
            return deferred.promise;
        }
//console.log(file)
        switch (readType){
            case 'text':
                if('text/plain'!==file.type){
                    deferred.resolve({rc:5,msg:'文件必须是文本文件'})
                }
                reader.readAsText(file)
                reader.onload=function(e){
                    deferred.resolve(this.result)
                }
                break;
            case 'dataURL':
                if('image/png'!==file.type && 'image/jpeg'!==file.type && 'image/gif'!==file.type){
                    deferred.resolve({rc:6,msg:'文件必须是图片文件'})
                }
                reader.readAsDataURL(file)
                reader.onload=function(e){
                    deferred.resolve(this.result)
                }

                break;
            case 'binary':
                reader.readAsBinaryString(file)
                reader.onload=function(e){
                    deferred.resolve(this.result)
                }
                break;
            default:
            //        default is text
                reader.readAsText(file)
                reader.onload=function(e){
                    deferred.resolve(this.result)
                }
        }
        //deferred.resolve(blob);
        return deferred.promise;
    }

    return {readFile:readFile,}
})