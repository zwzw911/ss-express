var Canvas = require('canvas');

var defaultParams={
    resultMode:0,   //0:DataURL; 1:filepath; 2: buffer
    saveDir:__dirname,
    //character setting

        fontRandom:false,
        fontType:'normal',
        fontWeight:'normal',
        fontSize:14,
        fontFamily:'serfi',

//character number
    size:14,
    //img setting, in px
    width: 80,
    height:30
};

/*  pre defined setting */
var validString='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var validFontType=['normal','italic'];
var validFontWeight=[100,200,300,400,500,600,700,800,800,'normal','bold','bolder','lighter']
var validFontSize=[11,12,13,14,15,16,17]			// in px
var validFontFamily=['serif','sans-serif','monospace','cursive','fantasy']


/*  get random element from pre defined font array  */
var genRandomEle=function(array){
    var length=array.length();
    var randomIdx=parseInt(Math.random()*length);
    return array[randomIdx];
};

/*  gen random character font setting*/
var genFontSetting=function(params){
    if(params.fontRandom===true)
    {
        params.fontType=genRandomEle(validFontType);
        params.fontWeight=genRandomEle(validFontWeight);
        //params.fontSize=genRandomEle(validFontSize);	//font should be constant to define the width
        params.fontFamily=genRandomEle(validFontFamily);
    }

    return params.fontType+' '+params.fontWeight+' '+params.fontSize+'px '+params.fontFamily
};


var captcha=function(params,callback){
    if(!params.hasOwnProperty('resultMode') || isNaN(parseInt(params.resultMode)) || params.resultMode<0 || params.resultMode>2){params.resultMode=1;}

    //font setting
    if (params.hasOwnProperty('fontRandom')===false || typeof(params.fontRandom)!=='Boolean') {params.fontRandom=false}
    if (params.hasOwnProperty('fontType')===false || validFontType.indexOf(params.fontType)===-1) {params.fontType='normal';}
    if (params.hasOwnProperty('fontWeight') || validFontWeight.indexOf(params.fontWeight)===-1){params.fontWeight='normal';}
    if (params.hasOwnProperty('fontSize') || validFontSize.indexOf(params.fontSize)===-1) { params.fontSize=16;}
    if (params.hasOwnProperty('fontFamily') || validFontFamily.indexOf(params.fontFamily)===-1) { params.fontFamily='serif';}


    var font=genFontSetting(params);

    //some predefined params, no need pass in
    var verticalPadding=5;  //px, captcha padding in vertical
    var horizontalPadding=10; //px, captcha padding in horizontal
    var characterSpacing=10; //ps, the spacing between current char and next char
    var bgColor=["rgb(255,165,0)","rgb(16,78,139)","rgb(0,139,0)","rgb(255,0,0)"];
    var color='rgb(255,255,255)';
    var borderColor='rgb(153, 102, 102)';
    var lineWidth=1;	//px


    //character number
    if (!params.hasOwnProperty('size')){
        if( isNaN(parseInt(params.size,10)) || params.size<2 || params.size>6){params.size=4}
    }

    //img setting, in px
    if (!params.hasOwnProperty('height')){
        if(isNaN(parseInt(params.height,10))){params.height=30}
    }

    var neededWidth=2*horizontalPadding+params.size*params.fontSize+(params.size-1)*characterSpacing;
    if (!params.hasOwnProperty('width')){
        if(isNaN(parseInt(params.width,10)) || params.width<neededWidth){params.width=neededWidth}
        //re calcaulte padding
        if(params.width>neededWidth){
            horizontalPadding=Math.round((params.width-params.size*params.fontSize+(params.size-1)*characterSpacing)/2);
        }
    }
    var neededHeight=2*verticalPadding+params.fontSize;
    if (params.hasOwnProperty('height')){
        if(isNaN(parseInt(params.height,10)) || params.height<neededHeight){params.height=neededHeight;}
        if(params.height>neededHeight){
            verticalPadding=Math.round((params.height-params.fontSize)/2);
        }
    }

    var canvas = new Canvas(params.width, params.height);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle =bgColor[0];
    ctx.fillRect(0, 0, params.width, params.height);
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.font = font;


    /*  start gen captcha   */
    var genText='';
    for (var i=0;i<params.size;i++)
    {
        singleChar= validString.substr(parseInt(Math.random()*62),1);
        //ctx.transform(1,Math.random()*0.5,Math.random()*0.5,1,horizontalPadding+(i-1)*characterSpacing,verticalPadding);
        var textStroke=(Math.random() > 0.5);
        if(textStroke){
            ctx.strokeText(singleChar,horizontalPadding+(i-1)*characterSpacing+i*params.fontSize,verticalPadding)
            //ctx.strokeText(singleChar,0,0);
        }else
        {
            ctx.fillText(singleChar,horizontalPadding+(i-1)*characterSpacing+i*params.fontSize,verticalPadding)
            //ctx.fillText(singleChar,0,0);
        }
        genText+=singleChar;
    }

    /*  get captcha result*/

    if (1 == params.resultMode) {
        var fs = require('fs');
        if( !params.hasOwnProperty('saveDir') || !fs.existsSync(params.saveDir)){
            params.saveDir=__dirname;
        }
        var filename = new Date().getTime() + Math.floor(Math.random()*1000) +'.png';
        var out = fs.createWriteStream(params.saveDir  +"/"+ filename);
        var stream = canvas.pngStream();

        stream.on('data', function(chunk){
            out.write(chunk);
        });

        stream.on('end', function(){
            callback(genText, filename);
        });
    }
    else if (2 == params.resultMode) {
        canvas.toBuffer(function(err, buf) {
            callback(genText, buf);
        });
    }
    else {
        canvas.toDataURL('image/png', function(err, data){
            callback(genText, data);
        });
    };
}




exports.awesomeCaptcha=captcha;