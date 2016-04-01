/**
 * Created by wzhan039 on 2016-02-25.
 * 把前端传入的input的检查工作全部放在一个文件进行处理
 * 2部分：input的定义（require,minLength,maxLength,exactLength,format,equalTo），format只在server处理
 * 新增定义：min，max，file，folder：min/max：整数大小；file/folder：文件/文件夹是否存在
 *         对应的函数处理
 */
'use strict'
/*********************************************/
/*                 各种定义                 */
/*********************************************/
var formatRegex=require('../assist/globalConstantDefine').constantDefine.regex
var inputGeneral=require('../error_define/input_validate').inputGeneral

var miscFunc=require('./miscellaneous').func

var fs=require('fs')
var inputType=require('../assist/enum_define/inputValidEnumDefine').enum.inputType

var rightResult={rc:0}
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
    //return (false===miscFunc.isEmpty(value) && value===equalToValue)
    return value===equalToValue
}

var format=function(value,format){
    return format.test(value)
}

var exceedMax=function(value,definedValue){
    return parseInt(value)>parseInt(definedValue)
}
var exceedMin=function(value,definedValue){
    return parseInt(value)<parseInt(definedValue)
}

var ifFileFloderExist=function(value){
    return fs.existsSync(value)
}
var isFolder=function(value){
        return fs.statSync(value).isDirectory()
}
var isFile=function(value){
    return fs.statSync(value).isFile()
}

var isNumber=function(value){
    return formatRegex.number.test(value)
}

//require,maxLength,minLength,exactLength,min,max,format
var generateErrorMsg={
    require:function(chineseName,useDefaultValueFlag){
        if(undefined===useDefaultValueFlag || null===useDefaultValueFlag){
            useDefaultValueFlag=false
        }
        let defaultMsg= useDefaultValueFlag ? '默认值':'';
        return `${chineseName}${defaultMsg}不能为空`
    },
    maxLength:function(chineseName,itemDefine,useDefaultValueFlag){
        if(undefined===useDefaultValueFlag || null===useDefaultValueFlag){
            useDefaultValueFlag=false
        }
        let defaultMsg= useDefaultValueFlag ? '默认值':'';
        return  `${chineseName}${defaultMsg}包含的字符不能超过${itemDefine}个`
    },
    minLength:function(chineseName,itemDefine,useDefaultValueFlag){
        if(undefined===useDefaultValueFlag || null===useDefaultValueFlag){
            useDefaultValueFlag=false
        }
        let defaultMsg= useDefaultValueFlag ? '默认值':'';
        return  `${chineseName}${defaultMsg}包含的字符不能少于${itemDefine}个`
    },
    exactLength:function(chineseName,itemDefine,useDefaultValueFlag){
        if(undefined===useDefaultValueFlag || null===useDefaultValueFlag){
            useDefaultValueFlag=false
        }
        let defaultMsg= useDefaultValueFlag ? '默认值':'';
        return  `${chineseName}${defaultMsg}包含的字符不等于${itemDefine}个`
    },
    max:function(chineseName,itemDefine,useDefaultValueFlag,unit){
        if(undefined===useDefaultValueFlag || null===useDefaultValueFlag){
            useDefaultValueFlag=false
        }
        let defaultMsg= useDefaultValueFlag ? '默认值':'';
        unit= (undefined===unit || null===unit) ? '':unit
        return  `${chineseName}${defaultMsg}的值不能大于${itemDefine}${unit}`
    },
    min:function(chineseName,itemDefine,useDefaultValueFlag,unit){
        if(undefined===useDefaultValueFlag || null===useDefaultValueFlag){
            useDefaultValueFlag=false
        }
        let defaultMsg= useDefaultValueFlag ? '默认值':'';
        unit= (undefined===unit || null===unit) ? '':unit
        return  `${chineseName}${defaultMsg}的值不能小于${itemDefine}${unit}`
    },
    equalTo:function(chineseName,equalToChineseName){
        return `${chineseName}和${equalToChineseName}不相等`
    },
/*    file:function(chineseName,itemDefine,useDefaultValueFlag){
        if(undefined===useDefaultValueFlag || null===useDefaultValueFlag){
            useDefaultValueFlag=false
        }
        let defaultMsg= useDefaultValueFlag ? '默认值':'';
        return  `文件：${chineseName}${defaultMsg}不存在`
    },
    folder:function(chineseName,itemDefine,useDefaultValueFlag){
        if(undefined===useDefaultValueFlag || null===useDefaultValueFlag){
            useDefaultValueFlag=false
        }
        let defaultMsg= useDefaultValueFlag ? '默认值':'';
        return  `目录：{chineseName}${defaultMsg}不存在`
    },*/
    format:function(chineseName,itemDefine,useDefaultValueFlag){
        if(undefined===useDefaultValueFlag || null===useDefaultValueFlag){
            useDefaultValueFlag=false
        }
        let defaultMsg= useDefaultValueFlag ? '默认值':'';
        switch(itemDefine){
            case formatRegex.strictPassword:
                return `${chineseName}${defaultMsg}的格式不正确，必须由6至20个字母数字和特殊符号组成`
                //break;
            case formatRegex.loosePassword:
                return `${chineseName}${defaultMsg}的格式不正确，必须由2至20个字母数字组成`
                //break;
            case formatRegex.userName:
                return `${chineseName}${defaultMsg}的格式不正确，必须由2至20个字符组成`
            case formatRegex.mobilePhone:
                return `${chineseName}${defaultMsg}的格式不正确，必须由11至13个数字组成`
            case formatRegex.originalThumbnail:
                return `${chineseName}${defaultMsg}的格式不正确，文件名由2到20个字符组成`
            //hashedThumbnail不用单独列出，是内部检查，使用default错误消息即可
            default:
                return `${chineseName}${defaultMsg}的格式不正确`
        }
    },

}

