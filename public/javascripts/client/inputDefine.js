/**
 * Created by zw on 2015/9/19.
 */
var inputDefineApp=angular.module('inputDefineApp',[]);

//inputDefine.config(function(){
//    var define={
//        a:1
//    }
//})

inputDefineApp.constant('inputDefine',{
    user:{
        name: {
            require: {define: true, msg: '用户名必须存在'},
            type: {define: /^[\u4E00-\u9FFF\w]{2,20}$/, msg: '用户名由2-20个字符组成'}
        },
        password:{
            require: {define: true, msg: '密码必须存在'},
            type: {define: /^[A-Za-z0-9\~\\!\@\#\$\%\^\&\*\)\(\_\+\=\-\`\}\{\:\"\|\?\>\<\,\./;'\\\[\]]{2,20}$/, msg: '密码由字母,数字,特殊字符组成,长度2-20个字符'}
        },
        rePassword:{
            equal:{define:undefined,msg:'两次输入的密码必须一致'}
        },
        mobilePhone:{
            require: {define: false},
            type: {define:/^\d{11,13}$/, msg: '手机号由11-13个数字组成'}
        },
        captcha:{
            require:{define:true,msg:'验证码不能为空'},
            type:{define:/^[a-zA-Z0-9]{4}$/,msg:'验证码为4位字符'}
        }
    },
    article:{
        hashId:{define:/^[0-9a-f]{40}$/,msg:'文档编号不正确'}
    },
    search:{
        format:{define:undefined,msg:'搜索字符的格式不正确，请重新输入'},
        missSearchKey:{define:undefined,msg:'搜索字符串为空，请重新输入'},
        searchTotalKeyLen:{define:20,msg:'搜索字符串最多包含20个字符'}
    },
    uploadDefine:{
        maxSize:{define:100*1024*1024,msg:'文件最大为5M'},
        fileNameLength:{define:100,msg:"文件名最多包含100个字符"},
        validSuffix:{define:['exe','txt','pdf','zip','png'],msg:'文件类型不支持'},
        minUploadNum:{define:1,msg:'上传文件不能为空'}
    },
    mimes: {'hqx':['application/mac-binhex40'],
        'cpt':['application/mac-compactpro'],
        'csv':['text/x-comma-separated-values', 'text/comma-separated-values', 'application/octet-stream', 'application/vnd.ms-excel', 'application/x-csv', 'text/x-csv', 'text/csv', 'application/csv', 'application/excel', 'application/vnd.msexcel'],
        'bin':['application/macbinary'],
        'dms':['application/octet-stream'],
        'lha':['application/octet-stream'],
        'lzh':['application/octet-stream'],
        'exe':['application/octet-stream', 'application/x-msdownload'],
        'class':['application/octet-stream'],
        'psd':['application/x-photoshop'],
        'so':['application/octet-stream'],
        'sea':['application/octet-stream'],
        'dll':['application/octet-stream'],
        'oda':['application/oda'],
        'pdf':['application/pdf', 'application/x-download'],
        'ai':['application/postscript'],
        'eps':['application/postscript'],
        'ps':['application/postscript'],
        'smi':['application/smil'],
        'smil':['application/smil'],
        'mif':['application/vnd.mif'],
        'wbxml':['application/wbxml'],
        'wmlc':['application/wmlc'],
        'dcr':['application/x-director'],
        'dir':['application/x-director'],
        'dxr':['application/x-director'],
        'dvi':['application/x-dvi'],
        'gtar':['application/x-gtar'],
        'gz':['application/x-gzip'],
        'php':['application/x-httpd-php'],
        'php4':['application/x-httpd-php'],
        'php3':['application/x-httpd-php'],
        'phtml':['application/x-httpd-php'],
        'phps':['application/x-httpd-php-source'],
        'js':['application/x-javascript'],
        'swf':['application/x-shockwave-flash'],
        'sit':['application/x-stuffit'],
        'tar':['application/x-tar'],
        'tgz':['application/x-tar', 'application/x-gzip-compressed'],
        'xhtml':['application/xhtml+xml'],
        'xht':['application/xhtml+xml'],
        'zip':  ['application/x-zip', 'application/zip', 'application/x-zip-compressed'],
        'mid':['audio/midi'],
        'midi':['audio/midi'],
        'mpga':['audio/mpeg'],
        'mp2':['audio/mpeg'],
        'mp3':['audio/mpeg', 'audio/mpg', 'audio/mpeg3', 'audio/mp3'],
        'aif':['audio/x-aiff'],
        'aiff':['audio/x-aiff'],
        'aifc':['audio/x-aiff'],
        'ram':['audio/x-pn-realaudio'],
        'rm':['audio/x-pn-realaudio'],
        'rpm':['audio/x-pn-realaudio-plugin'],
        'ra':['audio/x-realaudio'],
        'rv':['video/vnd.rn-realvideo'],
        'wav':['audio/x-wav', 'audio/wave', 'audio/wav'],
        'bmp':['image/bmp', 'image/x-windows-bmp'],
        'gif':['image/gif'],
        'jpeg':['image/jpg', 'image/jpe', 'image/jpeg', 'image/pjpeg'],
        'jpg':['image/jpg', 'image/jpe', 'image/jpeg', 'image/pjpeg'],
        'jpe':['image/jpg', 'image/jpe', 'image/jpeg', 'image/pjpeg'],
        'png':['image/png',  'image/x-png'],
        'tiff':['image/tiff'],
        'tif':['image/tiff'],
        'css':['text/css'],
        'html':['text/html'],
        'htm':['text/html'],
        'shtml':['text/html'],
        'txt':['text/plain'],
        'text':['text/plain'],
        'log':['text/plain', 'text/x-log'],
        'rtx':['text/richtext'],
        'rtf':['text/rtf'],
        'xml':['text/xml'],
        'xsl':['text/xml'],
        'mpeg':['video/mpeg'],
        'mpg':['video/mpeg'],
        'mpe':['video/mpeg'],
        'qt':['video/quicktime'],
        'mov':['video/quicktime'],
        'avi':['video/x-msvideo'],
        'movie':['video/x-sgi-movie'],
        'doc':['application/msword'],
        'docx':['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'],
        'xlsx':['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'],
        'word':['application/msword', 'application/octet-stream'],
        'xls':['application/excel', 'application/vnd.ms-excel', 'application/msexcel'],
        'ppt':['application/powerpoint', 'application/vnd.ms-powerpoint'],
        'eml':['message/rfc822'],
        'json' : ['application/json', 'text/json'],
        'msg':['application/vnd.ms-outlook','text/plain'],
        'tc':['text/html','text/plain']
    }

})


