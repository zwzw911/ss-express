var general=require("../assist/general.js").general,pattern={testSingleSpecialChar:/^[A-Za-z0-9\~\\!\@\#\$\%\^\&\*\)\(\_\+\=\-\`\}\{\:\"\|\?\>\<\,\./;'\\\[\]]$/,getHosts:/(https?:\/\/[-\w.]+(:\d{1,5})?)(\/([\w_.]*)?)?/g,testHost:/(https?:\/\/[-\w.]+(:\d{1,5})?)(\/([\w_.]*)?)?/,getImg:/<img.*?>/g,getImgSrc:/<img.+src="([0-9a-f]{40}\.(png|jpeg|jpg|gif))".*\/?>/,testArticleHash:/^[0-9a-f]{40}$/},check=function(a,b){switch(b){case"testSingleSpecialChar":return pattern.testSingleSpecialChar.test(a);case"getHosts":return c=a.match(pattern.getHosts),null===c?!1:c;case"testHost":var c=a.match(pattern.testHost);return null===c?!1:c[1]===general.host;case"getImg":return c=a.match(pattern.getImg),null===c?!1:c;case"getImgSrc":return tmp=a.match(pattern.getImgSrc),null===tmp?!1:tmp[1];case"testArticleHash":return pattern.testArticleHash.test(a)}};exports.check=check;