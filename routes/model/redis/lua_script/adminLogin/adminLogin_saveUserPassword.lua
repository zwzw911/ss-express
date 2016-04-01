redis.call('select',1)
--read globalSetting
--maxFailTimes/existTTL/namePasswordTTL
local namePasswordTTL=tonumber(redis.call('hget','adminLogin','namePasswordTTL'))

redis.call('select',3)
redis.call('hmset','up',KEYS[1],ARGV[1],KEYS[2],ARGV[2])
redis.call('expire','up',namePasswordTTL)


return 0




