var express=require("express"),router=express.Router(),mainDbOperation=require("./model/mainModel").mainDboperation,generalFunc=require("./express_component/generalFunction").generateFunction,general=require("./assist/general").general;router.get("/",function(a,b,c){void 0===a.session.state&&(a.session.state=2);var d=generalFunc.preCheck(a,!1);return d.rc>0?b.json(d):void b.render("main",{title:"首页",year:(new Date).getFullYear()})}),router.post("/",function(a,b,c){var d=generalFunc.preCheck(a,!1);return d.rc>0?b.json(d):void mainDbOperation.getLatestArticle(function(c,d){if(0<d.rc)return b.json(d);void 0!==d.msg&&0<d.msg.length&&d.msg.forEach(function(a){void 0!==a.pureContent&&a.pureContent.length>general.truncatePureContent&&(a.pureContent=a.pureContent.substr(0,general.truncatePureContent)+" ......")});var d={lastWeekCollect:[],lastWeekClick:[],latestArticle:d.msg};return d.userInfo=generalFunc.getUserInfo(a),b.json({rc:0,msg:d})})}),module.exports=router;