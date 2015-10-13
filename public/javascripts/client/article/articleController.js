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


var app=angular.module('app',['ngFileUpload','inputDefineApp','generalFuncApp']);

app.factory('articleService',function($http){

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
    //上传是通过Upload.upload方法完成的

    var removeAttachment=function(articleHashId,fileId){
        return $http.post('article/removeAttachment/',{articleHashId:articleHashId,fileId:fileId},{});
    }
    return {preCheckUploadFiles:preCheckUploadFiles,saveContent:saveContent,getData:getData,addComment:addComment,readComment:readComment,removeAttachment:removeAttachment};
})


app.controller('ArticleController',function($scope,$location,$window,Upload,articleService,$sce,func,inputDefine){
    var getArticleID=function(){
        var absURL=$location.absUrl();
        var articleID=absURL.split('=').pop()
        var articleID=articleID.split('#').shift()
        if(undefined===articleID || ''===articleID || !inputDefine.article.hashId.define.test(articleID) ){//
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
                singleComment.mDateConv=data.msg.comment[i].mDateConv
                if(undefined!=data.msg.comment[i].user){
                    singleComment.user=data.msg.comment[i].user;
                    singleComment.user.thumbnail=singleComment.user.thumbnail
                    singleComment.user.cDate=func.getDate(singleComment.user.mDateConv)
                }
                comment.push(singleComment)
            }
        }
        return comment
    }


    //判断是否达到最大值，没有push新key到$scope.article；否则报错
    $scope.addNewKey=function(){
        if($scope.article.keys.content.length<$scope.article.keys.define.maxSize){
            var newKey={value:'',leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',errorClass:''}
            $scope.article.keys.content.push(newKey)
            //console.log($scope.article.keys)
        }else{
            $scope.errorModal=func.showErrMsg('最多'+$scope.article.keys.define.maxSize+'关键字')
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

    $scope.btnClick= function (clickBtn) {
        if('edit'===clickBtn.name){
            $scope.btn.edit.disabled=true;
            $scope.btn.cancel.disabled=false;
            $scope.btn.save.disabled=false;
        }

        if('cancel'===clickBtn.name || 'save'===clickBtn.name){
            $scope.btn.edit.disabled=false;
            $scope.btn.cancel.disabled=true;
            $scope.btn.save.disabled=true;
        }

        $scope.article.editFlag=!$scope.article.editFlag;
//console.log($scope.article.editFlag)
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
            $scope.errorModal=func.showErrMsg('当前文档的ID不正确')
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
                $scope.article.editFlag=false
            }else{
                //if(false===articleID){
                //console.log(data)
                    $scope.errorModal=func.showErrMsg(data.msg)
                    return false
                //}
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
    var formatSingleAttachment=function(attachment){
        if(undefined===attachment || typeof attachment!=='object'){
            return false;
        }
        var suffix//文件后缀名
        var image=['jpeg','jpg','png','gif','bmp'];
        var text=['txt','log','html']
        var msDoc=['doc','docx']
        var msExcel=['xls','xlsx']
        var msPoint=['ppt','pptx','pps']
        var video=['avi']
        var zip=['zip','tar']
        suffix=attachment.name.split('.').pop();
        if(-1!=image.indexOf(suffix)){
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
        if(undefined===attachment.icon){
            attachment.icon='fa fa-file-o'
        }
        attachment.size=(attachment.size/1024/1024).toFixed(2);
    }
    var formatAttachment=function(attachments){
        if(undefined===attachments || 0===attachments.length){

            return false;
        };
        attachments.forEach(function(e){
            formatSingleAttachment(e)
        })
    }

    /*
     * data for file
     *
     * file.name(ng-upload-file,)
      * file.size(ng-upload-file, in byte)
      * file.roughSize(controller, ii MB)
      * file.status(controller, 0:not start, 1: uploading, 2:upload done  3: upload stop  4 upload failed
     * */

/*    //$scope.files={};
    $scope.filesList=[];*/
    $scope.uploadDefine=inputDefine.uploadDefine
     //same define in /routes/assist/upload_define.js
    var mimes =inputDefine.mimes;

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
                                }else{
                                    setInitState($scope.filesList[i])
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
            $scope.errorModal=func.showErrMsg('当前文档的ID不正确')

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
                        //console.log(data.msg)
                        formatSingleAttachment(data.msg)
                        //console.log(data.msg)
                        $scope.article.attachment.value.push(data.msg)
                    }else{
                        setUploadFailState(config.file,data.msg)
                    }
                }).error(function (data, status, headers, config) {
                    config.file.status=4;
                    setUploadFailState(config.file,data.msg)
                    //console.log('error status: ' + status);
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
            $window.location.href='articleNotExist'
        }

        var service=articleService.getData(articleID);
        service.success(function(data,status,header,config) {

            switch (data.rc){
                case 0:
                    $scope.userInfo=data.msg.userInfo
                    $scope.showEdit=data.msg.isOwner

                    $scope.article={
                        editFlag:false,//是文档owner；是否处于编辑状态
                        title:{value:data.msg.title,lastModifiedDate:data.msg.mDate,leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',errorClass:'',define:{required:true,maxLength:255}},
                        author:{value:data.msg.author.name},
                        cDate:{value:data.msg.mDateConv},
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
                                //{name:'test.png',id:5617b39e91ee3cfc314b9b3c,size:212500}
                            ],
                            define:{required:false,maxLength:5}
                        },
                        newComment:{value:'',leftNumFlag:false,leftNum:null,errorFlag:false,errorMsg:'',define:{required:true,maxLength:255}},

                        comment:[],
                        commentPagination:data.msg.pagination,
                        commentGotoPage:''
                    };
                    //console.log(data.msg.htmlContent)
//console.log(1)
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
//console.log('5')
                    }
                    if(data.msg.attachment.length>0) {
                        $scope.article.attachment.value=data.msg.attachment
//console.log( $scope.article.attachment.value)
                        formatAttachment($scope.article.attachment.value);
                    }
                        //{content:'asdf',mDate:'2015-12-12 12:12;12',user:{name:'a',thumbnail:'b10e366431927231a487f08d9d1aae67f1ec18b4.jpg',cDate:}}

//console.log('6')
                    $scope.article.comment=readComment(data)
                    //console.log($scope.article)
                    //根据start/end产生页码
                    $scope.article.commentPagination.pageRange=func.generatePaginationRange(data.msg.pagination);
//console.log('7')

                    break;
                case 500:
                    $window.location.href='articleNotExist';
                    break;
                default:
                    $scope.errorModal=func.showErrMsg(data.msg)
            }


        }).error(function(data,status,header,config){

        })
    }
//console.log('start')
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
            $scope.errorModal=func.showErrMsg('当前文档的ID不正确')
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
                    $scope.article.comment=readComment(data)

                    //console.log(readComment(data.msg.comment))
                    //$scope.article.comment.push(readComment(data))
                    $scope.article.newComment.value=''
                    //返回的是最后一页
                    $scope.article.commentPagination=data.msg.pagination
                    $scope.article.commentPagination.pageRange=func.generatePaginationRange(data.msg.pagination);
                    break;
                default:
                    $scope.errorModal=func.showErrMsg(data.msg)

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
//        console.log(articleID)
        if(false===articleID){
            $window.location.href='articleNotExist'
        }
        var service=articleService.readComment(articleID,curPage);
        service.success(function(data,status,header,config) {
            //$scope.article.comment=data.msg.comment
            if(0<data.rc){
                $scope.errorModal=func.showErrMsg(data.msg);
                return false;
            }
            //
            $scope.article.comment=readComment(data)
            //console.log($scope.article.comment)
            $scope.article.commentPagination=data.msg.pagination
            $scope.article.commentPagination.pageRange=func.generatePaginationRange(data.msg.pagination);
//console.log($scope.article.commentPagination.pageRange)
        }).error(function(data,status,header,config){

        })
    }

    //删除一个附件
    $scope.removeAttachment=function(idx){
        var fileId=$scope.article.attachment.value[idx].id
        var articleHashId=getArticleID()
        var service=articleService.removeAttachment(articleHashId,fileId)
        service.success(function(data,status,header,config) {
            if(0<data.rc){
                $scope.errorModal=func.showErrMsg(data.msg)
                return false
            }
            $scope.article.attachment.value.splice(idx,1)
        }).error(function(data,status,header,config){

        })
    }

    $scope.quit=function(){
        var quit=func.quit()
        quit.success(function(data,status,header,config){
            //console.log(data)
            if(data.rc===0){
                $window.location.href='main'
            }
        }).error(function(data,status,header,config){})
    }

    //空格分割（input）转换成+分割（URL）
    $scope.search=function(){
//console.log($scope.searchString,inputDefine.search.searchTotalKeyLen.define)
        var convertedString=func.convertInputSearchString($scope.searchString,inputDefine.search.searchTotalKeyLen.define)
        //console.log(convertedString)
        //搜索字符串为空，直接返回
        if(false===convertedString){
            return false
        }
        $window.location.href='searchResult?wd='+convertedString
    }
 })
