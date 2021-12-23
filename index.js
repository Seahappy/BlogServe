/*
* @Author: Cxy
* @Date: 2021-02-25 14:03:18
 * @LastEditors: Cxy
 * @LastEditTime: 2021-12-23 17:34:50
 * @FilePath: \blog\blogserve\index.js
*/
/* 引入日志 */
const { console, err, info, reqS } = require('./log')
const { verifyJwt } = require('./jwt')
/* 接口调用频次拦截器 */
const interfaceLimit = require('./router/interface')
const { tokenC, operationC } = require('./router/code')
const express = require('express')
const app = express()
/* HTTP安全头信息启用 */
const helmet = require("helmet")
app.use(helmet())
/* 静态资源路径设置 */
app.use(express.static('public'))
/* cors 插件解决跨域问题 */
const cors = require('cors')
app.use(cors())
/* 解析body请求体 */
let bodyParse = require('body-parser')
app.use(bodyParse.json({ extended: false, limit: '50mb' }))
app.use(bodyParse.urlencoded({ extended: true, limit: '50mb' }))
/* 不验证token的路由 */
const RouteNotVerified = ['getToken', 'checkToken', 'articleFind', 'articleTagFind', 'articleFindNewLike', 'ArticlePrevNext',
  'articleViewPage', 'articleSearchFuzzy', 'reg', 'randomToArticles', 'ViewsTotle', 'GuessYouLike', 'commentGetArticle',
  'WebsiteMessage', 'GetWebsiteMessage', 'TimeLineData', 'articleStatistics', 'homePageStatistics', 'homePageStatisticsNum',
  'setRealIPLocation']
/* 全局请求配置及请求日志打印 */
app.use(async (req, res, next) => {
  const startT = new Date()
  res.on('close', () => {
    reqS(startT.toLocaleString() + ' ' + (req.headers['x-real-ip'] || req.headers['x-forwarded-for']) + req.url + '  ' + req.method + ' ⏱ ' + (+new Date() - +startT) + 'ms')
  })
  const { path, headers } = req
  if (!/routerData|ViewsTotle/gi.test(path.slice(1))) {
    const informationIP = await interfaceLimit(headers, res)
    if (informationIP) return informationIP
  }
  if (RouteNotVerified.includes(path.slice(1)) || req.path.includes('blogImg')) {
    next()
  } else {
    const TK = verifyJwt(headers.authorization)
    if (TK) {
      next()
    } else if (!headers.authorization) {
      res.send({ code: operationC, massage: '请先登录后再操作' })
    } else {
      res.send({ code: tokenC, massage: '账号过期请重新登录' })
    }
  }
})

const port = 1314                   // 端口

/* 引入路由文件 */
const router = require('./router')
app.use('/', router)

/* socket 启动 */
const socket = require('./socket')
socket()

const fs = require('fs')
const key = fs.readFileSync('../2_www.seahappy.xyz.key')
const cert = fs.readFileSync('../1_www.seahappy.xyz_bundle.crt')
const options = {
  key: key,
  cert: cert
};
const https = require('https')
https.createServer(options, app).listen(port, '0.0.0.0', () => {
  console('🌈🌈🌈   服务起来了11！！！')
})