var typeCheck=function(value,type){
    switch (type){
        case inputType.int:
            return miscFunc.isInt(value)
            //break;
        case inputType.string:
            return true
            //break;
        case inputType.date:
            return miscFunc.isDate(value)
            //break;
        case inputType.array:
            return miscFunc.isArray(value)
            //break;
        case inputType.object:
            return true
            //break;
        case inputType.file:
            return (ifFileFloderExist(value) && isFile(value));
        case inputType.folder:
            return (ifFileFloderExist(value) &&isFolder(value))
        case inputType.number:
            return isNumber(value)
        default:
            console.log('type not define')
            return false
    }
}

//对rule定义进行检查
var ruleCheck=function(inputRules){
    let rc={}
    for(let inputRule in inputRules){
        //1 检查必须的field
        let mandatoryFields=['chineseName','type','require']
        for(let mandatoryField of mandatoryFields){
            if(undefined===inputRules[inputRule][mandatoryField] || null===inputRules[inputRule][mandatoryField]){
                rc['rc']=inputGeneral.general.mandatoryFiledNotExist.rc
                rc['msg']=`${inputRule}的字段${mandatoryField}${inputGeneral.general.mandatoryFiledNotExist.msg}`
                //console.log(rc)
                return rc
                //return inputGeneral.general.mandatoryFiledNotExist
            }
        }
/*        let mandatoryFieldsLength=mandatoryFields.length
        for(let i=0;i<mandatoryFieldsLength;i++){
            let mandatoryField=mandatoryFields[i]
            if(undefined===inputRules[inputRule][mandatoryField] || null===inputRules[inputRule][mandatoryField]){
                rc['rc']=inputGeneral.general.mandatoryFiledNotExist.rc
                rc['msg']=`${inputRule}的字段${mandatoryField}${inputGeneral.general.mandatoryFiledNotExist.msg}`
                //console.log(rc)
                return rc
                //return inputGeneral.general.mandatoryFiledNotExist
            }
        }*/
/*        mandatoryFields.forEach(function(mandatoryField){
/!*            console.log(inputRule)
            console.log(mandatoryField)*!/
            //console.log(inputRules[inputRule][mandatoryField])

        })*/
//console.log('not exit')
/*        for(let mandatoryField in mandatoryFields){

        }*/
        //2 关联字段是否存在
        switch (inputRules[inputRule]['type']){
            case 'int':
                if(miscFunc.isEmpty(inputRules[inputRule]['min'])){
                    rc['rc']=inputGeneral.general.needMin.rc
                    rc['msg']=`${inputRule}${inputGeneral.general.needMin.msg}`
                    return rc
                }
                if( miscFunc.isEmpty(inputRules[inputRule]['max'])){
                    rc['rc']=inputGeneral.general.needMax.rc
                    rc['msg']=`${inputRule}${inputGeneral.general.needMax.msg}`
                    return rc
                }
                break;
            case 'number':
                if(miscFunc.isEmpty(inputRules[inputRule]['maxLength'])){
                    rc['rc']=inputGeneral.general.needMaxLength.rc
                    rc['msg']=`${inputRule}${inputGeneral.general.needMaxLength.msg}`
                    return rc
                };
                break
            default:
                break;
        }
        //3 rule字段的定义是否合格
        let rules=['require','maxLength','minLength','exactLength','min','max','format','equalTo']
        let rulesLength=rules.length
        //不用forEach，因为其参数为function，遇到错误，return，只是退出forEach的function，而不是整个function
        for (let i=0;i<rulesLength;i++){
            let singleRule=rules[i]
            if(false===miscFunc.isEmpty(inputRules[inputRule][singleRule])){
                let singleRuleDefine=inputRules[inputRule][singleRule]['define']

                switch (singleRule){
                    case 'require':
                        if(false!==singleRuleDefine && true!==singleRuleDefine){
                            rc['rc']=inputGeneral.general.requireDefineNotBoolean.rc
                            rc['msg']=`${inputRule}的${inputGeneral.general.requireDefineNotBoolean.msg}`
                            return rc
                        }
                        break;
                    case 'minLength':
                        if(false===miscFunc.isInt(singleRuleDefine)){
                            rc['rc']=inputGeneral.general.minLengthDefineNotInt.rc
                            rc['msg']=`${inputRule}的${inputGeneral.general.minLengthDefineNotInt.msg}`
                            return rc
                        }
                        break;
                    case 'maxLength':
                        if(false===miscFunc.isInt(singleRuleDefine)){
                            rc['rc']=inputGeneral.general.maxLengthDefineNotInt.rc
                            rc['msg']=`${inputRule}的${inputGeneral.general.maxLengthDefineNotInt.msg}`
                            return rc
                        }
                        break;
                    case 'exactLength':
                        if(false===miscFunc.isInt(singleRuleDefine)){
                            rc['rc']=inputGeneral.general.exactLengthDefineNotInt.rc
                            rc['msg']=`${inputRule}的${inputGeneral.general.exactLengthDefineNotInt.msg}`
                            return rc
                        }
                        break;
                    case 'min':
                        if(false===miscFunc.isInt(singleRuleDefine)){
                            rc['rc']=inputGeneral.general.minDefineNotInt.rc
                            rc['msg']=`${inputRule}的${inputGeneral.general.minDefineNotInt.msg}`
                            return rc
                        }
                        break;
                    case 'max':
                        if(false===miscFunc.isInt(singleRuleDefine)){
                            rc['rc']=inputGeneral.general.maxDefineNotInt.rc
                            rc['msg']=`${inputRule}的${inputGeneral.general.maxDefineNotInt.msg}`
                            return rc
                        }
                        break;
                    case 'format':
                        break;
                    case 'equalTo':
                        break;
                    default:
                        break;
                }

//                检测error['rc']是否定义
                if(undefined===inputRules[inputRule][singleRule]['error'] || null===undefined===inputRules[inputRule][singleRule]['error'] ){
                    return inputGeneral.general.errorFieldNotDefine
                }
                if(undefined===inputRules[inputRule][singleRule]['error']['rc'] || null===undefined===inputRules[inputRule][singleRule]['error']['rc'] ){
                    return inputGeneral.general.rcFieldNotDefine
                }
/*                if(false===defineOkFlag){

                }*/

            }
        }
    }

    return rightResult

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
    let rc={}
    for (let itemName in inputValue ){
        rc[itemName]={}
        rc[itemName]['rc']=0
        //无法确定inputValue[itemName]['value']是否undefined，如果是，会报错。所以不适用变量赋值，而在之后的函数中直接传入
        //var currentItemValue=inputValue[itemName]['value']
        if(undefined===inputItemDefine[itemName] || null===inputItemDefine[itemName]){
            rc[itemName]['rc']=inputGeneral.general.noRelatedItemDefine.rc
            rc[itemName]['msg']=`${itemName}${inputGeneral.general.noRelatedItemDefine.msg}`
            //return rc
            //return inputGeneral.general.noRelatedItemDefine
        }
        let currentItemRule=inputItemDefine[itemName]
        //0 检查必需字段（chineseName，type，rule（至少一个）
//console.log(currentItemRule['chineseName'])
 /*       if(undefined===currentItemRule['chineseName'] || null===currentItemRule['chineseName'] ){
            rc['rc']=inputGeneral.general.noChineseName.rc
            rc['msg']=`${itemName}${inputGeneral.general.noChineseName.msg}`
            return rc
            //return inputGeneral.general.noChineseName
        }
        if(undefined===currentItemRule['type'] || null===currentItemRule['type'] ){
            rc['rc']=inputGeneral.general.noType.rc
            rc['msg']=`${itemName}${inputGeneral.general.noType.msg}`
            return rc
            //return inputGeneral.general.noType
        }
        let atLeastOneRuleExist=false
        for(let singleItemRuleName in currentItemRule){
            let rule=['require','maxLength','minLength','exactLength','min','max','format']
            if(-1!==rule.indexOf(singleItemRuleName)){
                atLeastOneRuleExist=true
            }
        }
        if(false===atLeastOneRuleExist){
            return inputGeneral.general.noRule
        }*/


        let currentChineseName=inputItemDefine[itemName]['chineseName']
        //先行判断输入值是否empty，然后赋值给变量；而不是多次使用isEmpty函数。如此，可以加快代码执行速度
        let emptyFlag=(miscFunc.isEmpty(inputValue) || miscFunc.isEmpty(inputValue[itemName]) ||  miscFunc.isEmpty(inputValue[itemName]['value']))
        //let currentItemValue=miscFunc.isEmpty(inputValue[itemName]['value']) ? undefined:inputValue[itemName]['value']
        let currentItemValue=inputValue[itemName]['value']
        //1. 是否用default代替空的inputValue
        //1 如果是require，但是value为空，那么检查是否有default设置，有的话，inputValue设成default
        let useDefaultValueFlag=false
        if(currentItemRule['require'] && true===currentItemRule['require']['define']){
            if(true===emptyFlag){
                if(currentItemRule['default'] && false===miscFunc.isEmpty(currentItemRule['default'])){
                    useDefaultValueFlag=true;
                    currentItemValue=currentItemRule['default']
                    //重新计算emptyFlag
                    emptyFlag=miscFunc.isEmpty(currentItemValue)
                }
            }
        }
        //2. 如果有maxLength属性，首先检查（防止输入的参数过于巨大）
        if(currentItemRule['maxLength'] && currentItemRule['maxLength']['define']){
            let maxLengthDefine=currentItemRule['maxLength']['define']
            if(false===emptyFlag && true===exceedMaxLength(currentItemValue,maxLengthDefine)){
                rc[itemName]['rc']=currentItemRule['maxLength']['error']['rc']
                rc[itemName]['msg']=generateErrorMsg.maxLength(currentChineseName,maxLengthDefine,useDefaultValueFlag)
                continue
                //return rc
            }
        }
        //3. 如果type是number，必须包含maxLenght(是否有type开始已经检查过)，然后检查值是不是符合type的定义
        //只要值不为空，检测是否定义了type属性，如果定义了，就要检查类型；没有定义。报错
        //if( false===emptyFlag){
        //    if(currentItemRule['type']){
                //如果是number，还要检查是不是有maxlength属性
/*        if(inputType.number===currentItemRule['type']){
            if(!currentItemRule['maxLength'] ){
                rc['rc']=inputGeneral.general.needMaxLength.rc
                rc['msg']=`${itemName}的${inputGeneral.general.needMaxLength.msg}`
                return rc
                //return inputGeneral.general.needMaxLength
            }
        }*/
        let result = typeCheck(currentItemValue,currentItemRule['type'])
        if(false===result){
            rc[itemName]['rc']=inputGeneral.general.typeWrong.rc
            rc[itemName]['msg']=`${itemName}${inputGeneral.general.typeWrong.msg}`
            continue
            //return rc
            //return inputGeneral.general.typeWrong
        }
        //    }else{
        //        return inputGeneral.general.noType
        //    }
        //}
        //    4. 检查出了maxLength之外的每个rule进行检测
        for(let singleItemRuleName in currentItemRule){
            if('chineseName'!==singleItemRuleName && 'default'!==singleItemRuleName && 'type'!==singleItemRuleName && 'unit'!== singleItemRuleName){
                let ruleDefine=currentItemRule[singleItemRuleName]['define']
                switch (singleItemRuleName){
                    case "require":
                        if(ruleDefine){
                            if(true===emptyFlag){
                                rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                                rc[itemName]['msg']=generateErrorMsg.require(currentChineseName,useDefaultValueFlag)
                            }
                        }
                        break;
                    case "minLength":
                        if(false===emptyFlag ){
/*                            if(false===miscFunc.isInt(ruleDefine)){
                                return inputGeneral.general.minLengthDefineNotInt
                            }*/
                            if(true===exceedMinLength(currentItemValue,ruleDefine)){
                                rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                                rc[itemName]['msg']=generateErrorMsg.minLength(currentChineseName,ruleDefine,useDefaultValueFlag)
                            }
                        }
                        break;
                    case "maxLength":
                        if(false===emptyFlag){
/*                            if(false===miscFunc.isInt(ruleDefine)){
                                return inputGeneral.general.maxLengthDefineNotInt
                            }*/
                            if(true===exceedMaxLength(currentItemValue,ruleDefine)){
                                rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                                rc[itemName]['msg']=generateErrorMsg.maxLength(currentChineseName,ruleDefine,useDefaultValueFlag)
                            }
                        }
                        break;
                    case "exactLength":
                        if(false===emptyFlag){
/*                            if(false===miscFunc.isInt(ruleDefine)){
                                return inputGeneral.general.exactLengthDefineNotInt
                            }*/
                            if(false===exactLength(currentItemValue,ruleDefine)){
                                rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                                rc[itemName]['msg']=generateErrorMsg.exactLength(currentChineseName,ruleDefine,useDefaultValueFlag)
                            }
                        }
                        break;
                    case 'max':
                        if(false===emptyFlag){
/*                            if(false===miscFunc.isInt(ruleDefine)){
                                return inputGeneral.general.maxDefineNotInt
                            }*/

                            if(true===exceedMax(currentItemValue,ruleDefine)){
                                rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                                rc[itemName]['msg']=generateErrorMsg.max(currentChineseName,ruleDefine,useDefaultValueFlag,inputItemDefine[itemName]['unit'])
/*                                if('expireTimeOfRejectTimes'===itemName){
                                    console.log(rc)
                                    console.log(inputItemDefine[itemName]['unit'])
                                }*/
                            }
                        }
                        break;
                    case 'min':
                        if(false===emptyFlag){
/*                            if(false===miscFunc.isInt(ruleDefine)){
                                return inputGeneral.general.minDefineNotInt
                            }*/
                            if(true===exceedMin(currentItemValue,ruleDefine,inputItemDefine[itemName]['unit'])){
                                rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                                rc[itemName]['msg']=generateErrorMsg.min(currentChineseName,ruleDefine,useDefaultValueFlag,inputItemDefine[itemName]['unit'])
                            }
                        }
                        break;
                    case "format":
                        if(false===emptyFlag && false===format(currentItemValue,ruleDefine)){
                            rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                            rc[itemName]['msg']=generateErrorMsg.format(currentChineseName,ruleDefine,useDefaultValueFlag)
                        }
                        break;
                    case "equalTo":
                        //1
                        let equalToFiledName=inputItemDefine[itemName][singleItemRuleName]['define']
                        //if(false===emptyFlag){
                        //    rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                        //    rc[itemName]['msg']=generateErrorMsg.format(currentChineseName,ruleDefine,useDefaultValueFlag)
                        //}
                        if(true===emptyFlag || true===miscFunc.isEmpty(inputValue[equalToFiledName]['value']) || inputValue[itemName]['value']!==inputValue[equalToFiledName]['value']){
                            rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                            rc[itemName]['msg']=generateErrorMsg.equalTo(currentChineseName,inputItemDefine[equalToFiledName]['chineseName'])
                        }
                        break;
                    default:

                }
            }
            //检查出错误后，不在继续检测当前item的其它rule，而是直接检测下一个item
            if(0!==rc[itemName].rc){
//console.log('skip')
                continue
            }
        }


    }

    return rc
}

exports.inputValid={
    ruleCheck:ruleCheck,
    checkInput:checkInput
}
