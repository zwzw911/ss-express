/**
 * Created by wzhan039 on 2016-02-14.
 */
var runtime_redis_error={
    general:{
        setError:{rc:50000,msg:'redis保存数据出错'},
        keyNotExist:{rc:50002,msg:'redis中没有找到对应的键'},
        existsFail:{rc:50004,msg:'执行exists命令出错'}
    },
    captcha:{
        getError:{rc:50010,msg:'读取验证码出错'},
        saveError:{rc:50012,msg:'保存验证码出错'},
        delError:{rc:50013,msg:'删除验证码出错'},
        expire:{rc:50014,msg:'验证码超时，请重新输入'},
        notExist:{rc:50016,msg:'验证码超时或者不存在'}
    }
}
exports.runtime_redis_error=runtime_redis_error;
