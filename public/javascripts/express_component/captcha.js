var Canvas = require('canvas');

var defaultParams={
    resultMode:0,   //0:DataURL; 1:filepath; 2: buffer
    saveDir:__dirname,
    //character setting

    fontRandom:true,
    fontSize:24,
    fontType:'normal',
    fontWeight:'normal',
    fontFamily:'serfi',

    shadow:true,

    size:4,//character number
    inclineFactor:0.5,

    //img setting, in px
    width: 80,
    height:30
};

/*  pre defined setting */
var validString='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';//these character has the same width and height, while abcdefghijklmnopqrstuvwxyz are hard to calc widht/height
var validFontType=['normal','italic'];
var validFontWeight=[100,200,300,400,500,600,700,800,800,'normal','bold','bolder','lighter']
//var validFontSize=[11,12,13,14,15,16,17]			// in px
var validFontFamily=['serif','sans-serif','monospace','cursive','fantasy']


/*  get random element from pre defined font array  */
var genRandomEle=function(array){
    var length=array.length();
    var randomIdx=parseInt(Math.random()*length);
    return array[randomIdx];
};

/*  gen random character font setting*/
var genRandomFontSetting=function(params){
    params.fontType=genRandomEle(validFontType);
    params.fontWeight=genRandomEle(validFontWeight);
    //params.fontSize=genRandomEle(validFontSize);	//font should be constant to define the width
    params.fontFamily=genRandomEle(validFontFamily);
    return params.fontType+' '+params.fontWeight+' '+params.fontSize+'px '+params.fontFamily
};


var captcha=function(params,callback){
    //if not set or set value not correct, use default value
    if(!params.hasOwnProperty('resultMode') || isNaN(parseInt(params.resultMode)) || params.resultMode<0 || params.resultMode>2){params.resultMode=1;}
    
    if (!params.hasOwnProperty('fontRandom') || typeof(params.fontRandom)!='boolean') {params.fontRandom=true}
    if (!params.hasOwnProperty('fontType') || validFontType.indexOf(params.fontType)===-1) {params.fontType='normal';}
    if (!params.hasOwnProperty('fontWeight') || validFontWeight.indexOf(params.fontWeight)===-1){params.fontWeight='normal';}
    if (!params.hasOwnProperty('fontSize') || isNaN(parseInt(params.fontSize))) { params.fontSize=24;}
    if (!params.hasOwnProperty('fontFamily') || validFontFamily.indexOf(params.fontFamily)===-1) { params.fontFamily='serif';}

    if (!params.hasOwnProperty('shadow') || typeof(params.shadow)!='bollean'){params.shadow=true;}

    if (!params.hasOwnProperty('size')){
        if( isNaN(parseInt(params.size,10)) || params.size<2 || params.size>6){params.size=4}
    }
    if (!params.hasOwnProperty('inclineFactor')){
        if( isNaN(parseFloat(params.inclineFactor,10)) || params.inclineFactor<0 || params.inclineFactor>1){params.inclineFactor=0.5}
    }    
    
    //some predefined params,based on font size.
    var realCharacterWidth=Math.ceil(params.fontSize*0.5*(1+params.inclineFactor));
    var realCharacterHeight=Math.ceil(params.fontSize*0.7*(1+params.inclineFactor));
    
    var horizontalPadding=realCharacterWidth; //px, captcha padding in horizontal, may change later
    var verticalPadding=Math.round(realCharacterHeight/2);  //px, captcha padding in vertical, may change later
    
    var characterSpacing=Math.round(realCharacterWidth/2); //ps, the spacing between current char and next char, this is a constant
    
    var color=["rgb(255,165,0)","rgb(16,78,139)","rgb(0,139,0)","rgb(255,0,0)"];
    var bgColor='rgb(255,255,255)';
    var borderColor='rgb(153, 102, 102)';

    //img setting, in px
    if (!params.hasOwnProperty('height')){
        if(isNaN(parseInt(params.height,10)) || params.heigh<2*verticalPadding+params.fontSize){params.height=2*verticalPadding+params.fontSize}
    }

    var neededWidth=(2*horizontalPadding)+(params.size*realCharacterWidth)+(params.size-1)*characterSpacing;
    //console.log(neededWidth);
    if (!params.hasOwnProperty('width')){
        params.width=neededWidth;
    }else{
        if(isNaN(parseInt(params.width,10)) || params.width<neededWidth){params.width=neededWidth}
    }
    //re calcaulte padding
    //if(params.width!=neededWidth){
        horizontalPadding=Math.round((params.width-params.size*realCharacterWidth-(params.size-1)*characterSpacing)/2);
    //}
//console.log(params);
//
//    console.log(horizontalPadding);
//    return

    var neededHeight=2*verticalPadding+realCharacterHeight;
    if (!params.hasOwnProperty('height')){
        params.height=neededHeight;
    }else{
        if(isNaN(parseInt(params.height,10)) || params.height<neededHeight){params.height=neededHeight;}
    }
    //if(params.height!=neededHeight){
        verticalPadding=Math.round((params.height-realCharacterHeight)/2);
    //}


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
        ctx.shadowColor=color[0];
        ctx.shadowOffsetX=1;
        ctx.shadowOffsetY=1;
        ctx.shadowBlur=5;
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
    ctx.lineWidth=2;
    ctx.moveTo(horizontalPadding,verticalPadding+Math.random()*realCharacterHeight);
    var randomControlX1=horizontalPadding+Math.random()*(params.width-2*horizontalPadding);
    var randomControlY1=Math.random()*params.height;
    var randomControlX2=horizontalPadding+Math.random()*(params.width-2*horizontalPadding);
    var randomControlY2=Math.random()*params.height;
    var randomControlY3=verticalPadding+verticalPadding+Math.random()*realCharacterHeight;
    ctx.bezierCurveTo(randomControlX1,randomControlY1,randomControlX2,randomControlY2,params.width-horizontalPadding, randomControlY3);
    ctx.stroke();
    
    
    ctx.font=params.fontType+' '+params.fontWeight+' '+params.fontSize+'px '+params.fontFamily;
    for (var i=1;i<=params.size;i++)
    {
        singleChar= validString.substr(parseInt(Math.random()*36,10),1);
        if(params.fontRandom===true){
            ctx.font=genRandomFontSetting(params);
        }
        //tranform character
        ctx.setTransform(1,Math.random()*inclineFactor,Math.random()*inclineFactor,1,horizontalPadding+(1-1)*characterSpacing+(i-1)*realCharacterWidth, params.height-verticalPadding);
        ctx.lineWidth=1;
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
