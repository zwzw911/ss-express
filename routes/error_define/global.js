/**
 * Created by zw on 2015/11/8.
 */
var global={
    /*                      upload define                   */
    userIconUploadDir:{define:'H:/ss_express/ss-express/user_icon/',client:{rc:60000,msg:'头像上传失败，请联系管理员'},server:{rc:70000,msg:'头像存储路径不存在'}},
    userIconMaxSizeMultiParty:{define:2000,client:{rc:60002,msg:'上传文件超过限制，无法保存'},server:{rc:70002,msg:'上传文件超过限制，无法保存'}},//byte
    userIconMaxSizeGm:{define:2,client:{rc:60004,msg:'上传文件超过限制，无法保存'},server:{rc:70004,msg:'上传文件超过限制，无法保存'}},//Ki
    userIconWidth:{define:64},//px
    userIconHeight:{define:64}//px
}
exports.global=global