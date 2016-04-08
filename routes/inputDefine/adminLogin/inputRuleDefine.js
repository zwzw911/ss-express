/**
 * Created by wzhan039 on 2016-03-03.
 */

var regex=require('../../assist/globalConstantDefine').constantDefine.regex

var inputDataType=require('../../assist/enum_define/inputValidEnumDefine').enum.inputDataType
/*********************************************/
/* input定义，理论上应该定义单独文件中       */
/*********************************************/
//在server端，定义和属性放在一起（属性没几个）
//chineseName和type为必需。 type:输入数据的类型，string、int、date、boolean。array，object，默认是string
var inputRuleDefine={
    user:{
        userName:{
            chineseName: '用户名',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10000}},
            //使用min/maxLength即可，不用正则，节省cpu
            minLength: {define: 2, error: {rc: 10002}},
            maxLength: {define: 40, error: {rc: 10004}}
            //format:{define:regex.userName,error:{rc:10006}}
        },
        password:{
            chineseName: '密码',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10010}},
            //直接使用regex。同时判断类型和长度范围
            format: {define: regex.loosePassword, error: {rc: 10012}}
        },
        //由password派生出来
        encryptedPassword:{
            chineseName: '加密密码',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10014}},
            //直接使用regex。同时判断类型和长度范围
            format: {define: regex.encryptedPassword, error: {rc: 10016}}
        },
        //只是为了显示不同的chineseName
        oldPassword:{
            chineseName: '旧密码',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10017}},
            //直接使用regex。同时判断类型和长度范围
            format: {define: regex.loosePassword, error: {rc: 10018}}
        },
        rePassword:{
            chineseName: '再次输入密码',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10019}},
            //直接使用regex。同时判断类型和长度范围
            format: {define: regex.loosePassword, error: {rc: 10020}}
        },
        mobilePhone:{
            chineseName: '手机号',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10030}},
            //直接使用regex。同时判断类型和长度范围
            format: {define: regex.mobilePhone, error: {rc: 10032}}
        },
        captcha:{
            chineseName: '验证码',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10022}},
            exactLength:{define: 4, error: {rc: 10024}}
        },
        originalThumbnailName:{
            chineseName: '头像',
            type:inputDataType.file,
            require: {define: true, error: {rc: 10030}},
            format:{define: regex.originalThumbnail, error: {rc: 10032}}
        },
        hashedThumbnailName:{
            chineseName: '头像',
            type:inputDataType.file,
            require: {define: true, error: {rc: 10040}},
            format:{define: regex.hashedThumbnail, error: {rc: 10042}}
        }
    },

    adminLogin: {
        userName: {
            chineseName: '用户名',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10100}},
            minLength: {define: 2, error: {rc: 10102}},
            maxLength: {define: 40, error: {rc: 10104}}
        },
        password: {
            chineseName: '密码',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10110}},
            //minLength:{define:2,error:{rc:9006}},
            //maxLength:{define:20,error:{rc:9008}},
            format: {define: regex.strictPassword, error: {rc: 10112}}
        },
        captcha:{
            chineseName: '验证码',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10120}},
            exactLength:{define: 4, error: {rc: 10122}}
        },
    }
}

exports.inputRuleDefine=inputRuleDefine