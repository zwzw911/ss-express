/** Created by ada on 2015/6/13.
 */
var crypto=require('crypto');
var fs=require('fs');
 
var validHashType=['md5','sha1','sha256','sha512','ripemd160'];

var validCryptType=['blowfish','aes192'];
var hash=function(hashType,string){
    if (string.length>255){return false}

    if (validHashType.indexOf(hashType)===-1){
        hashType="md5";
    }

    var inst=crypto.createHash(hashType);
    inst.update(string);
    return inst.digest('hex');
}

//hash+crypt
var hmac=function(hashType,string){
    if (string.length>255){return false}

    if (validHashType.indexOf(hashType)===-1){
        hashType="md5";
    }
    var pemFilePath='../../../other/key/key.pem';//以当前目录为base
    var pem= fs.readFileSync(pemFilePath);
        //if (err) throw err;
        var key=pem.toString('ascii');
        //console.log(key);
        var inst=crypto.createHmac(hashType,key);
        inst.update(string);
        //console.log(inst.digest('hex'));
        return inst.digest('hex');
    ;

}

 var crypt=function(cryptType,string){
     if(validCryptType.indexOf(cryptType)===-1){
         cryptType='blowfish';
     }
     var pemFilePath='../../../other/key/key.pem';
     var pem=fs.readfile(pemFilePath,'r',function(err,data){
         if (err) throw err;
         var key=pem.toString('ascii');
         var inst=crypto.createCipher(cryptType,key);
         inst.update(string);
         return inst.final('hex');
     });

 }

 var decrypt=function(cryptType,string){
     if(validCryptType.indexOf(cryptType)===-1){
         cryptType='blowfish';
     }
     var pemFilePath='../../../other/key/key.pem';
     var pem=fs.readfile(pemFilePath,'r',function(err,data){
         if (err) throw err;
         var key=pem.toString('ascii');
         var inst=crypto.createDecipher(cryptType,key);
         inst.update(string);
         return inst.final('hex');
     });

 }

exports.hash=hash;
exports.hmac=hmac;