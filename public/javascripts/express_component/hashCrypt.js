/**
 * Created by zw on 2015/6/13.
 */
var crypto=require('crypto');

var hashTo=function(type){
    var hashInst;
    var validType=['md5','sha1',''];
    if (type)
    switch (type){
        case "md5":hashInst=crypto(type);break;
        case
    }
}
