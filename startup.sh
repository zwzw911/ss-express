#! /bin/sh
function print_inf(){
	echo "INF: $1"
}
function print_wrn(){
	echo "WRN: $1"
}
function print_err(){
	echo "ERR: $1"
}

#$1: process name used in trace
#$2: real process name
#$3: command
function checkProcess(){

	process_name=$1
	real_process_name=$2
	print_inf "Ready to check $process_name......"
	process_pid=`ps uxa | grep -i "$real_process_name" | grep -v grep | sed -n "1p" | awk '{print $2}'`
	#echo $process_pid
	if [ -z $process_pid ] ;then
		print_wrn "$process_name not running now, start it now."
		#mongod --logpath /home/db/log/mongodb.log --logRotate rename --timeStampFormat iso8601-local   --dbpath /home/db/
		# echo $cmd
		case $process_name in
		"mongod" )
			nohup mongod --logpath /home/db/log/mongodb.log --logRotate rename --timeStampFormat iso8601-local   --dbpath /home/db/ &;;
		"node" )
			nohup node /home/ss-express/bin/www &;;
		"nginx" )
			/usr/local/sbin/nginx;;
		esac
		sleep 2
		process_pid=`ps uxa | grep -i "$real_process_name" | grep -v grep | awk '{print $2}'`
		echo $process_pid
		if [ -z $process_pid ];then
			print_err "$process_name start failed, please run it manually."
			exit 1
		else
			print_inf "$process_name start successfully."
		fi
	else
			print_inf "$process_name is running now."
	fi
}

node_www="/home/ss-express/bin/www"
checkProcess "mongod" "mongod" 
checkProcess "node" "node $node_www" 
checkProcess "nginx" "nginx: master"
exit 0  