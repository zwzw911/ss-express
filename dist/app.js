var express=require("express"),path=require("path"),favicon=require("serve-favicon"),logger=require("morgan"),cookieParser=require("cookie-parser"),bodyParser=require("body-parser"),article=require("./routes/article"),login=require("./routes/login"),register=require("./routes/register"),main=require("./routes/main"),users=require("./routes/not_used_users"),generalError=require("./routes/generalError"),personalArticle=require("./routes/personalArticle"),personalInfo=require("./routes/personalInfo"),searchResult=require("./routes/searchResult"),searchPage=require("./routes/searchPage"),logOut=require("./routes/logOut"),articleNotExist=require("./routes/error_page/articleNotExist"),cookieSession=require("./routes/express_component/cookieSession"),inner_image_directory_path=require("./routes/assist/general").general.ueUploadPath,inner_image=require("./routes/assist/ueditor_config").ue_config.imagePathFormat,app=express();app.set("views",path.join(__dirname,"views")),app.set("view engine","ejs"),app.use(logger("combined")),app.use(bodyParser.json()),app.use(bodyParser.urlencoded({extended:!1})),app.use(cookieParser("test")),app.use(require("less-middleware")(path.join(__dirname,"public")));var staticPath=[inner_image,"user_icon","captcha_Img"];for(var tmp in staticPath)app.use(express["static"](path.join(__dirname,staticPath[tmp])));app.use(cookieSession.session),app.use(["/main","/"],main),app.use("/article",article),app.use("/login",login),app.use("/register",register),app.use("/users",users),app.use("/generalError",generalError),app.use("/articleNotExist",articleNotExist),app.use("/personalArticle",personalArticle),app.use("/personalInfo",personalInfo),app.use("/searchResult",searchResult),app.use("/searchPage",searchPage),app.use("/logOut",logOut),app.use(function(a,b,c){var d=new Error("Not Found");d.status=404,c(d)}),"development"===app.get("env")&&app.use(function(a,b,c,d){c.status(a.status||500),c.render("noAuth",{message:a.message,error:a})}),"production"===app.get("env")&&app.use(function(a,b,c,d){c.status(a.status||500),c.render("error",{message:a.message,error:{}})}),module.exports=app;