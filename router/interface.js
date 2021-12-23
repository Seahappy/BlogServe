/*
 * @Descripttion: 
 * @Author: Cxy
 * @Date: 2021-11-24 10:56:49
 * @LastEditors: Cxy
 * @LastEditTime: 2021-12-11 23:01:17
 * @FilePath: \blog\blogserve\router\interface.js
 */

const { find, insertOne } = require('../mongo/db')

const realIp_Database = global.realIp_Database = {}
module.exports = interfaceLimit = async (headers, res) => {
  const public_IP = headers['x-real-ip']
  if (Object.keys(realIp_Database).includes(public_IP)) {
    const { access_Time, limit_Number, limit_Time, rest_Time, visits_Num, frozen_State } = realIp_Database[public_IP]
    if(frozen_State === 1) {
      return res.send({ code: 200, data: [], remainingTime: 1, massage: '此IP地址已被冻结，解除冻结请联系管理员' })
    }
    if (new Date().getTime() - access_Time < 0) {
      return res.send({ code: 200, data: [], remainingTime: access_Time - new Date().getTime(), massage: '由于此IP请求次数过多服务器拒绝了你的请求，休息一下吧' })
    } else {
      if (visits_Num > limit_Number) {
        if (new Date().getTime() - access_Time < 60 * 1000 * limit_Time) {
          realIp_Database[public_IP].visits_Num = 0
          realIp_Database[public_IP].access_Time = new Date().getTime() + 1000 * 60 * rest_Time
          return res.send({ code: 200, data: [], remainingTime: 1000 * 60 * rest_Time, massage: '由于此IP请求次数过多服务器拒绝了你的请求，休息一下吧' })
        } else {
          realIp_Database[public_IP].visits_Num = 0
          realIp_Database[public_IP].access_Time = new Date().getTime()
        }
      } else if (new Date().getTime() - access_Time > 60 * 1000 * limit_Time) {
        if (visits_Num > limit_Number) {
          realIp_Database[public_IP].visits_Num = 0
          realIp_Database[public_IP].access_Time = new Date().getTime() + 1000 * 60 * rest_Time
          return res.send({ code: 200, data: [], remainingTime: 1000 * 60 * rest_Time, massage: '由于此IP请求次数过多服务器拒绝了你的请求，休息一下吧' })
        } else {
          realIp_Database[public_IP].visits_Num = 0
          realIp_Database[public_IP].access_Time = new Date().getTime()
        }
      } else {
        ++realIp_Database[public_IP].visits_Num
      }
    }
  } else {
    const data = await find('network', { public_IP }, {}, {
      'limit_Number': 1, 'limit_Time': 1, 'rest_Time': 1, 'frozen_State': 1, '_id': 0
    })
    if(data.data[0]?.frozen_State === 1) {
      return res.send({ code: 200, data: [], remainingTime: 1, massage: '此IP地址已被冻结，解除冻结请联系管理员' })
    }
    if (!data.data.length) {
      if (public_IP) await insertOne('network', { public_IP })
      const accessData = await find('network', { public_IP }, {}, {
        'limit_Number': 1, 'limit_Time': 1, 'rest_Time': 1, 'frozen_State': 1, '_id': 0
      })
      realIp_Database[public_IP] = { visits_Num: 1, access_Time: new Date().getTime(), ...accessData.data[0] }
    } else {
      realIp_Database[public_IP] = { visits_Num: 1, access_Time: new Date().getTime(), ...data.data[0] }
    }
  }
}