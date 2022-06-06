/*
 * @Author: Cxy
 * @Date: 2021-05-21 20:57:27
 * @LastEditors: Cxy
 * @LastEditTime: 2022-06-06 15:03:09
 * @FilePath: \ehomes-admind:\blog\blogServe\socket\index.js
 */
const io = require('./server')
const { console } = require('../log')
const { verifyJwt } = require('../jwt')
const update_Find_Online = require('./until')
const login = require('./login')
const chat = require('./chat')
const live = require('./live')
const whiteList = ['Get_Login_Users', 'Current_Out_Users', 'send_Msg', 'receive_Msg', 'join_Room', 'leave_Room']
const socketIo = () => {
  io.on('connection', async socket => {
    console('🌈🌈🌈   socket服务起来了！！！')
    // 链接socket时或推送信息时验证token
    socket.use((a, next) => {
      const TK = verifyJwt(socket.handshake.auth.token)
      if (TK || whiteList.includes(a[0])) {
        next()
      } else {
        socket.emit('checkToken', '账号过期请重新登录')
      }
    })
    // 客户端退出登录或断开后清空登录信息，改为离线状态
    socket.on('disconnecting', async data => {
      // 客户端断开连接时，根据当前客户端已存socketID初始化登录信息
      const Login_Users = await update_Find_Online(data, socket, false)
      // 向其他链接客户端广播此人退出登录
      socket.to('rootRoom').emit('Login_Users', { data: Login_Users })
      console('🌈🌈🌈   socket服务断开链接！！！')
    })
    login(socket)
    chat(socket)
    live(socket)
  })

}
module.exports = socketIo