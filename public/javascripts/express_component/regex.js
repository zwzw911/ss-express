/**
 * Created by wzhan039 on 2015-07-20.
 * testXXXX: return boolean
 * getXXXX: if get,return content; else return false
 */
var general=require('../../../routes/assist/general.js').general;

var pattern={
    testSingleSpecialChar:/^[A-Za-z0-9\~\\!\@\#\$\%\^\&\*\)\(\_\+\=\-\`\}\{\:\"\|\?\>\<\,\./;'\\\[\]]$/,
    getHosts:/(https?:\/\/[-\w.]+(:\d{1,5})?)(\/([\w_.]*)?)?/g,    //从字符串中获得所有匹配的host地址，适用于整片文章 [ 'http://asf.com', 'http://fgf-sd_f.com/ar' ]
    testHost:/(https?:\/\/[-\w.]+(:\d{1,5})?)(\/([\w_.]*)?)?/ ,      //从匹配的host地址获得URL，适用于单个URL            http://asf.com
    getImg:/<img.*?>/g,       //从ueditor中获得img元素
    getImgSrc:/<img.+src="([0-9a-f]{40}\.(png|jpeg|jpg|gif))".*\/?>/,      //从img元素中获得src属性
    testArticleHash:/[0-9a-f]{40}/   //article的hash id
}

var check=function(origString,type){
    switch (type){
        case 'testSingleSpecialChar':
            return pattern.testSingleSpecialChar.test(origString)
            break
        case 'getHosts':
/*            pattern=/(https?:\/\/[-\w.]+(:\d{1,5})?)(\/([\w_.]*)?)?/g
            r=str.match(pattern)
            str='http://asf.com <img src="http://fgf-sd_f.com/ar/asdf?af=af">'
            r=str.match(pattern)
                [ 'http://asf.com', 'http://fgf-sd_f.com/ar' ]*/
            r=origString.match(pattern.getHosts)
            if(null===r){return false}
            //console.log(r)
            return r;// with g, the result is an array
            break;
        case 'testHost':
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

            var r=origString.match(pattern.testHost)
            if(null===r){return false}      //没有匹配到
            //匹配到，那么必定有host
            //console.log(r[1])
            //console.log(general.host)
            //console.log(r[1]===general.host)
            return (r[1]===general.host)

            break;
        case 'getImg':/*false:没有匹配到任何img；否则就是匹配到*/
            r=origString.match(pattern.getImg)
            /*                [ '<img src>',
             '<img src="">',
             '<img src="local/test/asdf?test.png">',
             '<img src="local/test/tett.png"/>' ]*/
            if(null===r){return false}
            return r
        case 'getImgSrc':/*false:没有匹配到任何img中的src；否则就是匹配到*/
                tmp=origString.match(pattern.getImgSrc); //去除除了文件本生之外的其他字符 localhost:3000/test.png===>test.png 因为ueditor中的img src直接使用文件名

                if(null===tmp){
                    return false
                }
                return tmp[1] //因为img格式固定，所以[1]就是server生成的图片名字
        case "":
            return pattern.testArticleHash.test(origString)
            break;

    }
}

exports.check=check;
