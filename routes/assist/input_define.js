/**
 * Created by ada on 2015/7/4.
 */
    /*
    * This define should consistent with client side define
    * */
var inputDefine={
    name:{required:true,minlength:2,maxlength:20},
    password:{required:true,minlength:2,maxlength:20},
    repassword:{required:true},
    mobilePhone:{required:false,minlength:11,maxlength:11}
}

exports.inputDefine=inputDefine;
