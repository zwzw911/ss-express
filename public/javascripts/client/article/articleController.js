/**
 * Created by wzhan039 on 2015-07-08.
 */
var app=angular.module('app',['ngFileUpload']);

app.controller('ArticleController',function($scope,Upload){
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
     * data for upload file
     *
     * file.name(ng-upload-file,)
      * file.size(ng-upload-file, in byte)
      * file.roughSize(controller, ii MB)
      * file.status(controller, 0:not start, 1: uploading, 2:upload done  3: upload stop  4 upload failed
     * */

    //$scope.files={};
    $scope.filesList=[];
    $scope.uploadDefine={maxSize:{define:8*1024*1024,msg:'文件最大为5M'},
        fileNameLength:{define:255,msg:"文件名最多包含255个字符"}
    } //same define in /routes/assist/upload_define.js
    $scope.uploadStatusConfig={0:{css:'text-muted',msg:'准备上传'},1:{css:'text-info',msg:"上传中"},2:{css:'text-success',msg:'上传完毕'},3:{css:'text-danger',msg:'停止上传'},4:{css:'text-danger',msg:'上传失败'}}//4 还需要显示具体错误
//console.log($scope.uploadStatus[1]['css'])
    $scope.setInitState=function(file){
        file.status=0;//undefined means new added file
        file.roughSize = (file.size / 1024 / 1024).toFixed(2);
        file.uploadPercentage=0;
        file.loadedSize=0;
        file.errorFlag=false;
        file.errorMsg='';
        file.progressBarClass='';
    }
    $scope.setUploadingState=function(file){
        file.status=1;//uploading
        file.errorFlag=false;
        file.errorMsg='';
        file.progressBarClass='progress-bar-info active';
    }
    $scope.setUploadedState=function(file){
        file.status=2;//upload done
        file.errorFlag=false;
        file.errorMsg='';
        file.progressBarClass='progress-bar-success';
    }
    $scope.setUploadStopState=function(file){
        file.status=3;//upload stop
        file.errorFlag=false;
        file.errorMsg='';
        file.progressBarClass='progress-bar-warning';
    }
    $scope.setUploadFailState=function(file,failMsg){
        file.status=4;//upload failed
        file.errorFlag=true;
        file.errorMsg=failMsg;
        file.progressBarClass='progress-bar-danger';
    }

    $scope.$watch('files', function (files) {
/*        lastModified        1416830046001
        lastModifiedDate        Date {Mon Nov 24 2014 19:54:06 GMT+0800}
        name        "SPlayerSetup.exe"
        size        8261416
        type        "application/octet-stream"*/
        if(undefined!=$scope.files &&  $scope.files.length>0 ) {

            for (var i = 0; i < files.length; i++) {
                if(undefined===files[i].status){//undefined means new added file
                    console.log(files[i].name.length);
                    $scope.setInitState(files[i]);
                    if($scope.uploadDefine.maxSize.define<files[i].size){
                        $scope.setUploadFailState(files[i],$scope.uploadDefine.maxSize.msg)
                    }
                    if($scope.uploadDefine.fileNameLength.define< files[i].name.length ){
                        $scope.setUploadFailState(files[i],$scope.uploadDefine.fileNameLength.msg);
                    }
                    $scope.filesList.push(files[i]);//this push a object(files is a array) even file is not valid, so that related msg can be show in table

                }
            }

            //$scope.upload($scope.filesList);
        }
//console.log($scope.filesList)
    });


//console.log(!$scope.btn.edit.disabled && ($scope.files.length>0));
    $scope.upload = function (files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
//console.log(file);
                if(0!=file.status && 3!=file.status){continue}//skip uploaded/uploading file
                //file.errorFlag=false;
                //file.errorMsg='';
                Upload.upload({
                    url: 'article/upload',
                    fields: {'username': $scope.username},
                    file: file
                }).progress(function (evt) {
                    evt.config.file.status=1;
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    evt.config.file.uploadPercentage=progressPercentage;
                    evt.config.file.loadedSize=(evt.loaded/1024/1024).toFixed(2);
                    //console.log('progress: ' + progressPercentage + '% ' + evt.config.file.uploadPercentage);
                    //console.log(evt.config.file);
                }).success(function (data, status, headers, config) {
                    if(0===data.rc){
                        //config.file.status=2;
                        $scope.setUploadedState(config.file);
                    }else{
                        $scope.setUploadFailState(config.file,data.msg)
                        //config.file.status=4;
                        //config.file.errorFlag=true;
                        //config.file.errorMsg=data.msg;
                        //config.file.uploadPercentage=0;
                    }



                    console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                }).error(function (data, status, headers, config) {
                    evt.config.file.status=4;
                    console.log('error status: ' + status);
                })
            }
        }
    };
    $scope.removeUploadFile=function(idx){
        $scope.filesList.splice(idx,1);
    }
})
