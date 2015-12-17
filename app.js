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
//var users = require('./routes/not_used_users');
var generalError = require('./routes/generalError');
var personalArticle = require('./routes/personalArticle');
var personalInfo = require('./routes/personalInfo');
var searchResult = require('./routes/searchResult');
var searchPage = require('./routes/searchPage');
var logOut = require('./routes/logOut');
var userIcon = require('./routes/userIcon');
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
// uncomment after placing your favicon in /public; put very first to disable other middleware deal with favicon(even logger not deal with it)
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.set('env','dev')
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('test'));
app.use(require('less-middleware')(path.join(__dirname, 'public')));
var staticPath=[
  'public',
  'public/javascripts/lib',
  //'public/javascripts/express_component',
  //'node_modules/angular',
  //'node_modules/angular-messages',
  //'node_modules/restangular/dist',
  //'node_modules/ng-file-upload/dist',
  //'node_modules/multiparty',
  //  'node_modules/angular-ui-tree/dist',
  inner_image,
'user_icon'
//'captcha_Img',
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
app.use('/generalError', generalError);
app.use('/articleNotExist',articleNotExist);
app.use('/personalArticle',personalArticle);
app.use('/personalInfo',personalInfo);
app.use('/searchResult',searchResult);
app.use('/searchPage',searchPage);
app.use('/logOut',logOut);
app.use('/userIcon',userIcon);

//console.log('err')
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Page Not Found');
  err.status = 404;
  //console.log(err)
  //must use next, to deal all errors in next middle ware
  next(err);
});
//console.log(app.get('env'))
// error handlers

// development error handler
// will print stacktrace

app.use(function(err, req, res, next) {
	var status=err.status || 500
//console.log(status)
	res.status(status);
	//404 are same for both dev and pro
	if(status===404){
		return res.render('noAuth', {
			//use url or originalUrl, cause baseUrl only for matched Url
			message: req.url+' not found',
			error: err
		});		
	}
	if(app.get('env') === 'dev') {
		switch (status){
			case 501:

				break;
			case 500:
				res.render('noAuth', {
					message: req.baseUrl+' '+err,
					error: err
				});
				break;
		}
	}
	if(app.get('env') === 'pro') {
		res.render('noAuth', {
		  message: "服务器出错了",
		  error: {}
		});
  
	}
});

//console.log(app.get('port'))
//app.listen(3000);
module.exports = app;
