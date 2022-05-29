/*
 * @Descripttion: 
 * @Author: Cxy
 * @Date: 2022-05-25 13:39:47
 * @LastEditors: Cxy
 * @LastEditTime: 2022-05-26 09:21:24
 * @FilePath: \ehomes-admind:\blog\blogServe\router\chat.js
 */
const { aggre } = require('../mongo/db')
const interfaceReturn = require('./until')

// @获取当前账号一星期内所有聊天记录
const getChatData = async (req, res) => {
  const { admin_Code } = req.query
  const data = await aggre('chat', [
    {
      $match: {
        $or: [{ send_Admin_Code: admin_Code }, { receive_Admin_Code: admin_Code }],
        sending_Time: { $gte: new Date().getTime() - 7 * 24 * 60 * 60 * 1000 }
      }
    },
  ])
  const dataChat = data.data?.reduce((prev, c) => {
    const code = c.send_Admin_Code === admin_Code ? c.receive_Admin_Code : c.send_Admin_Code
    if (Object.keys(prev).includes(code)) {
      prev[code].push(c)
    } else {
      prev[code] = [c]
    }
    return prev
  }, {})
  interfaceReturn('find', { data: dataChat, countNum: 1 }, '获取成功', '获取失败', res)
}

// @获取特定账号的聊天记录


module.exports = {
  getChatData
}