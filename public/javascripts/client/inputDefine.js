/**
 * Created by zw on 2015/9/19.
 */
var inputDefineApp=angular.module('inputDefineApp',[]);

//inputDefine.config(function(){
//    var define={
//        a:1
//    }
//})

inputDefineApp.constant('inputDefine',{
    user:{
        name: {
            require: {define: true, msg: '用户名必须存在'},
            type: {define: /^[\u4E00-\u9FFF\w]{2,20}$/, msg: '用户名由2-20个字符组成'}
        },
        password:{
            require: {define: true, msg: '密码必须存在'},
            type: {define: /^[A-Za-z0-9\~\\!\@\#\$\%\^\&\*\)\(\_\+\=\-\`\}\{\:\"\|\?\>\<\,\./;'\\\[\]]{2,20}$/, msg: '密码由字母,数字,特殊字符组成,长度2-20个字符'}
        },
        rePassword:{
            equal:{define:undefined,msg:'两次输入的密码必须一致'}
        },
        mobilePhone:{
            require: {define: false},
            type: {define:/^\d{11,13}$/, msg: '手机号由11-13个数字组成'}
        }
    },
    search:{
        format:{define:undefined,msg:'搜索字符的格式不正确，请重新输入'},
        missSearchKey:{define:undefined,msg:'搜索字符串为空，请重新输入'}
    }

})


