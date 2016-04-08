/**
 * Created by wzhan039 on 2016-04-05.
 */
'use strict'
var runtimeNodeError=require('./error_define/runtime_node_error').runtime_node_error
var defaultSetting=require('./inputDefine/adminLogin/defaultGlobalSetting').defaultSetting
var inputValid=require('./assist_function/inputValid').inputValid
var miscFunc=require('./assist_function/miscellaneous').func
//检查上传的设置文件的内容是否合格
/*1.所有的item和subItem必须存在，且subitem必须有值
* 2.根据define，检查值是不是合法
* */
var validateUploadSetting=function(content){
    if(true===miscFunc.isEmpty(content)){
        return runtimeNodeError.importSetting.fileContentIsEmpty
    }
    //console.log(content)
    let settingObj
    if('string'===typeof content){
        settingObj=JSON.parse(content)
    }else{
        settingObj=content
    }

    //console.log(typeof  settingObj)
    if('object'!== typeof  settingObj){
        return runtimeNodeError.importSetting.fileContentTypeWrong
    }

    //需要传入item/subItem名字，所以自定义rc
    //是否存在
    let rc={}
    for(let item in defaultSetting){
    //for(let item in settingObj){
        //console.log(settingObj[item])
        if(undefined===settingObj[item]){
            rc['rc']=runtimeNodeError.importSetting.itemNotExist.rc
            rc['msg']=`${item}${runtimeNodeError.importSetting.itemNotExist.msg}`
            return rc
        }
        for(let subItem in defaultSetting[item]){
            if(undefined===settingObj[item][subItem]){
                rc['rc']=runtimeNodeError.importSetting.itemNotExist.rc
                rc['msg']=`${item}下的${subItem}${runtimeNodeError.importSetting.itemNotExist.msg}`
                return rc
            }
        }
    }

//    是否合格
    rc={}
    for(let item in defaultSetting){
    //for(let item in settingObj){
        let convertedItem=convertSetting(settingObj[item])
        //if(item=='inner_image'){
/*console.log(convertedItem)
console.log(defaultSetting[item])*/
        //}
        let result=inputValid.checkInput(convertedItem,defaultSetting[item])
        //console.log(result)
        rc[item]=result
/*        if(result.rc>0){
            return result
        }*/
    }

    return rc
}

//inputValid.checkInput中值的格式是item:{subitem1:{value:val1},subItem2:{value:val2}}
//er而文件上传格式为item:{subItem1:val1,subItem2:val2}。所以需要转化
var convertSetting=function(item){
    //console.log(item)
    let convertedResult={}
    for(let subItem in item){
        convertedResult[subItem]={}
        convertedResult[subItem]['value']=item[subItem]
    }
    return convertedResult
}


var checkImportSetting=function(data){
    let validateResult=validateUploadSetting(data)
//console.log(validateResult)
    //有普通错误，返回
    if(validateResult['rc'] && validateResult['rc'] > 0){
        return validateResult
    }

    //检查是否有input各自的错误，有的话，只把错误的信息留下（减少server<--->client之间的数据
    for(let item in validateResult){
        for(let subItem in validateResult[item]){
            if(0===validateResult[item][subItem]['rc']){
                delete validateResult[item][subItem]
                //validateResult[item][subItem]=undefined
            }
        }
    }
    //进一步遍历item，如果没有subItem，设成undefined，以便节省网络
    for(let item in validateResult){
        if(0===Object.keys(validateResult[item]).length){
            delete validateResult[item]
        }
    }
    //console.log(Object.keys(validateResult).length)
    if(0<Object.keys(validateResult).length){
        return {rc:runtimeNodeError.importSetting.fileContentWrong.rc,msg:validateResult}
    }else{
        return {rc:0}
    }

}

exports.admin_assist_func={
    //validateUploadSetting:validateUploadSetting,
    checkImportSetting:checkImportSetting,
}


