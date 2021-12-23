/*
 * @Author: Cxy
 * @Date: 2021-02-26 11:03:44
 * @LastEditors: Cxy
 * @LastEditTime: 2021-11-18 15:48:47
 * @FilePath: \blog\blogserve\log.js
 */
const log4js = require('log4js');
const LOGCONFIG = {
  replaceConsole: false,
  appenders: {
    console: { type: 'console' },
    err: {
      type: 'file', filename: 'log/logerr/err',
      layout: {
        type: 'pattern',
        "pattern": "❌[%d] (%x{pid}) %p - %m",
        "tokens": { "pid": function () { return process.pid; } }
      },
      maxLogSize: 1024 * 512, backups: 1, pattern: 'yyyy-MM-dd.log', alwaysIncludePattern: true
    },
    info: {
      type: 'file', filename: 'log/loginfo/info', layout: {
        type: 'pattern',
        "pattern": "⭐[%d] (%x{pid}) %p - %m",
        "tokens": { "pid": function () { return process.pid; } }
      },
      maxLogSize: 1024 * 512, backups: 1, pattern: 'yyyy-MM-dd.log', alwaysIncludePattern: true
    },
    reqS: {
      type: 'file', filename: 'log/logreqs/reqs', layout: {
        type: 'pattern',
        "pattern": "🟢[%d] (%x{pid}) %p - %m",
        "tokens": { "pid": function () { return process.pid; } }
      }, maxLogSize: 1024 * 512, backups: 50, pattern: 'yyyy-MM-dd.log', alwaysIncludePattern: true
    }
  },
  categories: {
    default: { appenders: ['console'], level: 'all' },
    err: { appenders: ['err', 'console'], level: 'error' },
    info: { appenders: ['info', 'console'], level: 'info' },
    reqS: { appenders: ['reqS', 'console'], level: 'trace' }
  }
}
log4js.configure(LOGCONFIG);
/* 普通打印 */
exports.console = (data) => {
  const log = log4js.getLogger('console');
  log.debug(data)
}
/* 错误 */
exports.err = (data) => {
  const log = log4js.getLogger('err');
  log.error(data)
}
/* 信息 */
exports.info = (data) => {
  const log = log4js.getLogger('info');
  log.info(data)
}
/* 请求 */
exports.reqS = (data) => {
  const log = log4js.getLogger('reqS');
  log.trace(data)
}