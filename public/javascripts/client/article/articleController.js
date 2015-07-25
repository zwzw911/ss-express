/**
 * Created by wzhan039 on 2015-07-08.
 */
var app=angular.module('app',['ngFileUpload']);
app.factory('articleService',function($http){
    //var validateUploadFile=function(fileSize){
    //    return $http.post('/validateUploadFile',{size:fileSize},{});
    //}

    var preCheckUploadFiles=function(fileListObject){
        return $http.post('article/uploadPreCheck',{file:fileListObject},{});
    }
    var saveContent=function(pureConent,htmlContent){
        return $http.post('article/saveContent',{pureContent:pureConent,htmlContent:htmlContent},{});
    }
    //return {checkUser:checkUser,login:login};
    return {preCheckUploadFiles:preCheckUploadFiles,saveContent:saveContent};
})
app.controller('ArticleController',function($scope,Upload,articleService){

    $scope.btn={
        edit:{disabled:false,name:'edit'},
        cancel:{disabled:true,name:'cancel'},
        save:{disabled:true,name:'save'}
        };

/*    $scope.articleDefine={
        title:{required:true,maxLength:5},
        key:{required:false,maxLength:100},
        pureContent:{required:false,maxLength:8000},
        htmlContent:{required:false,maxLength:12000},
        innerImage:{maxLength:5},
        attachment:{maxLength:5}
    };*/

    $scope.article={
        editFlag:null,
        title:{value:'test',leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'adfaf',errorClass:'',define:{required:true,maxLength:255}},
        keys:{
            content:[{value:'key1',leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',errorClass:''},
            {value:'key2',leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',errorClass:''}],
            define:{required:false,maxLength:100}
    },
        pureContent:{value:'asdf',leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',errorClass:'',define:{required:false,maxLength:8000}},
        htmlContent:{value:'asdf',leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',define:{required:false,maxLength:12000}},
        innerImage:{value:[],leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',define:{required:false,maxLength:5}},
        attachment:{value:[],leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',define:{required:false,maxLength:5}},
        newComment:{value:'',leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:''},
        comments:[{author:'a',content:'asdf',date:'2015-12-12 12:12;12'}]
    };


    $scope.btnClick= function (clickBtn) {
        if('edit'===clickBtn.name){
            $scope.btn.edit.disabled=true;
            $scope.btn.cancel.disabled=false;
            $scope.btn.save.disabled=false;

            $scope.article.editFlag=!$scope.article.editFlag;
        }

        if('cancel'===clickBtn.name || 'save'===clickBtn.name){
            $scope.btn.edit.disabled=false;
            $scope.btn.cancel.disabled=true;
            $scope.btn.save.disabled=true;

            $scope.article.editFlag=!$scope.article.editFlag;
        }
    };

    $scope.calcLeftNum=function(item,idx){//idx just for key

        var total=$scope.article[item].define.maxLength;
        if('keys'===item) {
            var data = $scope.article[item]['content'][idx];
        }else{
            var data = $scope.article[item];
        }
        //init status
        data.errorFlag=false;
        data.errorMsg='';
        data.leftNumFlag=false;
        data.errorClass='';

        var str=data.value;
        var currentLength=str.length;
        if($scope.article[item].define.required && 0===currentLength){
            data.leftNumFlag=false;//一次显示一种错误（required优先级高）
            data.errorFlag=true;
            data.errorMsg='不能为空';
            data.errorClass='has-error';
        }

        if((total-currentLength)>=0){
            data.leftNum=(total-currentLength);
        }else{
            data.leftNum=0;
            data.value=str.substring(0,total);
        }


       data.leftNumFlag=true;
    };

    /*
     * rich editor4
     * */

    UE.getEditor('container').ready(function() {
        //var ue = UE.getEditor('container');
        console.log(UE.isServerConfigLoaded )
    } )
    $scope.saveContent=function(){
        var pureContent=ue.getContentTxt();
        var htmlContent=ue.getContent();
        var service=articleService.saveContent(pureContent,htmlContent);
        service.success(function(data,status,header,config) {

        }).error(function(data,status,header,config){

        })
    }

    /*
     * attachment
     * */
    $scope.attachment=[
        {name:'test.png',hashName:'d86cbf3f5c5d5c43f30d26b4ad18a8df256dee18.png',size:212500}
    ]
    var formatAttachment=function(){
        if(undefined===$scope.attachment || 0===$scope.attachment.length){
//console.log('null')
            return;
        };
        //console.log('start')
        var suffix='fa -fa-file-o';
        var image=['jpeg','jpg','png','gif','bmp'];
        var text=['txt','log','html']
        var msDoc=['doc','docx']
        var msExcel=['xls','xlsx']
        var msPoint=['ppt','pptx','pps']
        var video=['avi']
        var zip=['zip','tar']
        for(var i=0;i<$scope.attachment.length;i++){
            var attachment=$scope.attachment[i]
            suffix=attachment.name.split('.').pop();
            if(-11!=image.indexOf(suffix)){
                attachment.icon='fa fa-file-image-o'
            }
            if(-1!=text.indexOf(suffix)){
                attachment.icon='fa fa-file-text-o'
            }
            if(-1!=msDoc.indexOf(suffix)){
                attachment.icon='fa fa-file-word-o'
            }
            if(-1!=msExcel.indexOf(suffix)){
                attachment.icon='fa fa-file-excel-o'
            }
            if(-1!=msPoint.indexOf(suffix)){
                attachment.icon='fa fa-file-powerpoint-o'
            }
            if(-1!=video.indexOf(suffix)){
                attachment.icon='fa fa-file-video-o'
            }
            if(-1!=zip.indexOf(suffix)){
                attachment.icon='fa fa-file-zip-o'
            }

            attachment.size=(attachment.size/1024/1024).toFixed(2)+'M';
        }
        //console.log($scope.attachment)
    }
    formatAttachment();
    /*
     * data for upload file
     *
     * file.name(ng-upload-file,)
      * file.size(ng-upload-file, in byte)
      * file.roughSize(controller, ii MB)
      * file.status(controller, 0:not start, 1: uploading, 2:upload done  3: upload stop  4 upload failed
     * */

    //$scope.files={};
    $scope.filesList=[];
    $scope.uploadDefine={maxSize:{define:100*1024*1024,msg:'文件最大为5M'},
        fileNameLength:{define:100,msg:"文件名最多包含100个字符"},
        validSuffix:{define:['exe','txt','pdf','zip','png'],msg:'文件类型不支持'},
        minUploadNum:{define:1,msg:'上传文件不能为空'}
    } //same define in /routes/assist/upload_define.js
    var mimes = {'hqx':['application/mac-binhex40'],
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
    };

    $scope.uploadStatusConfig={0:{css:'text-muted',msg:'准备上传'},1:{css:'text-info',msg:"上传中"},2:{css:'text-success',msg:'上传完毕'},3:{css:'text-danger',msg:'停止上传'},4:{css:'text-danger',msg:'上传失败'}}//4 还需要显示具体错误

    var setInitState=function(file){
        file.status=0;//undefined means new added file
        file.roughSize = (file.size / 1024 / 1024).toFixed(2);
        file.uploadPercentage=0;
        file.loadedSize=0;
        file.errorFlag=false;
        file.errorMsg='';
        file.progressBarClass='';
    }
    var setUploadingState=function(file){
        file.status=1;//uploading
        file.errorFlag=false;
        file.errorMsg='';
        file.progressBarClass='progress-bar-striped progress-bar-info active';
    }
    var setUploadedState=function(file){
        file.status=2;//upload done
        file.errorFlag=false;
        file.errorMsg='';
        file.progressBarClass='progress-bar-success';
    }
    var setUploadStopState=function(file){
        file.status=3;//upload stop
        file.errorFlag=false;
        file.errorMsg='';
        file.progressBarClass='progress-bar-warning';
    }
    var setUploadFailState=function(file,failMsg){
        file.status=4;//upload failed
        file.errorFlag=true;
        file.errorMsg=failMsg;
        file.progressBarClass='progress-bar-danger';
    }

    var genServerFileList=function(fileList){
        var serverFileList=[];
        if(fileList && fileList.length>0){
            for(var i=0;i<fileList.length;i++){
                var file=fileList[i];
                var tmp={originalFilename:file.name,headers:{'content-type':file.type},size:file.size}
                serverFileList.push(tmp)
            }
        }
        return serverFileList;
    }

    $scope.$watch('files', function (files) {
/*        lastModified        1416830046001
        lastModifiedDate        Date {Mon Nov 24 2014 19:54:06 GMT+0800}
        name        "SPlayerSetup.exe"
        size        8261416
        type        "application/octet-stream"*/
        if(undefined!=$scope.files &&  $scope.files.length>0 ) {
            for (var i = 0; i < files.length; i++) {
                var file=files[i];
                if(undefined===file.status){//undefined means new added file
                    //console.log(file.name.length);
                    setInitState(file);
                    if($scope.uploadDefine.maxSize.define<file.size){
                        setUploadFailState(file,$scope.uploadDefine.maxSize.msg)

                    }
                    if($scope.uploadDefine.fileNameLength.define< file.name.length ){
                        setUploadFailState(file,$scope.uploadDefine.fileNameLength.msg);

                    }
                    var tmp=file.name.split('.');

                    if(tmp.length<2){
                        setUploadFailState(file, $scope.uploadDefine.validSuffix.msg)
                    }else{
                        var suffix=tmp.pop();
                        if( 0===suffix.length || -1===$scope.uploadDefine.validSuffix.define.indexOf(suffix) || -1===mimes[suffix].indexOf(file.type)) {

                            setUploadFailState(file, $scope.uploadDefine.validSuffix.msg)
                        }
                    }

                    $scope.filesList.push(file);//this push a object(files is a array) even file is not valid, so that related msg can be show in table

                    var service=articleService.preCheckUploadFiles(genServerFileList($scope.filesList))//upload info with the familiar format as multiparty
                    service.success(function(data,status,header,config) {
                        if(0===data.rc){
                            for(var i= 0;i<$scope.filesList.length;i++){
                                if(data.data[i].msg){
                                    setUploadFailState($scope.filesList[i],data.data[i].msg)
                                }
                            }
                        }

                    }).error(function(data,status,header,config){

                    })
                }
            }

            //$scope.upload($scope.filesList);
        }
//console.log($scope.filesList)
    });


//console.log(!$scope.btn.edit.disabled && ($scope.files.length>0));
    $scope.upload = function (files) {
        if (files && files.length) {
//console.log(files)
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if(0!=file.status && 3!=file.status){continue}//skip uploaded/uploading file
                Upload.upload({
                    url: 'article/upload',
                    fields: {'username': $scope.username},
                    file: file
                }).progress(function (evt) {
                    evt.config.file.status=1;
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    evt.config.file.uploadPercentage=progressPercentage;
                    evt.config.file.loadedSize=(evt.loaded/1024/1024).toFixed(2);
                }).success(function (data, status, headers, config) {
                    if(0===data.rc){
                        //config.file.status=2;
                        setUploadedState(config.file);
                    }else{
                        setUploadFailState(config.file,data.msg)
                    }
                }).error(function (data, status, headers, config) {
                    config.file.status=4;
                    setUploadFailState(config.file,data.msg)
                    console.log('error status: ' + status);
                })
            }
        }
    };
    $scope.removeUploadFile=function(idx){
        $scope.filesList.splice(idx,1);
    }

/*    $scope.downloadFile=function(){
        var service=articleService.downloadFile()
        service.success(function(data,status,header,config) {


        }).error(function(data,status,header,config){

        })
    }*/
})
