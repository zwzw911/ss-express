var Canvas = require('canvas');
var captchaImgPath=require('../assist/general').general.captchaImg_path;
var runtimeNodeError=require('../error_define/runtime_node_error').runtime_node_error
var fs=require('fs');

var defaultParams={
    expireDuration:1, // minute
    resultMode:0,   //0:DataURL; 1:filepath; 2: buffer
    //saveDir:__dirname,
    //character setting

    fontRandom:true,
    fontSize:20,//[16-32]
    fontType:'normal',
    fontWeight:'normal',
    fontFamily:'serfi',

    shadow:true,

    size:4,//character number
    inclineFactor:0.25, //文字倾斜系数

    //img setting, in px
    width: 80,
    height:32
};

/*  pre defined setting */
var validString='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';//these character has the same width and height, while abcdefghijklmnopqrstuvwxyz are hard to calc widht/height
var validFontType=['normal','italic'];
var validFontWeight=['100','200','300','400','500','600','700','800','900','normal','bold','bolder','lighter'];
//var validFontSize=[11,12,13,14,15,16,17]			// in px
var validFontFamily=['serif','sans-serif','monospace','cursive','fantasy'];


/*  get random element from pre defined font array  */
var genRandomEle=function(array){
    var length=array.length;
    var randomIdx=Math.round(Math.random()*(length-1));
    //console.log(randomIdx)
    return array[randomIdx];
};

/*  gen random character font setting*/
var genRandomFontSetting=function(params){
    params.fontType=genRandomEle(validFontType);
    params.fontWeight=genRandomEle(validFontWeight);
    //params.fontSize=genRandomEle(validFontSize);	//font should be constant to define the width
    params.fontFamily=genRandomEle(validFontFamily);
    //return params.fontType+' '+params.fontWeight+' '+params.fontSize+'px '+params.fontFamily
};

var convertToInt=function(number){
    return (isNaN(parseInt(number))) ? false:parseInt(number)
}

var convertToFloat=function(number){
    return (isNaN(parseFloat(number))) ? false:parseFloat(number)
}

/*generate mandatory params(if not set or param not correct, use default; otherwise use user set param)*/
var generateMandatoryParams=function(params){
    var tmpInt,tmpFloat;
    if(undefined===params || undefined===params.resultMode){
        params.resultMode=defaultParams.resultMode
    }else{
        tmpInt=convertToInt(params.resultMode);
        if(false===tmpInt || tmpInt<0 || tmpInt>2){
            params.resultMode=defaultParams.resultMode
        }
    }

    //只有当mode为0（产生captcha文件），才要设置超时timer
    if(0===params.resultMode){
        if(undefined===params.expireDuration){
            params.expireDuration=defaultParams.expireDuration
        }else{
            tmpInt=convertToInt(params.expireDuration);
            if(false===tmpInt || tmpInt<0 || tmpInt>60){
                params.expireDuration=defaultParams.expireDuration
            }
        }
    }

    if (undefined===params.fontRandom || typeof(params.fontRandom)!='boolean') {params.fontRandom=defaultParams.fontRandom}
    if (undefined===params.fontType || validFontType.indexOf(params.fontType)===-1) {params.fontType=defaultParams.fontType;}
    if (undefined===params.fontWeight || validFontWeight.indexOf(params.fontWeight)===-1){params.fontWeight=defaultParams.fontWeight;}
    if (undefined===params.fontFamily || validFontFamily.indexOf(params.fontFamily)===-1) { params.fontFamily=defaultParams.fontFamily;}
    if (undefined===params.fontSize) {
        params.fontSize=defaultParams.fontSize;
    }else{
        tmpInt=convertToInt(params.fontSize);
        if(false===tmpInt || tmpInt<16 || tmpInt>32){
            params.fontSize=defaultParams.fontSize;;
        }
    }

    if (undefined===params.shadow || typeof(params.shadow)!='boolean'){params.shadow=defaultParams.shadow;}


    if (undefined===params.size  ){
        params.size=defaultParams.size
    }else{
        tmpInt=convertToInt(params.size);
        if(false===tmpInt || tmpInt<2 || tmpInt>6){
            params.size=defaultParams.size
        }
    }

    if (undefined===params.inclineFactor ) {
        params.inclineFactor =defaultParams.inclineFactor;
    }else{
        tmpFloat=convertToFloat(params.inclineFactor);
        if(false==tmpFloat || tmpFloat<0 || tmpFloat>1 ) {
            params.inclineFactor = defaultParams.inclineFactor;
        }
    }

}


