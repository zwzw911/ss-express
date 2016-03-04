/**
 * Created by wzhan039 on 2016-02-25.
 * 把前端传入的input的检查工作全部放在一个文件进行处理
 * 2部分：input的定义（require,minLength,maxLength,exactLength,format,equalTo），format只在server处理
 *         对应的函数处理
 */
'use strict'
/*********************************************/
/*                 各种定义                 */
/*********************************************/
var formatRegex=require('../assist/globalConstantDefine').constantDefine.regex
var inputGeneral=require('../error_define/input_validate').inputGeneral

var miscellaneousFunc=require('./miscellaneous').func
/*********************************************/
/*                  基本函数                */
/*********************************************/

var exceedMaxLength=function(value,maxLength){
    return value.length>maxLength
}

var exceedMinLength=function(value,minLength){
    return value.length<minLength
}

var exactLength=function(value,exactLength){
    return value.length===exactLength
}

//空值不能进行equal的比较
var equalTo=function(value,equalToValue){
    //return (false===miscellaneousFunc.isEmpty(value) && value===equalToValue)
    return value===equalToValue
}

var format=function(value,format){
    return format.test(value)
}


var generateErrorMsg={
    require:function(chineseItemName){
        return `{chineseItemName}不能为空`
    },
    maxLength:function(chineseItemName,itemDefine){
        return  `{chineseItemName}包含的字符不能超过{itemDefine}个`
    },
    minLength:function(chineseItemName,itemDefine){
        return  `{chineseItemName}包含的字符不能少于{itemDefine}个`
    },
    exactLength:function(chineseItemName,itemDefine){
        return  `{chineseItemName}包含的字符不等于于{itemDefine}个`
    },
    format:function(chineseItemName,itemDefine){
        switch(itemDefine){
            case formatRegex.strictPassword:
                return `${chineseItemName}格式不正确，必须由6至20个字母数字和特殊符号组成`
                //break;
            case formatRegex.loosePassword:
                return `${chineseItemName}格式不正确，必须由2至20个字母数字组成`
                //break;
            case formatRegex.userName:
                return `${chineseItemName}格式不正确，必须由2至20个字符组成`
            case formatRegex.mobilePhone:
                return `${chineseItemName}格式不正确，必须由11至13个数字组成`
            case formatRegex.originalThumbnail:
                return `${chineseItemName}格式不正确，文件名由2到20个字符组成`
            //hashedThumbnail不用单独列出，是内部检查，使用default错误消息即可
            default:
                return `${chineseItemName}格式不正确`
        }
    }
}




/*********************************************/
/*         主函数，检测input并返回结果        */
/*********************************************/
//inputValue:{username:{value:xxx},password:{value:yyy}}
//inputItemDefine： adminLogin。每个页面有不同的定义
var checkInput=function(inputValue,inputItemDefine){
    //检查参数的更是，必需是Object，且含有key
    if(undefined===inputValue || null===inputValue || 0===Object.keys(inputValue).length){
        return inputGeneral.general.noValue
    }

    if(undefined===inputItemDefine || null===inputItemDefine || 0===Object.keys(inputItemDefine).length){
        return inputGeneral.general.noValue
    }
    /*值是否为空，通过require进行判断*/
/*    if(undefined===inputValue || null===inputValue || 0===inputValue.length){
        return inputGeneral.general.noValue
    }*/

    for (let itemName in inputValue ){
//console.log(itemName)
        //无法确定inputValue[itemName]['value']是否undefined，如果是，会报错。所以不适用变量赋值，而在之后的函数中直接传入
        //var currentItemValue=inputValue[itemName]['value']
        let currentItemRule=inputItemDefine[itemName]

        let currentChineseName=inputItemDefine[itemName]['chineseName']
        //console.log(currentChineseName)
    //    对每个rule进行检测
        for(let singleItemRuleName in currentItemRule){
            let rc={}
            if('chineseName'!==singleItemRuleName){
                let ruleDefine=inputItemDefine[itemName][singleItemRuleName]['define']
                switch (singleItemRuleName){
                    case "require":
                        if(ruleDefine){
                            if(miscellaneousFunc.isEmpty(inputValue) || miscellaneousFunc.isEmpty(inputValue[itemName]) || miscellaneousFunc.isEmpty(inputValue[itemName]['value'])){
                                rc['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                                rc['msg']=generateErrorMsg.require(currentChineseName)
                            }
                        }
                        break;
                    case "minLength":
                        if(false===miscellaneousFunc.isEmpty(inputValue[itemName]['value']) && exceedMinLength(inputValue[itemName]['value'],ruleDefine)){
                            rc['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                            rc['msg']=generateErrorMsg.minLength(currentChineseName,ruleDefine)
                        }
                        break;
                    case "maxLength":
                        if(false===miscellaneousFunc.isEmpty(inputValue[itemName]['value']) && exceedMaxLength(inputValue[itemName]['value'],ruleDefine)){
                            rc['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                            rc['msg']=generateErrorMsg.maxLength(currentChineseName,ruleDefine)
                        }
                        break;
                    case "exactLength":
                        if(false===miscellaneousFunc.isEmpty(inputValue[itemName]['value']) && false===exactLength(inputValue[itemName]['value'],ruleDefine)){
                            rc['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                            rc['msg']=generateErrorMsg.exactLength(currentChineseName,ruleDefine)
                        }
                        break;
                    case "format":
                        if(!miscellaneousFunc.isEmpty(inputValue[itemName]['value']) && false===format(inputValue[itemName]['value'],ruleDefine)){
                            rc['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                            rc['msg']=generateErrorMsg.format(currentChineseName,ruleDefine)
                        }
                        break;
                    case "equalTo":
                        break;
                    default:

                }
            }
            //检查出错误后，立刻返回，不在检查之后的检查项
            if(rc.rc>0){
                return rc
            }
        }
    }

    return {rc:0}
}

exports.inputValid={
    checkInput:checkInput
}
