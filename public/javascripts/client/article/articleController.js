/**
 * Created by wzhan039 on 2015-07-08.
 */
/*UE.getEditor('container').ready(function() {
    var ue = UE.getEditor('container');
    console.log(UE.isServerConfigLoaded )

})*/


//开头定义，以便后面使用时已经加载完毕
var ue = UE.getEditor('container');
//
var searchString=window.location.search;
var id=searchString.split('=')[1]

ue.setOpt('serverUrl','article/save?articleID='+id);


var articleHash=/[0-9a-f]{40}/;
var formatLongDate=function(date){
    var reg=/T/g
    var reg1=/\.\d{3}Z/g
    return date.toString().replace(reg,' ').replace(reg1,' ');
}
var formatShortDate=function(date){
    var reg=/T.+/g
    //var reg1=/\.\d{3}Z/g
    return date.toString().replace(reg,' ');
}
var app=angular.module('app',['ngFileUpload']);
/*app.config(['$routeProvider',function($routeProvider){
    $routeProvider.when('/article',{controller:ArticleController,templateUrl: 'views/main_test.ejs'})
}])*/
app.factory('articleService',function($http){
    //var validateUploadFile=function(fileSize){
    //    return $http.post('/validateUploadFile',{size:fileSize},{});
    //}

    var preCheckUploadFiles=function(fileListObject){
        return $http.post('article/uploadPreCheck',{file:fileListObject},{});
    }
    var getData=function(articleHashId)
    {
        return $http.post('article',{articleHashId:articleHashId},{});
    }
    var saveContent=function(articleHashId,title,keys,pureConent,htmlContent){
        return $http.post('article/saveContent/'+articleHashId,{title:title,keys:keys,pureContent:pureConent,htmlContent:htmlContent},{});
    }
    var addComment=function(articleHashId,comment){
        return $http.post('article/addComment/'+articleHashId,{content:comment},{});
    }
    var readComment=function(articleHashID,curPage){
        return $http.post('article/readComment/'+articleHashID,{curPage:curPage},{});
    }
    //return {checkUser:checkUser,login:login};
    return {preCheckUploadFiles:preCheckUploadFiles,saveContent:saveContent,getData:getData,addComment:addComment,readComment:readComment};
})


