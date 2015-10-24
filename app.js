var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//var routes = require('./routes/login');
var article = require('./routes/article');
var login = require('./routes/login');
var register = require('./routes/register');
var main = require('./routes/main');
var users = require('./routes/not_used_users');
var generalError = require('./routes/generalError');
var personalArticle = require('./routes/personalArticle');
var personalInfo = require('./routes/personalInfo');
var searchResult = require('./routes/searchResult');
var searchPage = require('./routes/searchPage');
var logOut = require('./routes/logOut');

//var test = require('./routes/not_used_test');

var articleNotExist = require('./routes/error_page/articleNotExist');

//console.log(app.locals)
var cookieSession=require('./routes/express_component/cookieSession');
//var angular=require('angular');

var inner_image_directory_path=require('./routes/assist/general').general.ueUploadPath
var inner_image=require('./routes/assist/ueditor_config').ue_config.imagePathFormat;
//var rootPath=require('./routes/assist/general').rootPath;
// view engine setup
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('test'));
app.use(require('less-middleware')(path.join(__dirname, 'public')));
var staticPath=[
  //'public',
  //'public/javascripts/lib',
  'public/javascripts/express_component',
  //'node_modules/angular',
  //'node_modules/angular-messages',
  //'node_modules/restangular/dist',
  //'node_modules/ng-file-upload/dist',
  //'node_modules/multiparty',
  //  'node_modules/angular-ui-tree/dist',
  inner_image,
'user_icon',
'captcha_Img',
//'node_modules/angular-route'
];
//console.log(inner_image_directory_path+'/'+inner_image)
for(var tmp in staticPath){
  app.use(express.static(path.join(__dirname,staticPath[tmp])));
}
app.use(cookieSession.session);//enable session middleware

//
//app.use('/', routes);
app.use(['/main','/'], main);//main必需放在前面才有效??
app.use('/article', article);
app.use('/login', login);
app.use('/register', register);
app.use('/users', users);
//app.use('/main', main);
app.use('/generalError', generalError);
//app.use('/test', test);
app.use('/articleNotExist',articleNotExist);
app.use('/personalArticle',personalArticle);
app.use('/personalInfo',personalInfo);
app.use('/searchResult',searchResult);
app.use('/searchPage',searchPage);
app.use('/logOut',logOut);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
//console.log(app.get('env'))
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('noAuth', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
if(app.get('env') === 'production') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
}
//console.log(app.get('port'))
//app.listen(3000);
module.exports = app;
