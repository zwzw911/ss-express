# ss-express
## introduce
In daily work, we may get lots of knowledge or experience. Generally, we record them into file, like word or txt, but with such file increased, find them became a problem. 
ss_express provide an easy way to record and find them based on web. It use MEAN stack.

## CentOS7  
1. use `ip addr` check ip address, found not configure
2. `cd /etc/sysconfig/network-scripts`,`vi ifcfg-enoxxxxxxxxx`, change onboot=no to onboot=yes
3. restart network by exec `service network restart`  

##Installation
1. install git  
   `yum install git`
1. install nodejs   
   1.1 download Nodejs: `wget --no-check-certificate https://nodejs.org/dist/v4.2.1/node-v4.2.1-linux-x86.tar.gz`  
   1.2 extract file: `tar zxf node-v4.2.1-linux-x86.tar.gz`  
   1.3 configure to launch node/npm global: in home directory, `vi ~/.bashrc`, add one line `export PATH=$PATH:xxx/node-v4.2.1-linux-x86/bin` , then exec `source ~/.bashrc`
         or  
         `ln -s /home/kun/mysofltware/node-v0.10.28-linux-x64/bin/node /usr/local/bin/node`  
         `ln -s /home/kun/mysofltware/node-v0.10.28-linux-x64/bin/node /usr/local/bin/node`  
2. install mongodb  
   2.1 download mongodb: https://www.mongodb.org/dr/fastdl.mongodb.org/linux/mongodb-linux-i686-3.0.7.tgz  
   2.2 extrace mongodb: `tar zxf mongodb-linux-i686-3.0.7.tgz`  
   2.3 configure to launch mongodb globally: `export PATH=$PATH:xxx/mongodb-linux-i686-3.0.7/bin`  
         or
       directly copy all files in mongodb-linux-i686-3.0.7/bin to linux bin defined in $PATH, like /usr/local/bin. `copy mongodb-linux-i686-3.0.7/bin/* /usr/local/bin`
   2.4 
1. get code:   
   `git clone@github.com:zwzw911/ss-express.git`
2. install realted module:
   first, install gcc compiler: `yum install gcc gcc-c++`  
   then, exec `yum install cairo cairo-devel cairomm-devel libjpeg-turbo-devel pango pango-devel pangomm pangomm-devel giflib-devel` to install cario which will be used by node-canvas  
   then, exec `npm install` to install related modules which include node-canvas  
3. enable index
   mongo maintain/index.js 
4. Upstart
   install Upstart to controll node
5. node cluster
6. nginx
