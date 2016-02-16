/**
 * Created by wzhan039 on 2016-02-14.
 */
var runtime_redis_error={
    setError:{rc:50000,msg:'redis保存数据出错'},
    keyNotExist:{rc:50002,msg:'redis中没有找到对应的键'}
}
exports.runtime_redis_error=runtime_redis_error;
