/**
 * Created by zw on 2016/2/12.
 */
    'use strict'
var express = require('express');
var router = express.Router();

var settingGeneralError=require('./error_define/runtime_node_error').runtime_node_error.setting
var defaultSetting=require('./assist/defaultGlobalSetting').defaultSetting
var miscFunc=require('./assist_function/miscellaneous').func

var dataOperation=require('./model/redis/CRUDGlobalSetting').globalSetting
var rightResult={rc:0}


/****************************************/
/****************************************/
/*             GlobalSetting            */
/****************************************/
/****************************************/
//检查上传的数据是否是预定义的item/subItem
//上传的数据是setting:{
// inner_image:{
//  uploadPath:{currentData:xxx}
// }
// }
//有错: 1. 返回是{ inner_image:{ uploadPath:{ rc:xx,msg:xxx}}}或者setting:{ inner_image:{ rc:xxx,msg:xxx}}
//      2. {rc:xxxx,msg}
//无错,返回{rc:0}
var checkDataDefined=function(req){

    var errorFlag=false;//根据errorFlag决定是否返回{rc:0}
    var result={}
    if(miscFunc.isEmpty(req.body.setting)){
        return settingGeneralError.itemNotDefined
    }
    var setting=req.body.setting
    for(let item in setting){
        if(miscFunc.isEmpt(defaultSetting[item])){
            result[item]=settingGeneralError.itemNotDefined
            return result
        }
        result[item]={}
        for(let subitem in setting[item]){
            if(undefined===defaultSetting[item][subitem]){
                result[item][subitem]=settingGeneralError.subitemNotDefined
                errorFlag=true
                //return result
            }else{
                result[item][subitem]=rightResult
            }

        }
    }
    return errorFlag ? result:rightResult;

}

//对应的值是不是存在
var checkUploadDataExist=function(req){

    if(miscFunc.isEmpty(req.body.setting)){
        return settingGeneralError.itemNotDefined
    }
    var setting=req.body.setting
    var errorFlag=false;
    var result={};
    for(let item in setting){
        result[item]={}
        for(let subitem in setting[item]){
            if(undefined===setting[item][subitem]['currentData'] || null===setting[item][subitem]['currentData'] || ''===setting[item][subitem]['currentData']){
                result[item][subitem]=settingGeneralError.emptyGlobalSettingValue;
                errorFlag=true;
            }else{
                result[item][subitem]=rightResult
            }
        }

    }
    return errorFlag ? result:rightResult;
}

//数据是否存在和是否合格分成2个函数,以便调试
var checkDataValid=function(req){
    if(miscFunc.isEmpty(req.body.setting)){
        return settingGeneralError.itemNotDefined
    }
    var setting=req.body.setting
    var errorFlag=false;
    var result={};
    for(let item in setting){
        result[item]={}
        for(let subItem in setting[item]){
            let newValue=setting[item][subItem]['currentData']
            //根据类型进行检测，没有type定义，直接pass
            if(defaultSetting[item][subItem]['type']){
                switch (defaultSetting[item][subItem]['type']){
                    case 'int':
                        //console.log()
                        if(false===miscFunc.isInt(newValue)){
                            result[item][subItem]=settingGeneralError.settingValueNotInt;
                            errorFlag=true;
                        }
                        if(defaultSetting[item][subItem]['max']){
                            let newValueInt=parseInt(newValue)
                            if(newValueInt>defaultSetting[item][subItem]['max']){
                                result[item][subItem]=settingGeneralError.settingValueExceedMaxInt;
                                errorFlag=true;
                            }
                            //最小值检查包含在最大值检查中
                            // 最小值没有定义，默认是0
                            let definedMinValue=0
                            if(defaultSetting[item][subItem]['min']){
                                definedMinValue=parseInt(defaultSetting[item][subItem]['min'])
                            }
                            if(newValueInt<definedMinValue){
                                result[item][subItem]=settingGeneralError.settingValueExceedMinInt
                                errorFlag=true;
                            }
                        }
                        break;
                    case 'path':
                        if(false===miscFunc.isFolder(newValue)){
                            result[item][subItem]=settingGeneralError.settingValuePathNotExist
                            errorFlag=true;
                        }
                        if(defaultSetting[item][subItem]['maxLength']){
                            let definedMaxLength=defaultSetting[item][subItem]['maxLength']
                            if(newValue.length>definedMaxLength){
                                result[item][subItem]=defaultSetting[item][subItem]['client']['maxLength']
                                errorFlag=true;
                            }
                            //check min
                            let definedMinLength=0
                            if(defaultSetting[item][subItem]['minLength']){
                                definedMinLength=defaultSetting[item][subItem]['minLength']
                            }
                            if(newValue.length<definedMinLength){
                                result[item][subItem]=defaultSetting[item][subItem]['client']['minLength']
                                errorFlag=true;
                            }
                        }
                        break;
                    case 'file':
                        if(false===miscFunc.isFile(newValue)){
                            result[item][subItem]=settingGeneralError.settingValueFileNotExist
                            errorFlag=true;
                        }
                        if(defaultSetting[item][subItem]['maxLength']){
                            let definedMaxLength=defaultSetting[item][subItem]['maxLength']
                            if(newValue.length>definedMaxLength){
                                result[item][subItem]=defaultSetting[item][subItem]['client']['maxLength']
                                errorFlag=true;
                            }
                            //check min
                            let definedMinLength=0
                            if(defaultSetting[item][subItem]['minLength']){
                                definedMinLength=defaultSetting[item][subItem]['minLength']
                            }
                            if(newValue.length<definedMinLength){
                                result[item][subItem]=defaultSetting[item][subItem]['client']['minLength']
                                errorFlag=true;
                            }
                        }
                        break;
                }
            }
        }
    }
    return errorFlag ? result:rightResult;
}

