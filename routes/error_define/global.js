/**
 * Created by zw on 2015/11/8.
 */
var global={
    /*                      upload define                   */
    userIconUploadDir:{define:'H:/ss_express/ss-express/user_icon/',client:{rc:60000,msg:'头像上传失败，请联系管理员'},server:{rc:70000,msg:'头像存储路径不存在'}},
    //只需要顶一个GM读取文件的大小，MultiParty的大小从这个值转换（通过generalFunction.parseGmFileSize和generalFunction.convertImageFileSizeToByte
    userIconMaxSizeGm:{define:'200Ki',client:{rc:60004,msg:'上传文件超过限制，无法保存'},server:{rc:70004,msg:'上传文件超过限制，无法保存'}},//无单位（byte）/Ki/Mi（最多一位小数，因为gm读取的size就是如此）
    userIconWidth:{define:104},//px
    userIconHeight:{define:104}//px
}
exports.global=global