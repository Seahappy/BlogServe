/*
 * @Author: Cxy
 * @Date: 2021-05-23 15:03:35
 * @LastEditors: Cxy
 * @LastEditTime: 2021-12-01 15:09:52
 * @FilePath: \blog\blogserve\socket\login.js
 */
const io = require('./server')
const update_Find_Online = require('./until')
const { find, updateMany } = require('../mongo/db')
module.exports = login = socket => {
  // 客户端刷新页面时，替换sockeID并改变登录状态
  socket.on('Refresh_Get_User', async data => {
    // // 获取登陆人用户名
    const online_Data = await update_Find_Online(data, socket)
    const Users_Chat_Content = await find('users', { admin_Code: data.admin_Code })
    socket.emit('Login_Users', { data: online_Data, Users_Chat_Content: Users_Chat_Content.data[0].chat_Data })
    socket.broadcast.emit('Login_Users', { data: online_Data })
  })
  // 登录前判断登录人是否多点登录，已多点登录推送当前登陆人消息并询问是否强制登录，未多点登录直接登录成功并改变登录状态
  socket.on('Get_Login_Users', async data => {
    const { admin_Code, pass_Word } = data
    const Users_Out_In = await find('users', { admin_Code })
    const { countNum, data: user_Data } = Users_Out_In
    if (countNum === 0) return socket.emit('Login_Users', { massage: '账号未注册，请注册后登录', code: 403 })
    if (user_Data[0].pass_Word !== pass_Word) return socket.emit('Login_Users', { massage: '密码输入有误，请重新输入', code: 404 })
    if (user_Data[0].frozen_State === 1) return socket.emit('Login_Users', { massage: '登录账户已冻结', code: 405 })
    const Users = user_Data.map(c => {
      const { admin_Code, admin_level, created_At, nick_Name, head_Portrait, brief_Introduction, My_Qq, My_Wb, My_Wx, My_Reward_Wx, My_Reward_Zfb } = c
      return { admin_Code, admin_level, created_At, nick_Name, head_Portrait, brief_Introduction, My_Qq, My_Wb, My_Wx, My_Reward_Wx, My_Reward_Zfb }
    })[0]
    if (user_Data[0].online_Offline === 0) {
      const Login_Users = await update_Find_Online(data, socket)
      socket.emit('Login_Users', { data: Login_Users, Users, Users_Chat_Content: user_Data[0].chat_Data, code: 200 })
      socket.broadcast.emit('Login_Users', { data: Login_Users, code: 200 }); // 发送给其他人
    } else {
      socket.emit('Login_Users', { massage: '账号已在其他位置登录，是否强制登录', code: 400, Users, data: [] })
    }
  })
  // 接收退出信息并强制登出其他登陆人客户端及替换当前登陆人的socketID
  socket.on('Current_Out_Users', async data => {
    const { admin_Code } = data
    const login_User = await find('users', { admin_Code })
    // 通过该连接对象to(socketId)与链接到这个对象的客户端进行单独通信
    io.to(login_User.data[0].socket_Id).emit('Ago_Login_Users', '账号在其他位置登录，请留意被盗');
    const Login_Users = await update_Find_Online(data, socket)
    socket.broadcast.emit('Login_Users', { data: Login_Users, code: 200 }); // 发送给其他人
    socket.emit('Login_Users', { Users_Chat_Content: login_User.data[0].chat_Data, data: Login_Users })
  })
  // 强制用户下线
  socket.on('Forced_Offline', async data => {
    const { admin_Code } = data
    const user_Data = await find('users', { admin_Code: admin_Code }, {}, { socket_Id: 1 })
    io.to(user_Data.data[0].socket_Id).emit('Ago_Login_Users', '您已被管理员强制下线');
    await updateMany('users', { admin_Code }, { socket_Id: '', online_Offline: 0 })
  })
  // 冻结账户
  socket.on('frozen_Person', async data => {
    const { admin_Code } = data
    const user_Data = await find('users', { admin_Code: admin_Code }, {}, { socket_Id: 1 })
    io.to(user_Data.data[0].socket_Id).emit('Ago_Login_Users', '该账户已冻结');
    await updateMany('users', { admin_Code }, { socket_Id: '', online_Offline: 0, frozen_State: 1 })
  })
}