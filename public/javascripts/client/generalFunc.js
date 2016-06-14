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
generalFuncApp.factory('modalNew',function(){
    var service={}
    service.showErrMsg=function(msg){
        setTop()
        $('#modal_msg').text(msg)
        //$('#modal_msg').text=msg
        $('#modal_modal').addClass('show')
        $('#modal_title').text('错误').addClass('text-danger')
        $('#modal_close_button').addClass('btn-danger')
        $('#modal_close_symbol').bind('click',function(){
            hide()
        })
        $('#modal_close_button').bind('click',function(){
            hide()
        })
    }
    service.showInfoMsg=function(msg){
        $('#modal_msg').text(msg)
        $('#modal_modal').addClass('show')
        $('#modal_title').text('信息').addClass('text-info')
        $('#modal_close_button').addClass('btn-info')
        $('#modal_close_symbol').bind('click',function(){
            hide()
        })
        $('#modal_close_button').bind('click',function(){
            hide()
        })
    }
    service.hide=function(){
        hide()
    }
    var hide=function(){
        $('#modal_msg').text('')
        $('#modal_modal').removeClass('show')
        $('#modal_title').text('').removeClass('text-danger').removeClass('text-info')
        $('#modal_close_button').removeClass('btn-danger').removeClass('btn-info')
        $('#modal_close_symbol').unbind('click')
        $('#modal_close_button').unbind('click')
    }
    var setTop=function(){
        //$('#modal_modal>div').height()=174，直接测量得到，因为只有在show时，才有height，hide时为0
        var top=parseInt((document.body.clientHeight-174)/2)
        $('#modal_modal>div').css('top',top)
    }
    return service
})
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

    var dataURLtoBlob=function(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
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
        dataURLtoBlob:dataURLtoBlob,

    }
})

