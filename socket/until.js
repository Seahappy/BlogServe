/*
 * @Author: Cxy
 * @Date: 2021-05-22 19:27:50
 * @LastEditors: Cxy
 * @LastEditTime: 2021-12-01 15:21:52
 * @FilePath: \blog\blogserve\socket\until.js
 */
/**
 * @description: 多点登录账户修改及在线人员查找
 * @param {*} data  admin_Code  账户名  Login_Device  登录设备类型
 * @param {*} socket  socket对象
 * @param {*} loginSingOut  true 登陆状态, false 登出状态
 * @return {data_arrangement} 在线人员信息
 */
const { find, findCount, updateMany } = require('../mongo/db')
const update_Find_Online = (data, socket, loginSingOut = true) => {
  const { admin_Code, Login_Device } = data
  return new Promise(async resolve => {
    if (loginSingOut) {
      await updateMany('users', { admin_Code }, { socket_Id: socket.id, online_Offline: 1, Login_Device })
    } else {
      await updateMany('users', { socket_Id: socket.id }, { socket_Id: '', online_Offline: 0 })
    }
    // 获取登陆人员信息
    const Login_Users = await find('users', { online_Offline: 1 }, {}, { _id: 0, admin_Code: 1, role_Name: 1, nick_Name: 1, Login_Device: 1, created_At: 1 })
    // 获取文章数量信息
    const article_Totle = await findCount('article', {})
    const article_Totle_Arrangement = article_Totle.countNum
    // 获取网站访问量信息
    const Views_Totle = await find('views', {}, {}, { count_Num: 1 })
    const Views_Totle_Arrangement = Views_Totle.data[0].count_Num
    resolve([{ countNum: Login_Users.data.length, Login_Users_Arrangement: Login_Users.data, code: 'ON_LINE' }, { countNum: article_Totle_Arrangement, code: 'ARTICLE_COUNT' }, { countNum: Views_Totle_Arrangement, code: 'VISITS' }])
  })
}

module.exports = update_Find_Online

// socket.emit() ：向建立该连接的客户端广播
// socket.broadcast.emit() ：向除去建立该连接的客户端的所有客户端广播
// io.sockets.emit() ：向所有客户端广播，等同于上面两个的和