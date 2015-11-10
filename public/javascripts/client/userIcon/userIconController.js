/**
 * Created by zw on 2015/11/8.
 */
var app=angular.module('app',['ngFileUpload','generalFuncApp','inputDefineApp']);

app.controller('userIconController',function($scope,Upload){
    $scope.uploadDefine={
        maxSize:'\'500KB\'',//B,KB,MB,GB  maxSize:'5MB'。如果单位是byte，只要输入数字，否则，是字符（用单引号括起）
        acceptImageType:'.jpg,.jpeg,.png'
    }
    //用来检测文件，并返回相应的信息（ngf不显示信息）
    $scope.$watch('file', function (file) {
        console.log(file)
    })

    //$scope.uploadStatusConfig={0:{css:'text-muted',msg:'准备上传'},1:{css:'text-info',msg:"上传中"},2:{css:'text-success',msg:'上传完毕'},3:{css:'text-danger',msg:'停止上传'},4:{css:'text-danger',msg:'上传失败'}}//4 还需要显示具体错误

    var setInitState=function(file){
        file.status=0;//undefined means new added file
        file.roughSize = (file.size / 1024 / 1024).toFixed(2);
        file.uploadPercentage=0;
        file.loadedSize=0;
        file.errorFlag=false;
        file.msg='准备上传';
        file.progressBarClass='';
        file.textClass="text-muted"
    }
    var setUploadingState=function(file){
        file.status=1;//uploading
        file.errorFlag=false;
        file.msg='上传中';
        file.progressBarClass='progress-bar-striped progress-bar-info active';
        file.textClass="text-info"
    }
    var setUploadedState=function(file){
        file.status=2;//upload done
        file.errorFlag=false;
        file.msg='上传完毕';
        file.progressBarClass='progress-bar-success';
        file.textClass="text-success"
    }
    var setUploadStopState=function(file){
        file.status=3;//upload stop
        file.errorFlag=false;
        file.msg='停止上传';
        file.progressBarClass='progress-bar-warning';
        file.textClass="text-warning"
    }
    var setUploadFailState=function(file,failMsg){
        file.status=4;//upload failed
        file.errorFlag=true;
        file.msg='上传失败:'+failMsg;
        file.progressBarClass='progress-bar-danger';
        file.textClass="ext-danger"
    }
    //出入file数组，但是只处理第一个文件
    $scope.upload = function (files) {
        if(undefined===files || undefined===files[0]){
            console.log('没有选择文件')
        }
        var file=files[0]

                Upload.upload({
                    url: '/userIcon/upload',
                    fields: {},
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
                        //formatSingleAttachment(data.msg)
                        //console.log(data.msg)
                        //$scope.article.attachment.value.push(data.msg)
                    }else{
                        setUploadFailState(config.file,data.msg)
                    }
                }).error(function (data, status, headers, config) {
                    config.file.status=4;
                    setUploadFailState(config.file,data.msg)
                    //console.log('error status: ' + status);
                })
            
        
    };
})
