/**
 * Created by wzhan039 on 2016-02-14.
 */
var runtime_redis_error={
    general:{
        setError:{rc:50000,msg:'保存数据出错'},
        getError:{rc:50001,msg:'读取数据出错'},
        keyNotExist:{rc:50002,msg:'redis中没有找到对应的键'},
        existsFail:{rc:50004,msg:'执行exists命令出错'},
        rpushFail:{rc:50005,msg:'执行rpush命令出错'},
        llenFail:{rc:50006,msg:'执行llen命令出错'},
        lindexFail:{rc:50008,msg:'执行lindex命令出错'},
        lpopFail:{rc:50010,msg:'执行lpop命令出错'},
        ttlFail:{rc:50011,msg:'执行ttl命令出错'},
        luaFail:{rc:50012,msg:'脚本执行失败'},

    },
    captcha:{
        getError:{rc:50010,msg:'读取验证码出错'},
        saveError:{rc:50012,msg:'保存验证码出错'},
        delError:{rc:50013,msg:'删除验证码出错'},
        expire:{rc:50014,msg:'验证码超时，请重新输入'},
        notExist:{rc:50016,msg:'验证码超时或者不存在'}
    },
    adminLogin:{
        notLogin:{rc:50020,msg:'尚未登录'},
        userPasswordNotExist:{rc:50022,msg:'用户名密码不存在'},
        getNameFail:{rc:50024,msg:'读取用户名出错'},
        getPasswordFail:{rc:50025,msg:'读取密码出错'},
    },
    intervalCheckBaseIP:{
        listIsEmpty:{rc:50030,msg:'list为空'},
/*        userPasswordNotExist:{rc:50022,msg:'用户名密码不存在'},
        getNameFail:{rc:50024,msg:'读取用户名出错'},
        getPasswordFail:{rc:50025,msg:'读取密码出错'},*/
    },
}
exports.runtime_redis_error=runtime_redis_error;
