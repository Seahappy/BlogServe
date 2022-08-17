#!/bin/bash

# 强调当前执行的用户权限
npm install --unsafe-perm=true

startTime_s=`date +%s`
serve_s="/root/blogServe"
serve_j="/var/lib/jenkins/workspace/blogServe"

# npm源切换
npm config set registry https://registry.npm.taobao.org
npm install
npm run build

if [ $? -eq 1 ]
then 
  echo "打包失败"
  exit 1
fi

# 复制文件夹到服务器主目录
cp -rf $serve_j/blogServe/* $serve_s
cp -rf $serve_j/public $serve_s

# 安装依赖
npm install --prefix $serve_s

# 热加载pm2进程守护
pm2 restart blogServe

# 统计时间
endTime_s=`date +%s`
durationTime=$[ $endTime_s - $startTime_s ]
echo -e "\033[1;32m 用时：${durationTime}s \033[0m"