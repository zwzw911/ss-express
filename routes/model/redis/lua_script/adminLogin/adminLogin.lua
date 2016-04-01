local userKey=KEYS[1]
local passwordKey=KEYS[2]
local toBeVerifiedUser=ARGV[1]
local toBeVerifiedPassword=ARGV[2]
local sessionId=KEYS[3]
local restTimeOfToday=ARGV[3]

redis.call('select',1)
--read globalSetting
--maxFailTimes/existTTL/namePasswordTTL
local value=redis.call('hgetall','adminLogin')
local setting={}
for i=1,#value do
	setting[value[i]]=tonumber(value[i+1])
	i=i+2
end

redis.call('select',3)
-- check if rejectFlag set
-- if(1==redis.call('exists','adminLogin:rejectFlag')) then
	-- reach max try times per day
	-- return {1}
-- end
-- check if sessionId:adminLogin exist; if exists, already login
-- if(1==redis.call('exists',sessionId..':adminLogin')) then
	-- return {0}
-- end


--read generated user/password
if(0==redis.call('exists','up')) then
	return {2}
end
local storedUser=redis.call('hget','up',userKey)
local storedPassword=redis.call('hget','up',passwordKey)


--compare 
if ( storedUser~=toBeVerifiedUser or  storedPassword~=toBeVerifiedPassword) then
	--faile
	local newFailTimes=redis.call('incr','adminLogin:failTimes')
	redis.call('expire','adminLogin:failTimes',restTimeOfToday)
	if(newFailTimes>=setting.maxFailTimes) then
		redis.call('set','adminLogin:rejectFlag',0)
		redis.call('expire','adminLogin:rejectFlag',restTimeOfToday)
		return {1}
	else
		local leftTryTimes=setting.maxFailTimes-newFailTimes
		return {3,leftTryTimes}
	end
else
	--success
	redis.call('set',sessionId..':adminLogin',0)
	redis.call('expire',sessionId..':adminLogin',setting.existTTL)
	return {0}
end 