//客户端传来的数据是setting:{item:{subItem1:{currentData:val1},item:{subItem2:{currentData:val2}}}
//需要转换成setting:{item:{subItem1:val1,item:currentData:val2}},以便redis保存(hash set)
var dataConvertToServer=function(req){
    if(miscFunc.isEmpty(req.body.setting)){
        return settingGeneralError.itemNotDefined
    }
    var setting=req.body.setting
    let convertedData={}
    for(let item in setting){
        if(!convertedData[item]){
            convertedData[item]={}
        }
        for(let subItem in setting[item]){
            convertedData[item][subItem]=setting[item][subItem]['currentData']
        }
    }
    return convertedData
}

//cilent由2部分组成：数据，属性
//根据redis中获得数据，添加type属性,在client根据type转换成对应的input类型;根据max/maxLength/min/minLength推断maxLength/minLength
//{item:{subItem1:value1,subItem2:value2}}====>{item:{subItem1:{currentData:value1,type:'text'},subItem2:{currentData:value2,type:'text'}}
//server:type            client:inputType
//int                      text
//folder                    text
//file                      text
var dataConvertToClient=function(valueObj){
    //和cilent中定义一致
    let  inputTypeEnum={text:'text',password:'password',number:'number'}
    for(let item of Object.keys(valueObj)){
        if(undefined===item){
            return valueObj
        }
        for(let subItem of Object.keys(valueObj[item])){
            //转换子项数据结构,保存value
            let tmpSubItemValue=valueObj[item][subItem]
            valueObj[item][subItem]={}
            valueObj[item][subItem]['currentData']=tmpSubItemValue

            //保存类型
            if(undefined===defaultSetting[item][subItem]['type']){
                valueObj[item][subItem]['type']=inputTypeEnum.text
            }else{
                switch(defaultSetting[item][subItem]['type']){
                    case 'int':
                        valueObj[item][subItem]['type']=inputTypeEnum.text
                        break;
                    case 'folder':
                        valueObj[item][subItem]['type']=inputTypeEnum.text
                        break
                    case 'file':
                        valueObj[item][subItem]['type']=inputTypeEnum.text
                        break
                    //object不做任何操作,在client扩张,设为bollean
                    case 'object':
                        break
                    default:
                        valueObj[item][subItem]['type']=inputTypeEnum.text
                }
            }

            //推断maxLength/minLength,作为页面input的属性(限制输入)
            //有type,才能进行推断
            //默认max/min,如果没有定义,取此

            if(undefined!==defaultSetting[item][subItem]['type']){
                let defaultMaxLength=40;
                let defaultMinLength=1;
                switch(defaultSetting[item][subItem]['type']){
                    case 'int':
                        (undefined!==defaultSetting[item][subItem]['max']) ?  valueObj[item][subItem]['maxLength']=defaultSetting[item][subItem]['max'].toString().length:valueObj[item][subItem]['maxLength']=defaultMaxLength;
                        (undefined!==defaultSetting[item][subItem]['min']) ? valueObj[item][subItem]['minLength']=defaultSetting[item][subItem]['min'].toString().length:valueObj[item][subItem]['minLength']=defaultMinLength;
                        break;
                    case 'path':
                        (undefined!==defaultSetting[item][subItem]['maxLength']) ?  valueObj[item][subItem]['maxLength']=defaultSetting[item][subItem]['maxLength']:valueObj[item][subItem]['maxLength']=defaultMaxLength;
                        (undefined!==defaultSetting[item][subItem]['minLength']) ? valueObj[item][subItem]['minLength']=defaultSetting[item][subItem]['minLength']:valueObj[item][subItem]['minLength']=defaultMinLength;
                        break
                    case 'file':
                        (undefined!==defaultSetting[item][subItem]['maxLength']) ?  valueObj[item][subItem]['maxLength']=defaultSetting[item][subItem]['maxLength']:valueObj[item][subItem]['maxLength']=defaultMaxLength;
                        (undefined!==defaultSetting[item][subItem]['minLength']) ? valueObj[item][subItem]['minLength']=defaultSetting[item][subItem]['minLength']:valueObj[item][subItem]['minLength']=defaultMinLength;
                        break
                    //object不做任何操作,在client扩张,设为bollean
                    case 'object':
                        break
                    default:
                        valueObj[item][subItem]['type']=inputTypeEnum.text
                }
            }
        }
    }

    return valueObj
}

