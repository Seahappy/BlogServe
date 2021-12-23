/*
 * @Author: Cxy
 * @Date: 2021-05-21 20:43:07
 * @LastEditors: Cxy
 * @LastEditTime: 2021-12-01 20:02:48
 * @FilePath: \blog\blogserve\socket\chat.js
 */
const { find, updateMany } = require('../mongo/db')
const io = require('./server')
module.exports = send_Message_Data = socket => {
  socket.on('send_Message_Data', async data => {
    const { send_People_Data, receive_People_Data, chat_Content_Time } = data
    const send_User = await find('users', { admin_Code: send_People_Data.admin_Code })
    const send_Chat_Data = send_User.data[0].chat_Data
    const send_User_Flag = Object.keys(send_Chat_Data).includes(receive_People_Data.admin_Code)
    if (send_User_Flag) {
      send_Chat_Data[receive_People_Data.admin_Code].chat_Content.push(chat_Content_Time)
      send_Chat_Data[receive_People_Data.admin_Code] = { send_People_Data, receive_People_Data, chat_Content: send_Chat_Data[receive_People_Data.admin_Code].chat_Content }
      await updateMany('users', { admin_Code: send_People_Data.admin_Code }, { chat_Data: send_Chat_Data })
    } else {
      send_Chat_Data[receive_People_Data.admin_Code] = { send_People_Data, receive_People_Data, chat_Content: [chat_Content_Time] }
      await updateMany('users', { admin_Code: send_People_Data.admin_Code }, { chat_Data: send_Chat_Data })
    }
    const receive_User = await find('users', { admin_Code: receive_People_Data.admin_Code })
    const receive_Chat_Data = receive_User.data[0].chat_Data
    const receive_User_Flag = Object.keys(receive_Chat_Data).includes(send_People_Data.admin_Code)
    const receive_chat_Content_Time = Object.assign(chat_Content_Time, { send_Receive: 2 })
    if (receive_User_Flag) {
      receive_Chat_Data[send_People_Data.admin_Code].chat_Content.push(receive_chat_Content_Time)
      receive_Chat_Data[send_People_Data.admin_Code] = { send_People_Data: receive_People_Data, receive_People_Data: send_People_Data, chat_Content: receive_Chat_Data[send_People_Data.admin_Code].chat_Content }
      await updateMany('users', { admin_Code: receive_People_Data.admin_Code }, { chat_Data: receive_Chat_Data })
    } else {
      receive_Chat_Data[send_People_Data.admin_Code] = { send_People_Data: receive_People_Data, receive_People_Data: send_People_Data, chat_Content: [receive_chat_Content_Time] }
      await updateMany('users', { admin_Code: receive_People_Data.admin_Code }, { chat_Data: receive_Chat_Data })
    }
    io.to(receive_User.data[0].socket_Id).emit('receive_Message_Data', { send_People_Data: receive_People_Data, receive_People_Data: send_People_Data, chat_Content_Time: receive_chat_Content_Time });
  })
}