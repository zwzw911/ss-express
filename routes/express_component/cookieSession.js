/**
 * Created by ada on 2015/5/15.
 */
    /*
    set cookie and express-session configuration
    for session, reuse mongodb connection
    */
//var mongooseConnect=require('../model/dbConnection');
'use strict'
var cookieSessMaxAge=15;//分钟

var session=require('express-session');
var redisStore=require('connect-redis')(session)
//var mongoStoreClass=require('connect-mongo')(session);
var redisClient=require('../model/redis/redis_connections').redisClient()

var internalSetting=require('../inputDefine/adminLogin/defaultGlobalSetting').internalSetting

var redisStoreOptions={client:redisClient,ttl:cookieSessMaxAge*60}//session存在的时间和sess过期的时间一致
var sessionStore=new redisStore(redisStoreOptions);
//maxAge:ms; secure:false(if only used for https), send cookie to client when http
var cookieOptions={path:'/',domain:internalSetting.reqHostname,maxAge:cookieSessMaxAge*60*1000,secure:false,httpOnly:true};
//secret:digest session id
// resave/rolling: when false, only when sesssion expire or session content changed, will save session to store/send cookie to cilent
//saveUninitialized: when false, if session id created but no any content, will not save session to store
var sessionOptions={secret:'test',resave:false,rolling:false,saveUninitialized:false};
//var sessionStoreInst=new mongoStoreClass({mongooseConnection:mongooseConnect.mongoose.connection});

sessionOptions.cookie=cookieOptions;
sessionOptions.store=sessionStore;


/*var cookieSetDefault=function(){
    cookieOptions={path:'/',domain:'localhost',maxAge:900000,secure:false,httpOnly:true}
}

var setCookieMaxAge=function(duration){
    cookieOptions.maxAge=duration*1000;
}*/

exports.session=session(sessionOptions);
exports.cookieOptions=cookieOptions;
//exports.setCookie={cookieSetDefault:cookieSetDefault,setCookieMaxAge:setCookieMaxAge}