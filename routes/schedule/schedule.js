/**
 * Created by zw on 2015/10/5.
 * 用来执行一些定时任务：例如删除captcha文件等
 */

var later = require("later");
var cron = later.parse.cron('*/1 * * * *');
var fs = require("fs");
var general = require('../assist/general').general;
var occurrences = later.schedule(cron)
/*for(var i = 0; i < occurrences.length; i++) {
    console.log(occurrences[i]);
}*/
var logTime=function(){
    console.log(Date())
	var path=general.captchaImg_path;
	var currentTime=new Date().getTime();
	var tmpFile,stat,validPath;
	for(var i= 0,len=path.length;i<len;i++){
		if(true===fs.existsSync(path[i])){
			validPath=path[i];
			break;
		}

	}


	fs.readdir(validPath,function(err,files){
		if(files.length>0){
			files.forEach(function(file){
				tmpFile=file.split('.');
				if(isNaN(parseInt(tmpFile[0])) || (currentTime-parseInt(tmpFile[0]))>general.captchaExpire){
					fs.unlink(validPath+'/'+file,function(err){
						//console.log('delete done')
					})
				}

			})
		}
	})

}
var timer2 = later.setInterval(logTime, cron);