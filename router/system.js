/*
 * @Descripttion: 
 * @Author: Cxy
 * @Date: 2021-09-23 20:45:10
 * @LastEditors: Cxy
 * @LastEditTime: 2022-01-07 15:35:00
 * @FilePath: \blog\blogserve\router\system.js
 */

const si = require('systeminformation')
const shell = require('shelljs')
const os = require('os')

// 全局配置shell命令禁止控制台输出
shell.config.silent = true
const iconv = require('iconv-lite')

const serverInfo = ['mongod.exe', 'node.exe', 'cmd.exe', 'nginx.exe']
const valueObject = {
  // 网速 rx 接收 tx 传输
  networkStats: 'rx_sec, rx_bytes, tx_sec, tx_bytes, ms',
  time: '*',
  // cpu负载
  currentLoad: 'currentLoad,currentLoadUser, currentLoadSystem',
  fullLoad: '*',
  // 磁盘状态
  fsSize: '*',
  // 内存状态
  // mem: 'total, free, used',
  // 操作系统
  // osInfo: 'logofile, hostname',
  processes: '*'
}

function getSystemD() {
  return new Promise(resolve => {
    si.get(valueObject).then(data => {
      const proceObjList = data.processes.list.filter(c => serverInfo.includes(c.name) && !isNaN(c.memRss)).reduce((prev, cur) => {
        if (Object.keys(prev).includes(cur.name)) {
          Object.keys(cur).forEach(c => {
            if (typeof cur[c] === 'number') prev[cur.name][c] += cur[c]
          })
        } else {
          prev[cur.name] = cur
        }
        return prev
      }, {})
      data.proceList = Object.values(proceObjList)
      delete data.processes
      resolve(data)
    })
  })
}

let prevDownD = 0
let prevUpD = 0
function getNetStats(selectSecondsT) {
  return new Promise(resolve => {
    shell.exec('netstat -e', { encoding: 'base64' }, (code, data) => {
      if (code !== 0) return { describe: '获取以太网信息失败' }
      const netDownUp = (iconv.decode(iconv.encode(data, 'base64'), 'gb2312')).toString().split(/\s+/)
      const startIndex = netDownUp.indexOf('字节')
      const rx_bytes = Number(netDownUp[startIndex + 1])
      const tx_bytes = Number(netDownUp[startIndex + 2])
      const rx_sec = ((rx_bytes - prevDownD) / selectSecondsT).toFixed(0)
      const tx_sec = ((tx_bytes - prevUpD) / selectSecondsT).toFixed(0)
      prevDownD = rx_bytes
      prevUpD = tx_bytes
      resolve({
        rx_sec: rx_sec === (rx_bytes / selectSecondsT).toFixed(0) ? null : rx_sec,
        rx_bytes,
        tx_sec: tx_sec === (tx_bytes / selectSecondsT).toFixed(0) ? null : tx_sec,
        tx_bytes
      })
    })
  })
}

let sysTemAllData = {}
const timeIntSys = async () => {
  const systemData = await getSystemD()
  // const networkStats = await getNetStats(selectSecondsT)
  // 内存 mem: 'total, free, used',
  const free = os.freemem()
  const total = os.totalmem()
  const mem = { free, total, used: total - free }
  // 系统信息 osInfo: 'logofile, hostname'
  const osInfo = { logofile: os.type(), hostname: os.hostname() }
  sysTemAllData = Object.assign(systemData, { mem }, { osInfo }, { nodeUptime: process.uptime() })
}

setInterval(() => {
  timeIntSys()
}, 5000)

const getSystemData = async (_, res) => {
  res.send({ code: 200, data: sysTemAllData })
}

// // 返回一个包含 1、5、15 分钟平均负载的数组。
// console('loadavg : ' + os.loadavg());

module.exports = { getSystemData }