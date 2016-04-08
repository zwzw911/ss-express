/**
 * Created by wzhan039 on 2016-04-04.
 * 客户端对input的定义（angularjs要用的属性）和rule（angularjs进行检查），都根据server端的定义自动产生
 */
    'use strict'
var inputDataType=require('../assist/enum_define/inputValidEnumDefine').enum.inputDataType
//var inputCheckRule=require('../assist/enum_define/inputValidEnumDefine').enum.inputCheckRule
var clientInputCheckRule=require('../assist/enum_define/inputValidEnumDefine').enum.clientInputCheckRule
//var fs=require('fs')

//遍历defalutGlobalSetting对象，生成对应的client端的input属性
//level：深度
var generateClientDefine=function(obj,level,resultObj){
    if('object'===typeof obj){
        for(let key in obj){
            resultObj[key]={}
            //深度为1，到达最底层
            if(1===level){
                let tmpChineseName=obj[key]['chineseName']
                let temInputDataType
                switch (obj[key]['type']){
                    case inputDataType.number:
                        temInputDataType='number';
                        break;
                    case inputDataType.password:
                        temInputDataType='password';
                        break;
                    default:
                        temInputDataType='text'
                }
                resultObj[key]={value:'',originalValue:'',blur:false,focus:true,inputDataType:temInputDataType,inputIcon:"",chineseName:tmpChineseName,valid:undefined,errorMsg:""}
                //obj[key]['chineseName']=tmpChineseName
            }else{
                //如果值是对象，递归调用
                if('object'===typeof obj[key]){
                    let currentLvl=level-1
                    //console.log(currentLvl)
                    generateClientDefine(obj[key],currentLvl,resultObj[key])
                }
                /*                else{
                 obj[key]={}
                 //func()
                 }*/
            }
        }
    }
}

//根据server端rule define，生成客户端rule define
//obj:server端item的rule define（inputRuleDefine）或者defalutGlobalSetting
// level：深度（2）
var generateClientRule=function(obj,level,resultObj){
    if('object'===typeof obj){
        for(let key in obj){
            resultObj[key]={}
            //深度为1,达到subItem
            if(1===level){
                for(let field in clientInputCheckRule){
                    //rule有定义
                    if(undefined!==obj[key][field] && null!==obj[key][field]){
                        //读取rule定义
                        if(undefined!==obj[key][field]['define'] && null!==obj[key][field]['define']){
                            resultObj[key][field]=obj[key][field]['define']
                        }

                    }
                }
/*                let tmpChineseName=obj[key]['chineseName']
                obj[key]={}
                obj[key]['chineseName']=tmpChineseName*/
            }else{
                //如果值是对象，递归调用
                if('object'===typeof obj[key]){
                    let currentLvl=level-1
                    generateClientRule(obj[key],currentLvl,resultObj[key])
                }

            }
        }
    }
}

/*exports.func= {
    generateClientDefine: generateClientDefine,
    generateClientRule: generateClientRule,
}*/


var globalSetting=require('../inputDefine/adminLogin/defaultGlobalSetting').defaultSetting
var adminLoginSetting=require('../inputDefine/adminLogin/inputRuleDefine').inputRuleDefine
var resultResult={}

var a=generateClientDefine(adminLoginSetting,2,resultResult)
console.log(resultResult)

/*
var a=generateClientRule(globalSetting,2,resultResult)
console.log(resultResult)*/
