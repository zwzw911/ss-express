local ip=KEYS[1]
local currentTime=ARGV[1]

redis.call('select',1)
--get all setting
--expireTimeBetween2Req//expireTimeOfRejectTimes/timesInDuration/duration/rejectTimesThreshold
local value=redis.call('hgetall','intervalCheckBaseIP')
local setting={}
for i=1,#value do
	setting[value[i]]=tonumber(value[i+1])
	i=i+2
end

redis.call('select',2)
local expireTimeOfReqList=3*setting.duration
--return (expireTimeOfReqList)
--increase reject times and set reject flag and TTL based on reject times
local setRejectFlagBasedOnRejectTimes=function()
	local newRejectTimes=tonumber(redis.call('incr',ip..':rejectTimes'))
	redis.call('expire',ip..':rejectTimes',setting.expireTimeOfRejectTimes)	
	local ttl
	
	local ttlSecond={30,60,120,240,600}
	local timesExceedThreshold=newRejectTimes-tonumber(setting.rejectTimesThreshold)
	
	if( 0 >= timesExceedThreshold ) then
	--return (110)
		return {0}
	end
	
	if( timesExceedThreshold > #ttlSecond ) then
		ttl=ttlSecond[#ttlSecond]
	else
		ttl=ttlSecond[timesExceedThreshold]
	end 

	--print(ttl)
	redis.call('set',ip..':rejectFlag',0)
	redis.call('expire',ip..':rejectFlag',ttl)
--	redis.call('set',ip..':rejectTimes',0)
	
		--return (1100)
	return {0}
		
end


--check Flag
if(1==redis.call('exists',ip..':rejectFlag')) then
	setRejectFlagBasedOnRejectTimes()
	local leftTTL=redis.call('ttl',ip..':rejectFlag')
	--local r={rc=10,msg=leftTTL}
	return {10,leftTTL}
	--return ({rc=10,msg=leftTTL})
end 

if(1==redis.call('exists',ip..':lastReqFlag')) then
	setRejectFlagBasedOnRejectTimes()
	return {11}
end

if(1==redis.call('exists',ip..':reqListFlag')) then
	setRejectFlagBasedOnRejectTimes()
	return {12}
end


--save last req time
redis.call('set',ip..':lastReqFlag',0)
redis.call('pexpire',ip..':lastReqFlag',setting.expireTimeBetween2Req)
--check times in duration
local currentTimes=redis.call('llen',ip..'reqList')
local definedTimes=setting.timesInDuration

--local currentTime=os.time()
if(currentTimes<definedTimes) then
	redis.call('rpush',ip..':reqList',currentTime)
	redis.call('expire',ip..':reqList',expireTimeOfReqList)
--	return (setting.expireTimeBetween2Req)
		--return (setting.duration)
	return {0}
else
	local firstReqTime=tonumber(redis.call('lindex',ip..':reqList',0))	
	if(firstReqTime+setting.duration>=currentTime) then
		redis.call('lpop',ip..':reqList')
		redis.call('rpush',ip..':reqList',currentTime)
		redis.call('expire',ip..':reqList',expireTimeOfReqList)
		--	return (1100)
		return {0}
	else
		setRejectFlagBasedOnRejectTimes()
		--calc TTL of next valid time
		local nextValidTTL=Math.ceil((firstReqTime+setting.expireTimeOfReqLis-currentTime)/1000)
		redis.call('set',ip..':reqListFlag',0)
		redis.call('expire',ip..':reqListFlag',nextValidTTL)
		redis.call('expire',ip..':reqList',expireTimeOfReqList)
		--	return (11000)
		return {0}
	end
end
--return (setting.expireTimeBetween2Req)
--return ('0')
--return (expireTimeOfReqList)
