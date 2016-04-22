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

generalFuncApp.factory('Crop',function(){
    var Crop={
        //L1_origImgId: fileReader读取的DataURL
        //L2_coverZoneId： 用边框产生模糊效果
        //L3_cropImgBorder:产生边框效果
        //所有的计算都基于裁剪区域(不包括任何边框)的top/left（基于页面）
        create:function(options){
            var crop={}
            crop.error= {
                htmlElementNotFind: function (eleId) {
                    //return {rc: 1, msg: 'can\'t find html element ' + eleId}
                    return {rc: 1, msg: '没有找到html元素' + eleId}
                },
                L1origImgMaxWHNotInt:function (WH) {
                    //return {rc: 2, msg: 'The value of L1OrigImg->' + WH + ' can\'t be parsed into number'}
                    return {rc: 2, msg: 'L1OrigImg->' + WH + '的值不是整数'}
                },
                cropImgWHNotInt: function (WH) {
                    //return {rc: 4, msg: 'The value of cropImgWH->' + WH + ' can\'t be parsed into number'}
                    return {rc: 4, msg: 'cropImgWH->' + WH + '的值不是整数'}
                },
                cropZoneBorderWHNotInt: function (WH) {
                    //return {rc: 6, msg: 'The value of L3BorderWidth->' + WH + ' can\'t be parsed into number'}
                    return {rc: 6, msg: 'L3BorderWidth->' + WH + '的值不是整数'}
                },
                cropZoneWHNotPositive: function (WH) {
                    //return {rc: 8, msg: 'The value of cropZoneWH->' + WH + ' can\'t be negative value'}
                    return {rc: 8, msg: 'cropZoneWH->' + WH + '的值不是正数'}
                },
                cropZoneBorderWHNotPositive: function (WH) {
                    //return {rc: 10, msg: 'The value of L3BorderWidth->' + WH + ' can\'t be negative value'}
                    return {rc: 10, msg: 'L3BorderWidth->' + WH + '的值不是正数'}
                },

                L1origImgMaxWHNotPositive:function (WH) {
                    //return {rc: 11, msg: 'The value of L1OrigImg->' + WH + ' can\'t be negative value'}
                    return {rc: 11, msg: 'L1OrigImg->' + WH + '的值不是正数'}
                },
                //imageNotReady: {rc: 12, msg: 'read image info failed'},
                imageNotReady: {rc: 12, msg: '图片尚未加载完成，无法读取图片信息'},
                L1origImgMaxWHExceed:function (WH) {
                    //return {rc: 14, msg: 'The value of L1OrigImgMaxWH->' + WH + ' exceed max value'}
                    return {rc: 14, msg: 'L1OrigImgMaxWH->' + WH + '超出定义的最大值'}
                },
            }
            crop.defaultOptions={
                elementId:{
                    L1_origImg:'L1_origImg',
                    L2_coverZone:'L2_coverZone',
                    L3_cropImgBorder:'L3_cropImgBorder',
                    croppedImg:'croppedImg',
                },
                L1origImgMaxWH:{
                    width:1376,
                    height:768
                },
                L3BorderWidth:{
                    borderLeftWidth:10,
                    borderTopWidth:10,
                },
                //最终裁剪出来的图片size
                cropImgWH:{
                    width:100,
                    height:100,
                },
                //滚轮滚动时，WH
                zoomStep:{
                    horizontal:5,//左右每边
                    vertical:5,//上下每边
                },
                bindedEvent:{
                    zoomZone:'mousewheel DOMMouseScroll',
                    moveZone:'mousemove',//bind to body, when this event binded, the choose img in L1_origImg show in L3_cropImgBorder
                    cropChooseImg:'click', //bind to L3_cropImgBorder, this event define if moveZone still be binded(L3_cropImgBorder still show choosn img or not)
                }
            }
            //crop.cropEnable=false
            crop.bindState=false//代表当前bind状态
            crop.allowBindEvent=false//是否可以在原始图片上绑定事件（移动然后剪切，小图片无此操作）
            //必须是jquery元素，以便使用bind
            crop.container=$('body')
            //cropZone当前的top/left参数，based on L1_origImg,随着鼠标移动而变化
            crop.currentCropZone={}
            crop.allElement={}
            //原始图片的参数，读取完图片后，就是固定值(top,left,width,height)
            crop.L1_origImgPos=undefined
            crop.isInt=function(value){
                switch (typeof value) {
                    case 'string':
                        if (parseInt(value).toString() === value) {
                            return true
                        } else {
                            return false
                        }
                        break;
                    case 'number':
                        if (parseInt(value) === value) {
                            return true
                        } else {
                            return false
                        }
                        break;
                    default:
                        return false
                }
            }
            crop.init_part1=function() {
                //1. 初始化全局参数
                crop.cropEnable = false//是否可以剪切
                crop.bindState = false//代表当前bind状态
                crop.allowBindEvent = false//无法进行绑定
                crop.currentCropZone = {}
                //crop.cropZoneWH={}
                var defaultOptions = crop.defaultOptions
                // 2. merge options into defaultOptions
                if (options) {
                    for (var item in defaultOptions) {
                        //item子项没有填写，使用default的设置（直接continue）
                        if (!options[item]) {
                            continue
                        }
                        for (var subItem in defaultOptions[item]) {
                            if (!options[item][subItem]) {
                                continue
                            }
                            defaultOptions[item][subItem] = options[item][subItem]
                        }
                    }
                }

                //3  元素是否存在
                for (var eleId in defaultOptions['elementId']) {
                    if (null === document.getElementById(defaultOptions['elementId'][eleId])) {

                        return crop.error.htmlElementNotFind(defaultOptions['elementId'][eleId])
                    } else {
                        this.allElement[eleId] = document.getElementById(defaultOptions['elementId'][eleId])
                    }
                }
                var value
                //4 是否为整数
                for (var WH in defaultOptions['cropImgWH']) {
                    value = defaultOptions['cropImgWH'][WH]
                    if(true===crop.isInt(value)){
                        defaultOptions['cropImgWH'][WH] = parseInt(value)
                    }else{
                        return crop.error.cropImgWHNotInt(WH)
                    }
                }
                for (var WH in defaultOptions['L3BorderWidth']) {
                    value = defaultOptions['L3BorderWidth'][WH]
                    if(true===crop.isInt(value)){
                        defaultOptions['cropImgWH'][WH] = parseInt(value)
                    }else{
                        return crop.error.cropZoneBorderWHNotInt(WH)
                    }
                }
                for (var WH in defaultOptions['L1origImgMaxWH']) {
                    value = defaultOptions['L1origImgMaxWH'][WH]
                    if(true===crop.isInt(value)){
                        defaultOptions['L1origImgMaxWH'][WH] = parseInt(value)
                    }else{
                        return crop.error.L1origImgMaxWHNotInt(WH)
                    }
                }
                //5 检测是否为正数
                for (var WH in defaultOptions.cropImgWH) {
                    if(0>defaultOptions.cropImgWH[WH]){
                        return crop.error.cropImgWHNotInt(WH)
                    }
                }
                for (var WH in defaultOptions['L3BorderWidth']) {
                    if(0>defaultOptions['L3BorderWidth'][WH]){
                        return crop.error.cropZoneBorderWHNotPositive(WH)
                    }
                }
                for (var WH in defaultOptions.L1origImgMaxWH) {
                    if(0>defaultOptions.L1origImgMaxWH[WH]){
                        return crop.error.L1origImgMaxWHNotPositive(WH)
                    }
                }
                return {rc:0}
            }


            //根据原始img的信息，设置对应的L2、L3的参数
            //因为img载入数据可能有延迟，导致读取img信息（getBoundingClientRect）可能出错，所以init分成2部分，第二部分延迟一定时间
            crop.init_part2=function(){
                //检测origImg是否超出最大定义
                for(var WH in crop.defaultOptions.L1origImgMaxWH){
                    if(crop.L1_origImgPos[WH]>crop.defaultOptions.L1origImgMaxWH[WH]){
                        return crop.error.L1origImgMaxWHExceed(WH)
                    }
                }
                //只有符合条件的情况下，才能显示原始图片
                //crop.allElement.L1_origImg.style.display='';
                //初始裁减框，相对于页面的位置，和L1_origImg一样，WH和destImg一样（接下来可能会被鼠标缩放）
                crop.currentCropZone['top']=crop.L1_origImgPos.top
                crop.currentCropZone['left']=crop.L1_origImgPos.left
                crop.currentCropZone['width']=crop.defaultOptions.cropImgWH.width
                crop.currentCropZone['height']=crop.defaultOptions.cropImgWH.height
                //每次初始化，先unbind可能的事件
                crop.container.unbind(crop.defaultOptions.bindedEvent.moveZone)
                //绑定zoom事件
                $('#'+crop.defaultOptions.elementId.L3_cropImgBorder).unbind(crop.defaultOptions.bindedEvent.zoomZone)
                //绑定click事件
                $('#'+crop.defaultOptions.elementId.L3_cropImgBorder).unbind(crop.defaultOptions.bindedEvent.cropChooseImg)
                //只有当原始图像的长度 或者 宽度大于裁剪区域，才显示L2和L3，并绑定事件
                if(crop.L1_origImgPos.width>crop.defaultOptions.cropImgWH.width || crop.L1_origImgPos.height>crop.defaultOptions.cropImgWH.height){
                    //设置L2固定值,计算值，并显示
                    crop.allElement.L2_coverZone.style.width=crop.L1_origImgPos.width+'px'
                    crop.allElement.L2_coverZone.style.height=crop.L1_origImgPos.height+'px'

                    crop.calcSetL2BorderWidth()
                    crop.allElement.L2_coverZone.style.display=''

                    crop.allowBindEvent=true

                    //绑定move事件
                    crop.container.bind(crop.defaultOptions.bindedEvent.moveZone,function(event){crop.calcCropZoneWhenMove(event)})
                    //绑定zoom事件
                    $('#'+crop.defaultOptions.elementId.L3_cropImgBorder).bind(crop.defaultOptions.bindedEvent.zoomZone,function(e){e.preventDefault();crop.calcCropZoneWhenZoom(e)})
                    //绑定click事件
                    $('#'+crop.defaultOptions.elementId.L3_cropImgBorder).bind(crop.defaultOptions.bindedEvent.cropChooseImg,function(e){crop.nextOp()})
                    crop.bindState=true
                }else{
                    crop.allowBindEvent=false
                    crop.allElement.L2_coverZone.style.display='none'
                    crop.cropEnable=true
/*                    //unbind move zoom click（因为图片太小）
                    crop.container.unbind(crop.defaultOptions.bindedEvent.moveZone)
                    crop.container.unbind(crop.defaultOptions.bindedEvent.zoomZone)
                    $('#'+crop.defaultOptions.elementId.L3_cropImgBorder).unbind(crop.defaultOptions.bindedEvent.cropChooseImg)*/

                    //crop.bindState=false
                }
                //设置L3固定值，计算值，并显示
                crop.allElement.L3_cropImgBorder.style.width=crop.defaultOptions.cropImgWH.width+2*crop.defaultOptions.L3BorderWidth.borderLeftWidth+'px'
                crop.allElement.L3_cropImgBorder.style.height=crop.defaultOptions.cropImgWH.height+2*crop.defaultOptions.L3BorderWidth.borderTopWidth+'px'
                crop.allElement.L3_cropImgBorder.style.borderLeftWidth=crop.allElement.L3_cropImgBorder.style.borderRightWidth=crop.defaultOptions.L3BorderWidth.borderLeftWidth+'px'
                crop.allElement.L3_cropImgBorder.style.borderTopWidth=crop.allElement.L3_cropImgBorder.style.borderBottomWidth=crop.defaultOptions.L3BorderWidth.borderTopWidth+'px'

                crop.calcSetL3Pos()
                crop.allElement.L3_cropImgBorder.style.display=''

                crop.allElement.L1_origImg.style.zIndex=0
                crop.allElement.L2_coverZone.style.zIndex=1
                crop.allElement.L3_cropImgBorder.style.zIndex=2

                //croppedImg设为空
                crop.allElement.croppedImg.setAttribute('src','')
                crop.allElement.croppedImg.style.display='none'

                return {rc:0}
            }



            crop.init=function(){

                var result=crop.init_part1()
                if(result.rc>0){
                    crop.allElement.L1_origImg.style.display='none';
                    return result
                }

                //读取origImg参数，如果读不出来，报错
                crop.L1_origImgPos=crop.allElement.L1_origImg.getBoundingClientRect()
                if(0==crop.L1_origImgPos.width || 0==crop.L1_origImgPos.height) {
                    crop.allElement.L1_origImg.style.display='none';
                    return crop.error.imageNotReady
                }

                result=crop.init_part2()
                if(result.rc && result.rc>0){
                    crop.allElement.L1_origImg.style.display='none';
                }
                return result
            }

            crop.calcSetL2BorderWidth=function(){
                //console.log(crop.cropZoneWH)
                var result={}
                result.leftBorderWidth=crop.currentCropZone.left-crop.L1_origImgPos.left
                result.topBorderWidth=crop.currentCropZone.top-crop.L1_origImgPos.top
                result.rightBorderWidth=crop.L1_origImgPos.width-result.leftBorderWidth-crop.currentCropZone.width
                result.bottomBorderWidth=crop.L1_origImgPos.height-result.topBorderWidth-crop.currentCropZone.height
                for(var w in result){
                    result[w]=(0>result[w])?0:result[w]
                }
                crop.allElement.L2_coverZone.style.borderLeftWidth=result.leftBorderWidth+'px'
                crop.allElement.L2_coverZone.style.borderTopWidth=result.topBorderWidth+'px'
                crop.allElement.L2_coverZone.style.borderRightWidth=result.rightBorderWidth+'px'
                crop.allElement.L2_coverZone.style.borderBottomWidth=result.bottomBorderWidth+'px'
            }
            crop.calcSetL3Pos=function(){
                var result= {
                    left:crop.currentCropZone.left-crop.defaultOptions.L3BorderWidth.borderLeftWidth,
                    top:crop.currentCropZone.top-crop.defaultOptions.L3BorderWidth.borderTopWidth,
                    width:crop.currentCropZone.width+2*crop.defaultOptions.L3BorderWidth.borderLeftWidth,
                    height:crop.currentCropZone.height+2*crop.defaultOptions.L3BorderWidth.borderTopWidth,
                }
                crop.allElement.L3_cropImgBorder.style.left=result.left+'px'
                crop.allElement.L3_cropImgBorder.style.top=result.top+'px'
                crop.allElement.L3_cropImgBorder.style.width=result.width+'px'
                crop.allElement.L3_cropImgBorder.style.height=result.height+'px'
            }

            //获取的是相对以页面的top/left
            crop.calcCropZoneWhenMove=function(event){
                //不是每次读取，否则当有滚动条，读取会错误；而是在init时读取，反正读取完image后，这些属性即可固定
                var L1_origImgPos=crop.L1_origImgPos
                var cropZoneWidth=crop.currentCropZone.width
                var cropZoneHeight=crop.currentCropZone.height
                var cropZoneBorderLeftWidth=crop.defaultOptions.L3BorderWidth.borderLeftWidth
                var cropZoneBorderTopWidth=crop.defaultOptions.L3BorderWidth.borderTopWidth
                //get current mouse position
                var e =  event?event:window.event;
                var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
                var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
                var mouseX = e.pageX || e.clientX + scrollX;
                var mouseY = e.pageY || e.clientY + scrollY;
                //    计算对应的cropZone的left/top
                var cropZoneLeft=mouseX-Math.round(cropZoneWidth/2)-cropZoneBorderLeftWidth
                var cropZoneTop=mouseY-Math.round(cropZoneHeight/2)-cropZoneBorderTopWidth
                //    判断计算得到的left/top是否超出img的范围
                if(cropZoneTop<L1_origImgPos.top){
                    cropZoneTop=L1_origImgPos.top
                }
                if(cropZoneTop>L1_origImgPos.bottom-cropZoneHeight){
                    cropZoneTop=L1_origImgPos.bottom-cropZoneHeight
                }
                if(cropZoneLeft<L1_origImgPos.left){
                    cropZoneLeft=L1_origImgPos.left
                }
                if(cropZoneLeft>L1_origImgPos.right-cropZoneWidth){
                    cropZoneLeft=L1_origImgPos.right-cropZoneWidth
                }
                crop.currentCropZone['top']=cropZoneTop
                crop.currentCropZone['left']=cropZoneLeft

                crop.calcSetL2BorderWidth()
                crop.calcSetL3Pos()
            }

            crop.calcCropZoneWhenZoom=function(e){
                //4个方向能够收缩放大的px
                var allowZoom=[]
                //4个方向中最大，最小的收放
                var sideZoomSize
                var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
                    (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));              // firefox

                if (delta > 0) {
                    // 放大
                    //top最多放大多少
                    sideZoomSize=(crop.currentCropZone.top-crop.defaultOptions.zoomStep.vertical<crop.L1_origImgPos.top) ? crop.L1_origImgPos.top-crop.L1_origImgPos.top:crop.defaultOptions.zoomStep.vertical
                    allowZoom.push(sideZoomSize)
                    //left最多放大多少
                    sideZoomSize=(crop.currentCropZone.left-crop.defaultOptions.zoomStep.horizontal<crop.L1_origImgPos.left) ? crop.L1_origImgPos.left-crop.L1_origImgPos.left:crop.defaultOptions.zoomStep.horizontal
                    allowZoom.push(sideZoomSize)
                    //bottom最多放大多少
                    sideZoomSize=(crop.currentCropZone.top+crop.currentCropZone.height+crop.defaultOptions.zoomStep.vertical>crop.L1_origImgPos.bottom) ? crop.L1_origImgPos.bottom-crop.currentCropZone.top-crop.currentCropZone.height: crop.defaultOptions.zoomStep.vertical
                    allowZoom.push(sideZoomSize)
                    //right最大放大多少
                    sideZoomSize=(crop.currentCropZone.left+crop.currentCropZone.width+crop.defaultOptions.zoomStep.horizontal>crop.L1_origImgPos.right) ? crop.L1_origImgPos.right-crop.currentCropZone.left-crop.currentCropZone.width: crop.defaultOptions.zoomStep.horizontal
                    allowZoom.push(sideZoomSize)

                    allowZoom.sort()
                    //设置currentCropZone
                    crop.currentCropZone.left-=allowZoom[0]
                    crop.currentCropZone.top-=allowZoom[0]
                    crop.currentCropZone.width+=2*allowZoom[0]
                    crop.currentCropZone.height+=2*allowZoom[0]
                } else if (delta < 0) {
                    allowZoom=[]
                    // 缩小
                    sideZoomSize=(crop.currentCropZone.width-2*crop.defaultOptions.zoomStep.horizontal)<crop.defaultOptions.cropImgWH.width ? Math.round((crop.currentCropZone.width-crop.defaultOptions.cropImgWH.width)/2):crop.defaultOptions.zoomStep.horizontal
                    allowZoom.push(sideZoomSize)
                    sideZoomSize=(crop.currentCropZone.height-2*crop.defaultOptions.zoomStep.vertical)<crop.defaultOptions.cropImgWH.height ? Math.round((crop.currentCropZone.height-crop.defaultOptions.cropImgWH.height)/2):crop.defaultOptions.zoomStep.vertical
                    allowZoom.push(sideZoomSize)

                    allowZoom.sort()
                    crop.currentCropZone.left+=allowZoom[0]
                    crop.currentCropZone.top+=allowZoom[0]
                    crop.currentCropZone.width-=2*allowZoom[0]
                    crop.currentCropZone.height-=2*allowZoom[0]
                }
                crop.calcSetL2BorderWidth()
                crop.calcSetL3Pos()
            }
            crop.nextOp=function(){
                if(true==crop.allowBindEvent){
                    if(false===crop.bindState){
                        crop.container.bind(crop.defaultOptions.bindedEvent.moveZone,function(event){crop.calcCropZoneWhenMove(event)})
                        crop.container.bind(crop.defaultOptions.bindedEvent.zoomZone,function(event){event.preventDefault();crop.calcCropZoneWhenZoom(event)})
                        crop.cropEnable=false
                    }else{
                        crop.container.unbind(crop.defaultOptions.bindedEvent.moveZone)
                        crop.container.unbind(crop.defaultOptions.bindedEvent.zoomZone)
                        crop.cropEnable=true
                    }
                    crop.bindState=!crop.bindState
                }


            }

            crop.cropGenerateDataURL=function(){
                if(undefined===crop.L1_origImgPos){
                    return crop.error.imageNotReady
                    //return {rc:6,msg:'not choose any image'}
                }
                var canvas=document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                var ctx = canvas.getContext("2d");

                //实际要裁剪的大小（可能图片小于裁剪区域），那么直接显示图片
                canvas.width=(crop.defaultOptions.cropImgWH.width<crop.L1_origImgPos.width)?crop.defaultOptions.cropImgWH.width:crop.L1_origImgPos.width
                canvas.height=(crop.defaultOptions.cropImgWH.height<crop.L1_origImgPos.height)?crop.defaultOptions.cropImgWH.height:crop.L1_origImgPos.height
                var cropPosBasedImg={}
                cropPosBasedImg['left']=crop.currentCropZone.left-crop.L1_origImgPos.left
                cropPosBasedImg['top']=crop.currentCropZone.top-crop.L1_origImgPos.top
                cropPosBasedImg['width']=crop.currentCropZone.width>crop.L1_origImgPos.width ? crop.L1_origImgPos.width:crop.currentCropZone.width
                cropPosBasedImg['height']=crop.currentCropZone.height>crop.L1_origImgPos.height ? crop.L1_origImgPos.height:crop.currentCropZone.height
                ctx.drawImage(crop.allElement.L1_origImg, cropPosBasedImg['left'], cropPosBasedImg['top'],cropPosBasedImg['width'] ,cropPosBasedImg['height'],0,0,canvas.width ,canvas.height);

                crop.allElement.croppedImg.style.display='';

                return canvas.toDataURL('image/jpeg');
            }
            return crop
        }
    }

    return Crop
})