app.controller('ArticleController',function($scope,$location,$window,Upload,articleService,$sce){
    var showErrMsg=function(msg){
        $scope.errorModal={state:'show',title:'错误',msg:msg,
            close:function(){
                this.state=''
            }
        }
    };

    var getArticleID=function(){
        var absURL=$location.absUrl();
        var articleID=absURL.split('=').pop()

        if(undefined===articleID || ''===articleID || !articleHash.test(articleID) ){//
            return false;
        }else{
            return articleID
        }
    }

    var readComment=function(data){
        var comment=[];
        if(data.msg.comment.length>0){
            var singleComment;
            for(var i=0;i<data.msg.comment.length;i++){
                singleComment={}
                singleComment.id=data.msg.comment[i].id;
                singleComment.content=data.msg.comment[i].content;
                singleComment.mDate=formatLongDate(data.msg.comment[i].mDate);
                //console.log(singleComment.mDate.toString().replace(reg,' ').replace(reg1,' '))
                if(undefined!=data.msg.comment[i].user){
                    singleComment.user=data.msg.comment[i].user;

                    //singleComment.user.mDate=formatShortDate(data.msg.comment[i].user.mDate)
                    singleComment.user.mDate=formatShortDate(singleComment.user.mDate)
                    singleComment.user.cDate=formatShortDate(singleComment.user.cDate)
                }

//console.log(singleComment)
                comment.push(singleComment)
            }
        }
        return comment
    }

    //从请求中，根据start/end范围，生成页码
    var generatePaginationRange=function(data){
        var start=data.msg.pagination.start;
        var end=data.msg.pagination.end;
        var curPage=data.msg.pagination.curPage;
        var pageRange=[];
        if(0!=end && 0!=start && end>start){
            var pageNum=end-start+1
            for(var i=0;i<pageNum;i++){
                var ele={pageNo:start+i,active:''}
                if(curPage==start+i){
                    ele.active='active'
                }
                pageRange.push(ele)
            }
        }
        if(0!=end && 0!=start && end===start){
            var ele={pageNo:start,active:''}
            ele.active='active';
            pageRange.push(ele)
        }
//console.log(pageRange)
        return pageRange
    }
    //判断是否达到最大值，没有push新key到$scope.article；否则报错
    $scope.addNewKey=function(){
        if($scope.article.keys.content.length<$scope.article.keys.define.maxSize){
            var newKey={value:'',leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',errorClass:''}
            $scope.article.keys.content.push(newKey)
            console.log($scope.article.keys)
        }else{
            $scope.errorModal={
                state:'show',
                msg:'最多'+$scope.article.keys.define.maxSize+'关键字',
                title:'错误',
                close:function(){
                    this.state=''
                }
            }
        }
    }
/*ue.ready(function(){
    ue.setOpt('serverUrl','article/save?articleID='+getArticleID());
    console.log(ue.getOpt('serverUrl'))
})*/

    //初始化数据

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



/*    $scope.comments=[
        {userName:'zhang wei',thumbnail:'b10e366431927231a487f08d9d1aae67f1ec18b4.jpg',content:'asdfasdfsadfsadf'},
        {userName:'wei zhang',thumbnail:'b10e366431927231a487f08d9d1aae67f1ec18b4.jpg',content:'ertyyuikhklghjkhgk'}
    ];*/
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


    $scope.saveContent=function(){
        var articleID=getArticleID()
        if(false===articleID){
            $scope.errorModal={
                state:'show',
                msg:'当前文档的ID不正确',
                title:'错误',
                close:function(){
                    this.state=''
                }
            }
            return false
        }
/*        ue.ready(function(){
            console.log('in')
        })*/
        var keys=[];
        for(var i=0;i<$scope.article.keys.content.length;i++){
            if(''!=$scope.article.keys.content[i].value && $scope.article.keys.content[i].value.length<$scope.article.keys.define.maxLength)
            {
                keys.push($scope.article.keys.content[i].value)
            }
        }
        var title=$scope.article.title.value
        var pureContent=ue.getContentTxt();
        var htmlContent=ue.getContent();

        var service=articleService.saveContent(articleID,title,keys,pureContent,htmlContent);
        service.success(function(data,status,header,config) {
            if(0===data.rc){
                //同步到页面
                $scope.article.pureContent.value=pureContent;
                $scope.article.htmlContent.value=$sce.trustAsHtml(htmlContent);
                $scope.editFlag=false
            }else{
                if(false===articleID){
                    $scope.errorModal={
                        state:'show',
                        msg:data.msg,
                        title:'错误',
                        close:function(){
                            this.state=''
                        }

                    }
                    return false
                }
            }
        }).error(function(data,status,header,config){

        })
    }

    /*
     * attachment
     * */
    //$scope.attachment=[
    //    {name:'test.png',hashName:'d86cbf3f5c5d5c43f30d26b4ad18a8df256dee18.png',size:212500}
    //]
    var formatAttachment=function(attachments){
        if(undefined===attachments || 0===attachments.length){
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
        for(var i=0;i<attachments.length;i++){
            var attachment=attachments[i]
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

    /*
     * data for upload file
     *
     * file.name(ng-upload-file,)
      * file.size(ng-upload-file, in byte)
      * file.roughSize(controller, ii MB)
      * file.status(controller, 0:not start, 1: uploading, 2:upload done  3: upload stop  4 upload failed
     * */

/*    //$scope.files={};
    $scope.filesList=[];*/
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
    $scope.filesList=[]
    //console.log($scope.filesList.length)
    $scope.$watch('files', function (files) {
/*        lastModified        1416830046001
        lastModifiedDate        Date {Mon Nov 24 2014 19:54:06 GMT+0800}
        name        "SPlayerSetup.exe"
        size        8261416
        type        "application/octet-stream"*/
//console.log($scope.files)
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
//console.log($scope.filesList.length>0)
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
        var articleID=getArticleID()
        //console.log(articleID)
        if(false===articleID){
            $scope.errorModal={
                state:'show',
                msg:'当前文档的ID不正确',
                title:'错误',
                close:function(){
                    this.state=''
                }
            }
            return false
        }
        if (files && files.length) {
//console.log(files)
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if(0!=file.status && 3!=file.status){continue}//skip uploaded/uploading file
                Upload.upload({
                    url: 'article/upload/'+articleID,
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



    var getData=function(){

        var articleID=getArticleID()
        if(false===articleID){
            $window.location='articleNotExist'
        }


        //console.log(articleID)
        //var htmlContent=ue.getContent();
        var service=articleService.getData(articleID);
        service.success(function(data,status,header,config) {
            switch (data.rc){
                case 0:
                    $scope.modal={
                        state:''
                    }
                    $scope.showEdit=data.msg.isOwner;
                    $scope.article={
                        editFlag:false,//是文档owner；是否处于编辑状态
                        title:{value:data.msg.title,lastModifiedDate:data.msg.mDate,leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',errorClass:'',define:{required:true,maxLength:255}},
                        author:{value:data.msg.author.name},
                        cDate:{value:formatShortDate(data.msg.cDate)},
                        keys:{
                            //content:[{value:'key1',leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',errorClass:''},
                            //    {value:'key2',leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',errorClass:''}],
                            content:[],
                            define:{required:false,maxLength:100,maxSize:5}
                        },

                        pureContent:{value:data.msg.pureContent,leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',errorClass:'',define:{required:false,maxLength:8000}},
                        htmlContent:{value:$sce.trustAsHtml(data.msg.htmlContent),leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',define:{required:false,maxLength:12000}},
                        //innerImage:{value:[],leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',define:{required:false,maxLength:5}},
                        //attachment:{value:[],leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',define:{required:false,maxLength:5}},
                        attachment:{
                            value:[
                                //{name:'test.png',hashName:'d86cbf3f5c5d5c43f30d26b4ad18a8df256dee18.png',size:212500}
                            ],
                            define:{required:false,maxLength:5}
                        },
                        newComment:{value:'',leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',define:{required:true,maxLength:255}},

                        comment:[],
                        commentPagination:data.msg.pagination,
                        commentGotoPage:''
                    };
                    //console.log(data.msg.htmlContent)
                    ue.ready(function(){
                        //console.log(data.msg.htmlContent)
                        if(data.msg.htmlContent){
                            ue.setContent(data.msg.htmlContent.toString())
                        }else{
                            ue.setContent('')
                        }

                    })

                    //add array(key,attachment,comment into $scope.article
                    if(data.msg.keys.length>0){

//console.log(data.msg.keys.length);
                        for(var i=0;i<data.msg.keys.length;i++){
                            var singleKey={};
                            singleKey.value=data.msg.keys[i]
                            singleKey.leftNumFlag=false;
                            singleKey.leftNum=null;
                            singleKey.errorFlag=false;
                            singleKey.errorMsg='';
                            singleKey.errorClass=''
                            $scope.article.keys.content.push(singleKey)
                        }
//console.log( $scope.article.keys)
                    }
                    if(data.msg.attachment.length>0) {

                        for (var i = 0; i < data.msg.attachment.length; i++) {
                            var singleAttachment={};
                            singleAttachment.name = data.msg.attachment[i].name;
                            singleAttachment.hashName = data.msg.attachment[i]._id;
                            singleAttachment.size = (data.msg.attachment[i].size / 1024 / 1024).toFixed(2);//byte=>Megabyte
                            $scope.article.attachment.value.push(singleAttachment)
                        }
                    }
                        //{content:'asdf',mDate:'2015-12-12 12:12;12',user:{name:'a',thumbnail:'b10e366431927231a487f08d9d1aae67f1ec18b4.jpg',cDate:}}
                    //格式化时间
                    $scope.article.comment=readComment(data)
                    //console.log($scope.article)
                    //根据start/end产生页码
                    $scope.article.commentPagination.pageRange=generatePaginationRange(data);
//console.log( $scope.article.commentPagination)
                    formatAttachment($scope.attachment);
                    break;
                case 500:
                    $window.location='articleNotExist';
                    break;
                default:
                    $scope.errorModal={
                        state:'show',
                        title:'错误',
                        msg:data.msg,
                        close:function(){
                            //console.log('close')
                            this.state=''
                        }
                    }
            }


        }).error(function(data,status,header,config){

        })
    }

    getData()

    /*
    * post
    *
    * */

    var initNewComment=function(){
        $scope.article.newComment.leftNumFlag=false;
        $scope.article.newComment.leftNum=0;
        $scope.article.newComment.errorFlag=false;
        $scope.article.newComment.errorMsg='';
        $scope.article.newComment.errorClass=''
    }
    //设置错误信息（可与剩余字数同时存在
    var errorNewComment=function(errorMsg){
        $scope.article.newComment.errorFlag=true;
        $scope.article.newComment.errorMsg=errorMsg;
        $scope.article.newComment.errorClass=''
    }
    $scope.addComment=function(){
        var articleID=getArticleID()
        //console.log(articleID)
        if(false===articleID){
            showErrMsg('当前文档的ID不正确')
            return false
        }
        var commentData=$scope.article.newComment;
        //console.log(commentData)
        if(''===commentData.value){
            errorNewComment('回复内容不能为空')
            return false
        }
        //console.log('1')
        if(commentData.value.length>commentData.define.maxLength){
            errorNewComment('回复最多包含255个字符')
            return false
        }
        //console.log('2')
        var service=articleService.addComment(articleID,commentData.value);
        service.success(function(data,status,header,config) {
            //console.log(data)
            switch (data.rc){
                case 0:
                    //data.msg.cDate=new Date(data.msg.cDate)
/*                    //格式化评论日期
                    data.msg.mDate=formatLongDate(data.msg.mDate);
                    //格式化用户创建日期
                    data.msg.user.cDate=formatShortDate( data.msg.user.cDate);
                    $scope.article.comment.push(data.msg)*/

                    $scope.article.comment=readComment(data)

                    //console.log(readComment(data.msg.comment))
                    //$scope.article.comment.push(readComment(data))
                    $scope.article.newComment.value=''
                    //返回的是最后一页
                    $scope.article.commentPagination=data.msg.pagination
                    $scope.article.commentPagination.pageRange=generatePaginationRange(data);
                    break;
                default:
                    $scope.errorModal={
                        state:'show',
                        title:'错误',
                        msg:data.msg,
                        close:function(){
                            //console.log('close')
                            this.state=''
                        }
                    }
                    break;
            }
        }).error(function(data,status,header,config){

        })
    }

    $scope.readComment=function(curPage){
//console.log(curPage)
//        if(NaN===parseInt(curPage)){
//            curPage=1
//        }
        var articleID=getArticleID()
        if(false===articleID){
            $window.location='articleNotExist'
        }
        var service=articleService.readComment(articleID,curPage);
        service.success(function(data,status,header,config) {
            //$scope.article.comment=data.msg.comment
            if(0<data.rc){
                showErrMsg(data.msg);
                return false;
            }
            $scope.article.comment=readComment(data)
            $scope.article.commentPagination=data.msg.pagination
            $scope.article.commentPagination.pageRange=generatePaginationRange(data);
        }).error(function(data,status,header,config){

        })
    }

 })
