/**
 * Created by zw on 2015/10/5.
 * 用来执行一些定时任务：例如删除captcha文件等
 */

var later = require("later");
var cron = later.parse.cron('*/1 * * * *');

var occurrences = later.schedule(cron)
/*for(var i = 0; i < occurrences.length; i++) {
    console.log(occurrences[i]);
}*/
var logTime=function(){
    console.log(Date())
}
var timer2 = later.setInterval(logTime, cron);