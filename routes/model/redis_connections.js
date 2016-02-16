/**
 * Created by wzhan039 on 2015-12-16.
 */
var redis=require('redis');
var redisOptions={
    host:'127.0.0.1',
    port:6379,
    enable_offline_queue:false,//当redis offline，不要缓存redis client的请求，防止占用内存，并可以显示错误给浏览器客户端
    retry_max_delay:1000,//client连接失败，再次重试，延迟加倍；默认没有最大延迟限制；现在设成1000ms
    max_attempts:10//最大重试连接次数
}

module.exports={
    redisClient:redis.createClient(redisOptions)
    //redisClient:redis.createClient()
}