var captcha=function(params,callback){
    generateMandatoryParams(params)

    //根据必须参数计算其他参数
    var realCharacterWidth=Math.ceil(params.fontSize*0.5*(1+params.inclineFactor));
    var realCharacterHeight=Math.ceil(params.fontSize*0.7*(1+params.inclineFactor));
    
    var horizontalPadding=realCharacterWidth; //px, captcha padding in horizontal, may change later
    var verticalPadding=Math.round(realCharacterHeight/4);  //px, captcha padding in vertical, may change later
    
    var characterSpacing=0//Math.round(realCharacterWidth/4); //ps, the spacing between current char and next char, this is a constant
    
    var color=["rgb(255,165,0)","rgb(16,78,139)","rgb(0,139,0)","rgb(255,0,0)"];
    var bgColor='rgb(255,255,255)';
    var borderColor='rgb(153, 102, 102)';

    var tmpInt
    var neededWidth=(2*horizontalPadding)+(params.size*realCharacterWidth)+(params.size-1)*characterSpacing;
   tmpInt=convertToInt(params.width);
    if (!params.hasOwnProperty('width')  ){
        params.width=80;
    }else{
        if(false===tmpInt || tmpInt<neededWidth){
            params.width=neededWidth;
        }else{
            params.width=tmpInt;
        }
    }
    horizontalPadding=Math.round((params.width-params.size*realCharacterWidth-(params.size-1)*characterSpacing)/2);


    var neededHeight=2*verticalPadding+realCharacterHeight;
    tmpInt=convertToInt(params.height);
    if (!params.hasOwnProperty('height')){
        params.height=32;
    }else{
        if(false===tmpInt || tmpInt<neededHeight){
            params.height=neededHeight;
        }else{
            params.height=tmpInt;
        }
    }
    verticalPadding=Math.round((params.height-realCharacterHeight)/2);


    /*************************************************************/
    /**************   start to generate captcha  ****************/
    /*************************************************************/
    var canvas = new Canvas(params.width, params.height);
    var ctx = canvas.getContext('2d');

    /*  fill pic background color*/
    ctx.fillStyle =bgColor;
    ctx.fillRect(0, 0, params.width, params.height);
    /*  gen pic border*/
    ctx.fillStyle = borderColor;
    ctx.lineWidth=1;
    ctx.strokeRect(0,0,params.width,params.height);

    /*  check shadow flag*/
    if(params.shadow){
        var shadowIdx=Math.round(Math.random()*(color.length-1));
        ctx.shadowColor=color[shadowIdx];
        ctx.shadowOffsetX=1;
        ctx.shadowOffsetY=1;
        ctx.shadowBlur=3;
    }
    /*  start gen captcha   */
    var genText='';

    //to calculate the spacing between 2 character, the i should start from 1 instead 0, thus i-1=0 for 1st character
    //for (var i= 1;i<=params.size;i++){
    //    //wrote a curve for each single character
    //    ctx.lineWidth=2;
    //    //ctx.beginPath();
    //    var startX=2*horizontalPadding+(i-1)*characterSpacing+(i-1)*params.fontSize;
    //    var startY=verticalPadding;
    //    ctx.moveTo(startX,Math.random()*params.fontSize+startY);
    //    ctx.bezierCurveTo(startX+Math.random()*params.fontSize, startY+Math.random()*params.fontSize,startX+Math.random()*params.fontSize, startY+Math.random()*params.fontSize,startX+params.fontSize/2, startY+Math.random()*params.fontSize/2);
    //    //ctx.closePath();
    //    ctx.stroke();
    //}
    //gen curve which cross all character
    ctx.lineWidth=1;
    ctx.moveTo(horizontalPadding,verticalPadding+Math.random()*realCharacterHeight);
    var randomControlX1=horizontalPadding+Math.random()*(params.width-2*horizontalPadding);
    var randomControlY2=verticalPadding+Math.random()*(realCharacterHeight/2);
    var randomControlX2=horizontalPadding+Math.random()*(params.width-2*horizontalPadding);
    var randomControlY1=verticalPadding+realCharacterHeight/2+Math.random()*(realCharacterHeight/2);
    var randomControlY3=verticalPadding+parseInt(realCharacterHeight*Math.random())
    ctx.bezierCurveTo(randomControlX1,randomControlY1,randomControlX2,randomControlY2,params.width-horizontalPadding, randomControlY3);
    ctx.stroke();


    for (var i=1;i<=params.size;i++)
    {
        singleChar= validString.substr(parseInt(Math.random()*36,10),1);

        //console.log(ctx.font)
        //tranform character
        ctx.setTransform(1,Math.random()*params.inclineFactor,Math.random()*params.inclineFactor,1,horizontalPadding+(i-1)*characterSpacing+(i-1)*realCharacterWidth,Math.ceil(params.fontSize*0.7)+verticalPadding );//for axis y, the start still be fontSize*0.7 instead of fontSize*0.7*(1+inclineFactor), thus the character can show in vertical center
        ctx.lineWidth=1;

        if(params.fontRandom){
            genRandomFontSetting(params);
        }
        //ctx.font=params.fontType+' normal '+params.fontWeight+' '+params.fontSize.toString()+'px '+params.fontFamily;//there is an issue of node-canvas:it not accept font-weight, if set, font will be default 10px sans-serif
        ctx.font=params.fontType+' '+params.fontSize.toString()+'px '+params.fontFamily;
        //console.log(ctx.font)

        var charIdx=parseInt(Math.random()*color.length);
        ctx.fillStyle = color[charIdx];
        var textStroke=(Math.random() > 0.5);
        if(textStroke){
            //ctx.strokeText(singleChar,horizontalPadding+(i-1)*characterSpacing+(i-1)*params.fontSize,params.height-verticalPadding)
            ctx.strokeText(singleChar,0,0);
        }else
        {
            //ctx.fillText(singleChar,horizontalPadding+(i-1)*characterSpacing+(i-1)*params.fontSize,params.height-verticalPadding)
            ctx.fillText(singleChar,0,0);
        }
        genText+=singleChar;
    }

    /*  get captcha result*/

    if (1 == params.resultMode) {
        var fs = require('fs');
        if( !params.hasOwnProperty('saveDir') || !fs.existsSync(params.saveDir)){
            //console.log(captchaImgPath)
            captchaImgPath.forEach(function(e){
                if(true===fs.existsSync(e)){
                    params.saveDir=e
                }
            })
        }else{
            params.saveDir=captchaImgPath[0]//默认使用第一个元素
        }

        var fileName = new Date().getTime() + Math.floor(Math.random()*1000) +'.png';
        //var absFileName=params.saveDir  +"/"+ fileName;
        var out = fs.createWriteStream(params.saveDir  +"/"+ fileName);
        var stream = canvas.pngStream();

        stream.on('data', function(chunk){
            out.write(chunk);
        });

        stream.on('end', function(){
            //console.log('end')
            //手工清除超时文件
            return callback(null,genText, fileName,params.saveDir)//新增一个返回值：captcha的保存路径

        });
        stream.on('error', function(){
            //console.log('save png failed');
            throw new Error('save png failed');
        });        
    }
    else if (2 == params.resultMode) {
        canvas.toBuffer(function(err, buf) {
            return callback(genText, buf);
        });
    }
    else {
        canvas.toDataURL('image/png', function(err, data){
            if(err){
                console.log(err)
                return callback(err,runtimeNodeError.user.genCaptchaDataUrlFail)
            }

            return callback(null,{rc:0,msg:{text:genText,data:data}});
        });
    };
}




exports.captcha={
    captcha:captcha
    //removeExpireFile:removeExpireFile
};
