-- get adminLogin state
local sessionId=ARGV[1]
redis.call('select',3)
--check if rejectFlag set
if(1==redis.call('exists','adminLogin:rejectFlag')) then
	--reach max try times per day
	return {1}
end


--check if sessionId:adminLogin exist; if exists, already login
if(1==redis.call('exists',sessionId..':adminLogin')) then
	--already login
	return {0}
else
	--not login
	return {2}
end