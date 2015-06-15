/**
 * Created by ada on 2015/6/7.
 */
var ccapClass=require('ccap');
var captchaInst = ccapClass({
    width:128,//set width,default is 256
    height:40,//set height,default is 60
    offset:20,//set text spacing,default is 40
    quality:100//set pic quality,default is 50
    //generate:function(){//Custom the function to generate captcha text
    //
    //    //generate captcha text here
    //
    //    return text;//return the captcha text
    //
    //}

});
exports.captchaInst=captchaInst;

