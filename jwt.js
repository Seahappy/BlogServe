/*
 * @Author: Cxy
 * @Date: 2021-03-05 17:53:24
 * @LastEditors: Cxy
 * @LastEditTime: 2021-11-24 11:30:40
 * @FilePath: \blog\blogserve\jwt.js
 */
const jwt = require('jsonwebtoken')
const key = 'seahappy'
module.exports.signJwt = (payload, timeNum) => {
  return jwt.sign(payload, key, { expiresIn: timeNum * 60 * 60 * 24 })
}

module.exports.verifyJwt = (checkToken) => {
  return jwt.verify(checkToken, key, (err, data) => {
    if (err) {
      return false
    } else {
      return true
    }
  })
}
