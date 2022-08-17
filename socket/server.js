/*
 * @Author: Cxy
 * @Date: 2021-05-06 16:10:07
 * @LastEditors: Cxy
 * @LastEditTime: 2022-07-05 08:43:16
 * @FilePath: \ehomes-admind:\giteeBlog\blogServe\socket\server.js
 */
const app = require('express')()
const SSL_LOCATION = process.env.NODE_ENV === 'production' ? '/root/SSL/' : '../'
const fs = require('fs')
const key = fs.readFileSync(SSL_LOCATION + '2_www.seahappy.xyz.key')
const cert = fs.readFileSync(SSL_LOCATION + '1_www.seahappy.xyz_bundle.crt')
const options = {
    key: key,
    cert: cert
};
const server = require('https').createServer(options, app)
const io = require('socket.io')(server, {
    path: "/SeaHappy-Blog",
})
server.listen(520)
module.exports = io