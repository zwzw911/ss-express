/**
 * Created by wzhan039 on 2015-07-20.
 */
var general=require('../../../routes/assist/general.js').general;

var pattern={
    singleSpecialChar:/^[A-Za-z0-9\~\\!\@\#\$\%\^\&\*\)\(\_\+\=\-\`\}\{\:\"\|\?\>\<\,\./;'\\\[\]]$/,
    hosts:/(https?:\/\/[-\w.]+(:\d{1,5})?)(\/([\w_.]*)?)?/g,    //从字符串中获得所有匹配的host地址，适用于整片文章 [ 'http://asf.com', 'http://fgf-sd_f.com/ar' ]
    host:/(https?:\/\/[-\w.]+(:\d{1,5})?)(\/([\w_.]*)?)?/       //从匹配的host地址获得URL，适用于单个URL            http://asf.com
}

var check=function(string,type){
    switch (type){
        case 'singleSpecialChar':
            return pattern.singleSpecialChar.test(string)
            break
        case 'hosts':
/*            pattern=/(https?:\/\/[-\w.]+(:\d{1,5})?)(\/([\w_.]*)?)?/g
            r=str.match(pattern)
            str='http://asf.com <img src="http://fgf-sd_f.com/ar/asdf?af=af">'
            r=str.match(pattern)
                [ 'http://asf.com', 'http://fgf-sd_f.com/ar' ]*/
            r=string.match(pattern.hosts)
            if(null===r){return false}
            //console.log(r)
            return r;// with g, the result is an array
            break;
        case 'host':
/*            var pattern=/(https?:\/\/[-\w.]+(:\d{1,5})?)(\/([\w_.]*)?)?/
                str.match(pattern)
                     [ 'https://localhost:3000/article',                                 //匹配文本
                     'https://localhost:3000',                                                   //子表达式1：([-\w.]+(:\d{1,5})?) 必需
                     ':3000',                                                           //子表达式2    (:\d{1,5})?         可选
                     '/article',                                                        //子表达式3     (\/([\w_.]*)?)?    可选
                     'article',                                                         //子表达式4     ([\w_.]*)?  可选
                     index: 0,                                                          //匹配开始的index
                     input: 'https://localhost:3000/article?file=asdf.png&dir=test' ]   //原始字符串
            */

            var r=string.match(pattern.host)
            if(null===r){return false}      //没有匹配到
            //匹配到，那么必定有host
            //console.log(r[1])
            //console.log(general.host)
            //console.log(r[1]===general.host)
            return (r[1]===general.host)

            break;
    }
}

exports.check=check;
