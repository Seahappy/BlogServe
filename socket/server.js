/*
 * @Author: Cxy
 * @Date: 2021-05-06 16:10:07
 * @LastEditors: Cxy
 * @LastEditTime: 2021-05-22 19:23:52
 * @FilePath: \pinanStaged:\blog\blogserve\socket\server.js
 */
const app = require('express')()
const fs = require('fs');
const key = fs.readFileSync('../2_www.seahappy.xyz.key');
const cert = fs.readFileSync('../1_www.seahappy.xyz_bundle.crt');
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