generalFuncApp.service('asyncFunc',function($q){
    //0. 检测fileRead是否可用
    //1，根据readType检测文件类型是否正确
    //2. 检测文件size是否介于0和maxLength
    //3. 根据readType读取文件
    var readFile=function(inputId,readType,maxLength){
        //inputId:选择图片的按钮
        //在onload触发之后，才能获得file内容，所以是异步操作
        var deferred = $q.defer();
        if(undefined === typeof FileReader){
            deferred.reject({rc:1,msg:"当前浏览器版本过低，请升级到最新版本后重试"});
            return deferred.promise;
        }

        var reader=new FileReader()
        var file=document.getElementById(inputId).files[0]

        if(undefined===file){
            deferred.reject ({rc:2,msg:'请先选择要上传的文件'})
            return deferred.promise
            //return {rc:2,msg:'请先选择要上传的文件'}
        }

        if(0===file.size){
            deferred.reject({rc:3,msg:'文件内容为空'})
            return deferred.promise;
        }
        if(maxLength<file.size){
            deferred.reject({rc:4,msg:'文件超过预定义大小'})
            return deferred.promise;
        }

        switch (readType){
            case 'text':
                if('text/plain'!==file.type){
                    deferred.reject({rc:5,msg:'文件必须是文本文件'})
                }
                reader.readAsText(file)
                reader.onload=function(e){
                    deferred.resolve(this.result)
                }
                break;
            case 'dataURL':
                if('image/png'!==file.type && 'image/jpeg'!==file.type && 'image/gif'!==file.type){
                    deferred.reject({rc:6,msg:'文件必须是图片文件'})
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
        Create:function(options){
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
                L1ViewImgMaxWHNotInt:function (WH) {
                    //return {rc: 2, msg: 'The value of L1OrigImg->' + WH + ' can\'t be parsed into number'}
                    return {rc: 3, msg: 'L1ViewImgMaxWH->' + WH + '的值不是整数'}
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
				L1ViewImgMaxWHExceedL1origImgMaxWH:function(WH){
					return {rc: 16, msg: 'L1ViewImgMax->' + WH + '不能大于L1origImgMaxWH->'+WH}
				},
				viewImgTooSmallToCrop:function(){
					//return {rc: 18, msg: 'L1ViewImgMax的高度和宽度不能同时小于cropImgWH'}
                    return {rc: 18, msg: '载入图片的长度和宽度不能小于裁剪后图片的长度和宽度'}
				},
            }
            crop.defaultOptions={
/*                btnId:{
                    //真正的input id，readFile从中读取选择的文件
                    chooseImgBtnId:'chooseImg',
                    cropImgBtnId:'cropImg',
                },*/
                elementId:{
                    L1_origImg:'L1_origImg',
                    L2_coverZone:'L2_coverZone',
                    L3_cropImgBorder:'L3_cropImgBorder',
                    //croppedImg:'croppedImg',
                },
				//max file size
                L1origImgMaxWH:{
                    width:1376,
                    height:768
                },
				//max width/height show in page
				L1ViewImgMaxWH:{
					width:960,
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
            //crop.allBtnElement={}
            //原始图片的参数，读取完图片后，就是固定值(top,left,width,height)
            //crop._para.L1_origImgViewPos=undefined
			//实际比例
			crop._para={
				ratio:1,
                L1_origImgViewPos:{},//the pos para after show in page(maybe zoom in)
                L1_origImgPos:{},//orig pos para
			}
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
            //传入参数
            crop.loadParameter=function() {
                //1. 初始化全局参数
                crop.cropEnable = false//是否可以剪切
                crop.bindState = false//代表当前bind状态
                crop.allowBindEvent = false//无法进行绑定
                //crop.currentCropZone = {}
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
/*                //3.1 按钮元素是否存在
                for (var eleId in defaultOptions['btnId']) {
                    if (null === document.getElementById(defaultOptions['btnId'][eleId])) {

                        return crop.error.htmlElementNotFind(defaultOptions['btnId'][eleId])
                    } else {
                        this.allBtnElement[eleId] = document.getElementById(defaultOptions['btnId'][eleId])
                    }
                }    */
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
                for (var WH in defaultOptions['L1ViewImgMaxWH']) {
                    value = defaultOptions['L1ViewImgMaxWH'][WH]
                    if(true===crop.isInt(value)){
                        defaultOptions['L1ViewImgMaxWH'][WH] = parseInt(value)
                    }else{
                        return crop.error.L1ViewImgMaxWHNotInt(WH)
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
                //6. check if in valid range
                for (var WH in defaultOptions.L1ViewImgMaxWH) {
                    if(defaultOptions['L1ViewImgMaxWH'][WH]>defaultOptions['L1origImgMaxWH'][WH]){
                        return crop.error.L1ViewImgMaxWHExceedL1origImgMaxWH(WH)
                    }
                }
                //检查载入的图片是否小于裁剪后的图片尺寸
                //for (var WH in defaultOptions['L1ViewImgMaxWH']) {
                if(defaultOptions['L1ViewImgMaxWH']['width']<defaultOptions['cropImgWH']['width'] && defaultOptions['L1ViewImgMaxWH']['height']<defaultOptions['cropImgWH']['height']){
                    return crop.error.viewImgTooSmallToCrop()
                }

                return {rc:0}
            }
            //初始化L1/L2/L3
            //1. display=none;2. img src=''
            crop.hideView=function(){
                //console.log(crop.allElement)
                for(var ele in crop.allElement){
                    //console.log(crop.allElement[ele])
                    crop.allElement[ele].style.display='none'
                }
/*                crop.allElement.forEach(function(e){
                    console.log(e)
                    e.style.display='none'
                })*/
                crop.allElement.L1_origImg.setAttribute('src','')
            }
            crop.showView=function(){
                for(var ele in crop.allElement){

                    crop.allElement[ele].style.display=''
                }
            }
			//}
            //根据原始img的信息，设置对应的L2、L3的参数
            //因为img载入数据可能有延迟，导致读取img信息（getBoundingClientRect）可能出错，所以init分成2部分，第二部分在img load完成后执行
            crop.initViewBasedOnImg=function(){
                //判断图片是否已经载入：读取origImg参数，如果读不出来，报错
                //此处读取的是图片原始的参数
                crop._para.L1_origImgPos=crop.allElement.L1_origImg.getBoundingClientRect()
//console.log(crop.allElement.L1_origImg)
                if(0==crop._para.L1_origImgPos.width || 0==crop._para.L1_origImgPos.height) {
                    crop.allElement.L1_origImg.style.display='none';
                    return crop.error.imageNotReady
                }

                //设置image的maxWidth属性，使用px而不是百分比（百分比时，图片大小在载入时确定，随着页面变化而变化，如果页面的width/height不是同步缩放，图片缩放会导致变形）
                crop.allElement.L1_origImg.style.maxWidth=crop.defaultOptions.L1ViewImgMaxWH.width+'px'
                crop.allElement.L1_origImg.style.maxHeight=crop.defaultOptions.L1ViewImgMaxWH.height+'px'
/*                crop.allElement.L1_origImg.style.maxWidth='100%'
                crop.allElement.L1_origImg.style.maxHeight='100%'*/
                //此处读取的是显示的参数（因为已经设置了maxWidth/height，超出会自动缩小）
                crop._para.L1_origImgViewPos=crop.allElement.L1_origImg.getBoundingClientRect()
/*                //根据原始图片的长宽比，决定width还是height设置100%
                var origImgRatio=crop.calcOrigImgWHRatio(crop._para.L1_origImgViewPos.width,crop._para.L1_origImgViewPos.height)
                if(origImgRatio>1){
                    crop.allElement.L1_origImg.style.width='100%'
                    crop.allElement.L1_origImg.style.height=parseInt(100/origImgRatio)+'%'
                }else{
                    crop.allElement.L1_origImg.style.heidth='100%'
                    crop.allElement.L1_origImg.style.width=parseInt(100*origImgRatio)+'%'
                }*/

                //检测origImg是否超出最大定义
                for(var WH in crop.defaultOptions.L1origImgMaxWH){
                    if(crop._para.L1_origImgViewPos[WH]>crop.defaultOptions.L1origImgMaxWH[WH]){
                        return crop.error.L1origImgMaxWHExceed(WH)
                    }
                }
				
				crop.calcRatio(crop._para.L1_origImgPos)
				
                //只有符合条件的情况下，才能显示原始图片
                //crop.allElement.L1_origImg.style.display='';
                //初始裁减框，相对于页面的位置，和L1_origImg一样，WH和destImg一样（接下来可能会被鼠标缩放）
                crop.currentCropZone['top']=crop._para.L1_origImgViewPos.top
                crop.currentCropZone['left']=crop._para.L1_origImgViewPos.left
                crop.currentCropZone['width']=crop.defaultOptions.cropImgWH.width
                crop.currentCropZone['height']=crop.defaultOptions.cropImgWH.height
//console.log(crop.currentCropZone)
				//consider ration
                //crop.currentCropZone['width']=parseInt(crop.defaultOptions.cropImgWH.width/crop._para.ratio)
                //crop.currentCropZone['height']=parseInt(crop.defaultOptions.cropImgWH.height/crop._para.ratio)
                //每次初始化，先unbind可能的事件
                crop.container.unbind(crop.defaultOptions.bindedEvent.moveZone)
                //解绑定zoom事件
                $('#'+crop.defaultOptions.elementId.L3_cropImgBorder).unbind(crop.defaultOptions.bindedEvent.zoomZone)
                //解绑定click事件
                $('#'+crop.defaultOptions.elementId.L3_cropImgBorder).unbind(crop.defaultOptions.bindedEvent.cropChooseImg)
                //只有当原始图像的长度 或者 宽度大于裁剪区域，才显示L2和L3，并绑定事件
                if(crop._para.L1_origImgViewPos.width>crop.defaultOptions.cropImgWH.width || crop._para.L1_origImgViewPos.height>crop.defaultOptions.cropImgWH.height){
                    //设置L2固定值,计算值，并显示
                    crop.allElement.L2_coverZone.style.width=crop._para.L1_origImgViewPos.width+'px'
                    crop.allElement.L2_coverZone.style.height=crop._para.L1_origImgViewPos.height+'px'

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
//console.log(crop)
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
/*                crop.allElement.croppedImg.setAttribute('src','')
                crop.allElement.croppedImg.style.display='none'*/

                return {rc:0}
            }



/*            crop.init=function(){

                var result=crop.loadParameter()
                if(result.rc>0){
                    crop.allElement.L1_origImg.style.display='none';
                    return result
                }

                //读取origImg参数，如果读不出来，报错
                crop._para.L1_origImgPos=crop.allElement.L1_origImg.getBoundingClientRect()

                if(0==crop._para.L1_origImgViewPos.width || 0==crop._para.L1_origImgViewPos.height) {
                    crop.allElement.L1_origImg.style.display='none';
                    return crop.error.imageNotReady
                }

                result=crop.loadImg()
                if(result.rc && result.rc>0){
                    crop.allElement.L1_origImg.style.display='none';
                }
                return result
            }*/

            crop.calcSetL2BorderWidth=function(){
                //console.log(crop.currentCropZone)
                var result={}
                result.leftBorderWidth=crop.currentCropZone.left-crop._para.L1_origImgViewPos.left
                result.topBorderWidth=crop.currentCropZone.top-crop._para.L1_origImgViewPos.top
                result.rightBorderWidth=crop._para.L1_origImgViewPos.width-result.leftBorderWidth-crop.currentCropZone.width
                result.bottomBorderWidth=crop._para.L1_origImgViewPos.height-result.topBorderWidth-crop.currentCropZone.height
                for(var w in result){
                    result[w]=(0>result[w])?0:result[w]
                }
                crop.allElement.L2_coverZone.style.borderLeftWidth=result.leftBorderWidth+'px'
                crop.allElement.L2_coverZone.style.borderTopWidth=result.topBorderWidth+'px'
                crop.allElement.L2_coverZone.style.borderRightWidth=result.rightBorderWidth+'px'
                crop.allElement.L2_coverZone.style.borderBottomWidth=result.bottomBorderWidth+'px'
            }

            //采用和L2类似的方式，计算margin，而不是计算top/left，防止在absolute情况下，top/left出现offset
            crop.calcSetL3Pos=function(){
                var result= {}
                result.left=crop.currentCropZone.left-crop.defaultOptions.L3BorderWidth.borderLeftWidth-crop._para.L1_origImgViewPos.left,
                result.top=crop.currentCropZone.top-crop.defaultOptions.L3BorderWidth.borderTopWidth-crop._para.L1_origImgViewPos.top,
                result.right=crop._para.L1_origImgViewPos.width-result.left-crop.currentCropZone.width-2*crop.defaultOptions.L3BorderWidth.borderLeftWidth,
                result.bottom=crop._para.L1_origImgViewPos.height-result.top-crop.currentCropZone.height-2*crop.defaultOptions.L3BorderWidth.borderTopWidth,
                result.width=crop.currentCropZone.width+2*crop.defaultOptions.L3BorderWidth.borderLeftWidth
                result.height=crop.currentCropZone.height+2*crop.defaultOptions.L3BorderWidth.borderTopWidth
//console.log(result)
                crop.allElement.L3_cropImgBorder.style.marginLeft=result.left+'px'
                crop.allElement.L3_cropImgBorder.style.marginTop=result.top+'px'
                crop.allElement.L3_cropImgBorder.style.marginRight=result.right+'px'
                crop.allElement.L3_cropImgBorder.style.marginBottom=result.bottom+'px'
                crop.allElement.L3_cropImgBorder.style.width=result.width+'px'
                crop.allElement.L3_cropImgBorder.style.height=result.height+'px'
            }
            //crop.calcSetL3Pos=function(){
            //    var result= {
            //        left:crop.currentCropZone.left-crop.defaultOptions.L3BorderWidth.borderLeftWidth,
            //        top:crop.currentCropZone.top-crop.defaultOptions.L3BorderWidth.borderTopWidth,
            //        width:crop.currentCropZone.width+2*crop.defaultOptions.L3BorderWidth.borderLeftWidth,
            //        height:crop.currentCropZone.height+2*crop.defaultOptions.L3BorderWidth.borderTopWidth,
            //    }
            //    crop.allElement.L3_cropImgBorder.style.left=result.left+'px'
            //    crop.allElement.L3_cropImgBorder.style.top=result.top+'px'
            //    crop.allElement.L3_cropImgBorder.style.width=result.width+'px'
            //    crop.allElement.L3_cropImgBorder.style.height=result.height+'px'
            //}
			//get max ratio（so that the orig img can be show in L1ViewImgMaxWH defined img element）
			crop.calcRatio=function(L1_origImgPos){
				var currentRatio;
                for(var WH in crop.defaultOptions.L1ViewImgMaxWH){
                    if(L1_origImgPos[WH]>crop.defaultOptions.L1ViewImgMaxWH[WH]){
						//get max side ration
						currentRatio=L1_origImgPos[WH]/crop.defaultOptions.L1ViewImgMaxWH[WH]
						crop._para.ratio=currentRatio>crop._para.ratio ? currentRatio:crop._para.ratio 
                    }
                }

			}

            crop.calcOrigImgWHRatio=function(origImgWidth,origImgHeight){
                return parseFloat(origImgWidth/origImgHeight)
            }
			//calc real cropZone para to canvas
			crop.calcRealCurrentCropZone=function(currentCropZone){
				// 1 计算页面上，currentZone和prigImg的top/left间的间距
                // 2. 间距*ratio并floor取整
                // 3. currentCropZone的WH*ratio并floor取整

                //计算后实际的裁剪区域
                var realCurrentCropZone={}
				var gapInView={}
                gapInView['top']=currentCropZone.top-crop._para.L1_origImgViewPos.top
                gapInView['left']=currentCropZone.left-crop._para.L1_origImgViewPos.left

                realCurrentCropZone['top']=Math.ceil(gapInView['top']*crop._para.ratio)
                realCurrentCropZone['left']=Math.ceil(gapInView['left']*crop._para.ratio)
                realCurrentCropZone['width']=Math.floor(currentCropZone.width*crop._para.ratio)
                realCurrentCropZone['height']=Math.floor(currentCropZone.height*crop._para.ratio)
                return realCurrentCropZone
                //crop._para.realCurrentCropZone['top']=
			}



            //获取的是相对以页面的top/left
            crop.calcCropZoneWhenMove=function(event){
                //不是每次读取，否则当有滚动条，读取会错误；而是在init时读取，反正读取完image后，这些属性即可固定
                var L1_origImgPos=crop._para.L1_origImgViewPos
                //console.log(crop.currentCropZone)
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
//console.log(crop.currentCropZone)
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
                    sideZoomSize=(crop.currentCropZone.top-crop.defaultOptions.zoomStep.vertical<crop._para.L1_origImgViewPos.top) ? crop._para.L1_origImgViewPos.top-crop._para.L1_origImgViewPos.top:crop.defaultOptions.zoomStep.vertical
                    allowZoom.push(sideZoomSize)
                    //left最多放大多少
                    sideZoomSize=(crop.currentCropZone.left-crop.defaultOptions.zoomStep.horizontal<crop._para.L1_origImgViewPos.left) ? crop._para.L1_origImgViewPos.left-crop._para.L1_origImgViewPos.left:crop.defaultOptions.zoomStep.horizontal
                    allowZoom.push(sideZoomSize)
                    //bottom最多放大多少
                    sideZoomSize=(crop.currentCropZone.top+crop.currentCropZone.height+crop.defaultOptions.zoomStep.vertical>crop._para.L1_origImgViewPos.bottom) ? crop._para.L1_origImgViewPos.bottom-crop.currentCropZone.top-crop.currentCropZone.height: crop.defaultOptions.zoomStep.vertical
                    allowZoom.push(sideZoomSize)
                    //right最大放大多少
                    sideZoomSize=(crop.currentCropZone.left+crop.currentCropZone.width+crop.defaultOptions.zoomStep.horizontal>crop._para.L1_origImgViewPos.right) ? crop._para.L1_origImgViewPos.right-crop.currentCropZone.left-crop.currentCropZone.width: crop.defaultOptions.zoomStep.horizontal
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
//console.log(crop.currentCropZone)
            }

            crop.nextOp=function(){
                if(true==crop.allowBindEvent){
                    if(false===crop.bindState){
                        crop.container.bind(crop.defaultOptions.bindedEvent.moveZone,function(event){crop.calcCropZoneWhenMove(event)})
                        $('#'+crop.defaultOptions.elementId.L3_cropImgBorder).bind(crop.defaultOptions.bindedEvent.zoomZone,function(e){e.preventDefault();crop.calcCropZoneWhenZoom(e)})
                        //crop.container.bind(crop.defaultOptions.bindedEvent.zoomZone,function(event){event.preventDefault();crop.calcCropZoneWhenZoom(event)})
                        crop.cropEnable=false
                    }else{
                        $('#'+crop.defaultOptions.elementId.L3_cropImgBorder).unbind(crop.defaultOptions.bindedEvent.zoomZone)
                        //crop.container.unbind(crop.defaultOptions.bindedEvent.zoomZone)
                        crop.container.unbind(crop.defaultOptions.bindedEvent.moveZone)
                        crop.cropEnable=true
                    }
                    crop.bindState=!crop.bindState
//console.log(crop.currentCropZone)
                }
            }

            crop.cropGenerateDataURL=function(){
//console.log(crop.currentCropZone)
                if(undefined===crop._para.L1_origImgViewPos){
                    return crop.error.imageNotReady
                    //return {rc:6,msg:'not choose any image'}
                }
                var canvas=document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                var ctx = canvas.getContext("2d");
//console.log(crop.currentCropZone)
                //实际要裁剪的大小（可能图片小于裁剪区域），那么直接显示图片
                canvas.width=(crop.defaultOptions.cropImgWH.width<crop._para.L1_origImgPos.width)?crop.defaultOptions.cropImgWH.width:crop._para.L1_origImgPos.width
                canvas.height=(crop.defaultOptions.cropImgWH.height<crop._para.L1_origImgPos.height)?crop.defaultOptions.cropImgWH.height:crop._para.L1_origImgPos.height
                //var cropPosBasedImg={}
                //cropPosBasedImg['left']=crop.currentCropZone.left-crop._para.L1_origImgViewPos.left
                //cropPosBasedImg['top']=crop.currentCropZone.top-crop._para.L1_origImgViewPos.top
                //cropPosBasedImg['width']=crop.currentCropZone.width>crop._para.L1_origImgViewPos.width ? crop._para.L1_origImgViewPos.width:crop.currentCropZone.width
                //cropPosBasedImg['height']=crop.currentCropZone.height>crop._para.L1_origImgViewPos.height ? crop._para.L1_origImgViewPos.height:crop.currentCropZone.height
                var cropPosBasedImg=crop.calcRealCurrentCropZone(crop.currentCropZone)
                cropPosBasedImg['width']=cropPosBasedImg['width']>crop._para.L1_origImgPos.width ? crop._para.L1_origImgPos.width:cropPosBasedImg['width']
                cropPosBasedImg['height']=cropPosBasedImg['height']>crop._para.L1_origImgPos.height ? crop._para.L1_origImgPos.height:cropPosBasedImg['height']
                ctx.drawImage(crop.allElement.L1_origImg, cropPosBasedImg['left'], cropPosBasedImg['top'],cropPosBasedImg['width'] ,cropPosBasedImg['height'],0,0,canvas.width ,canvas.height);
//console.log(crop.currentCropZone)
//console.log(crop.defaultOptions)
//console.log(cropPosBasedImg)
                //crop.allElement.croppedImg.style.display='';
                //不管输入img格式，输出都是jpg
                //console.log(canvas.toDataURL('image/jpeg'))
                return canvas.toDataURL('image/png');
            }
            return crop
        }
    }

    //service必须返回对象
    return Crop
})


//采用xhr上传单个文件，绑定若干事件，处理上传进度，完成等
generalFuncApp.factory('Upload',function($q){

    var Upload={
        Create:function(){
            var upload={}
            upload.option={}
            upload.error={
                parameterMissed:function(param){
                    return {rc:1,msg:'尚未定义'+param}
                },
                eventLoadMiss:function(){
                    return {rc:2,msg:'事件load尚未定义'}
                },
                eventMustBeFunction:function(eventName){
                    return {rc:3,msg:'事件'+eventName+'的类型必须是函数'}
                },
                eventCalcUploadProgressFailed:{rc:10,msg:'计算上传进度失败'},
            }
            //event是上传时候的除俩方式，由每个callee自定义（需要自定义event）
            //upload.event={}

            upload.init=function(option){
                var mandatoryParameter=['fd','serverURL','event']
                for(var idx in mandatoryParameter){
                    if(undefined===option[mandatoryParameter[idx]]){
                        return this.error.parameterMissed(mandatoryParameter[idx])
                    }
                }
                //检查event，除了load必须定义，其它（progress/error/abort可以不定义）
                //load是否存在
                if(undefined===option.event['load'] || null===option.event['load']){
                    return this.error.eventLoadMiss()
                }

                //所有的event是否为function
                for(var key in option.event){
                    if('function'!==typeof option.event[key]){
                        return this.error.eventMustBeFunction(option.event[key])
                    }
                }
                upload.option=option
                return {rc:0}
            }

            upload.upload=function(){
                var deferred = $q.defer();

                var xhr = new XMLHttpRequest();
                xhr.open("POST", upload.option.serverURL);
                //添加可能的事件
/*                var possibleEvent=['progress','load','error','abort']
                possibleEvent.forEach(function(evt){
                    if(upload.option.event[evt]){
                        xhr.upload.addEventListener(evt, upload.option.event[evt], false);
                    }
                })*/
                /*var event
                if(upload.option.event['progress']){event=upload.option.event['progress']}
                if(event){
                    xhr.upload.addEventListener("progress", event, false);
                }
                if(upload.option.event['progress']){event=upload.option.event['progress']}
                if(event){
                    xhr.addEventListener("load", event, false);
                }
                event=upload.option.event['error']
                if(event){
                    xhr.addEventListener("error", event, false);
                }
                event=upload.option.event['abort']
                if(event){
                    xhr.addEventListener("abort", event, false);
                }*/
/*                xhr.addEventListener("load", upload.event.uploadComplete, false);
                xhr.addEventListener("error", upload.event.uploadFailed, false);
                xhr.addEventListener("abort", upload.event.uploadCanceled, false);*/
                xhr.send(upload.option.fd);
                xhr.onload=function(e){
                    deferred.resolve({rc:0})
                }
                xhr.onprogress=function(e){
                    if (e.lengthComputable) {
                        var percentComplete = Math.round(e.loaded * 100 / e.total);
                        deferred.resolve({rc:0,msg:percentComplete})
                        //console.log(percentComplete)
                    }
                    else {
                        /*                    console.log('fail')
                         document.getElementById('progressNumber').innerHTML = 'unable to compute';*/
                        deferred.reject(upload.error.eventCalcUploadProgressFailed)
                        //return
                    }

                }
                xhr.onabort=function(e){
                    deferred.reject({rc:1,msg:e})
                }
                xhr.onerror=function(e){
                    deferred.reject({rc:2,msg:e})
                }

                return deferred.promise
            }
            return upload
        }
    }
    //service必须返回对象
    return Upload
})