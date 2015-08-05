/**
 * Created by ada on 2015/5/15.
 */
    /*
    set cookie and express-session configuration
    for session, reuse mongodb connection
    */
var mongooseConnect=require('../model/dbConnection');
var sessionClass=require('express-session');
var mongoStoreClass=require('connect-mongo')(sessionClass);

//maxAge:ms; secure:false, send cookie to client when http
var cookieOptions={path:'/',domain:'localhost',maxAge:900000,secure:false,httpOnly:true};
//secret:digest session id
// resave/rolling: when false, only when sesssion expire or session content changed, will save session to store/send cookie to cilent
//saveUninitialized: when false, if session id created but no any content, will not save session to store
var sessionOptions={secret:'test',resave:false,rolling:false,saveUninitialized:false};
var sessionStoreInst=new mongoStoreClass({mongooseConnection:mongooseConnect.mongoose.connection});

sessionOptions.cookie=cookieOptions;
sessionOptions.store=sessionStoreInst;


var cookieSetDefault=function(){
    cookieOptions={path:'/',domain:'localhost',maxAge:30000,secure:false,httpOnly:true}
}

var setCookieMaxAge=function(duration){
    cookieOptions.maxAge=duration*1000;
}

exports.session=sessionClass(sessionOptions);
exports.cookieOptions=cookieOptions;
exports.setCookie={cookieSetDefault:cookieSetDefault,setCookieMaxAge:setCookieMaxAge}