/**
 * Created by ada on 2015/6/13.
 */
var crypto=require('crypto');
var fs=require('fs');

var hash=function(hashType,string){
    var validType=['md5','sha1','sha256','sha512','ripemd160','hamc'];
    if (validType.indexOf(hashType)===-1){
        hashType="md5";
    }

    var inst=crypto.createHash(hashType);
    inst.update(string);
    return inst.digest('hex');
}

//hash+crypt
var hamc=function(hashType,string){
    var validType=['md5','sha1','sha256','sha512','ripemd160','hamc'];
    if (validType.indexOf(hashType)===-1){
        hashType="md5";
    }
    var pemFilePath='../../../other/key/key.pem';
    var pem=fs.readfile(pemFilePath,'r',function(err,data){
        if (err) throw err;
        var key=pem.toString('ascii');
    });
    var inst=crypto.createHamc(hashType,key);
    inst.update(string);
    return inst.digest('hex');
}