/*
* page operation
*
* */
router.get("/",function(req,res,next){
    res.render('admin',{title:'首页',year:new Date().getFullYear()})
})

//上传的数据是setting:{
// inner_image:{
//  uploadPath:{currentData:xxx}
// }
// }
//返回是setting:{ inner_image:{ uploadPath:{ rc:xx,msg:xxx}}}
//无论是item还是subItem,都是用同一个函数(只是上传的数据多少)
router.post("/checkData",function(req,res,next){
    //数据项/数据子项是否是预定义
    let checkDataDefinedResult=checkDataDefined(req)
//console.log(checkDataDefinedResult)
    if( checkDataDefinedResult.rc && 0!==checkDataDefinedResult.rc){
        return res.json(checkDataDefinedResult)
    }
    //数据是否存在
    let checkUploadDataExistResult=checkUploadDataExist(req)
//console.log(checkUploadDataExistResult)
    if(checkUploadDataExistResult && 0!==checkUploadDataExistResult.rc){
        return res.json(checkUploadDataExistResult)
    }
    //数据是否符合定义的格式
    let checkDataValidResult=checkDataValid(req)
    if(checkDataValidResult && 0!==checkDataValidResult.rc){
        return res.json(checkDataValidResult)
    }
//console.log(checkDataValidResult)
    return res.json(rightResult)
})

//router.post("/checkItemData",function(req,res,next){
//    res.render('admin',{title:'首页',year:new Date().getFullYear()})
//})

//为了节省带宽(其实不必),每次只传输一个item的数据
//格式为items:[itemName]
router.post("/getItemData",function(req,res,next){
    let items=req.body.items
    //数据项是否是预定义
    for(let item of items) {
        //console.log(item)
        if (undefined === defaultSetting[item]) {
            return settingGeneralError.itemNotDefined
        }
    }
    //console.log(1)
    dataOperation.getItemSetting(items[0],function(err,result){
        //console.log(result)
        if(result.rc && result.rc>0){
            return res.json(result)
        }
//console.log(dataConvertToClient(result.msg))
        return res.json({rc:0,msg:dataConvertToClient(result.msg)})
    })
})

//客户端传来的数据是setting:{item:{subItem1:{currentData:val1},item:{subItem2:{currentData:val2}}}
router.post("/setItemData",function(req,res,next){
    //数据项/数据子项是否是预定义
    let checkDataDefinedResult=checkDataDefined(req)
    if(checkDataDefinedResult && 0!==checkDataDefinedResult.rc){
        return res.json(checkDataDefinedResult)
    }
//console.log(1)
    //数据是否存在
    let checkUploadDataExistResult=checkUploadDataExist(req)
    if(checkUploadDataExistResult && 0!==checkUploadDataExistResult.rc){
        return res.json(checkUploadDataExistResult)
    }
//console.log(1)
    //数据是否符合定义的格式
    let checkDataValidResult=checkDataValid(req)
    if(checkDataValidResult && 0!==checkDataValidResult.rc){
        return res.json(checkDataValidResult)
    }

    //数据转换成redis格式
    let settingObj=dataConvertToServer(req)
//console.log(settingObj)
    //保存虽然异步,但是不care返回值
    dataOperation.setAllSetting(settingObj)
    return res.json(rightResult)
})



module.exports = router;
