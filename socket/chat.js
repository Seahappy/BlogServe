/*
 * @Author: Cxy
 * @Date: 2021-05-21 20:43:07
 * @LastEditors: Cxy
 * @LastEditTime: 2022-06-05 21:23:04
 * @FilePath: \ehomes-admind:\blog\blogServe\socket\chat.js
 */
const { find, insertOne } = require('../mongo/db')
const io = require('./server')
module.exports = chat = socket => {
  socket.on('send_Message_Data', async (data, callback) => {
    const { send_Admin_Code, send_Login_Device, send_Nick_Name, send_Head_Portrait, receive_Admin_Code, chat_Content } = data
    const sending_Time = new Date().getTime()
    const receive_Data = await find('users', { admin_Code: receive_Admin_Code })
    const { socket_Id, head_Portrait: receive_Head_Portrait, nick_Name: receive_Nick_Name, login_Device: receive_Login_Device } = receive_Data.data[0]
    const chat_Data = {
      send_Admin_Code, send_Login_Device, send_Nick_Name, send_Head_Portrait, receive_Admin_Code, chat_Content,
      sending_Time, receive_Head_Portrait, receive_Nick_Name, receive_Login_Device
    }
    callback(chat_Data)
    await insertOne('chat', chat_Data)
    io.to(socket_Id).emit('receive_Message_Data', chat_Data);
  })
}