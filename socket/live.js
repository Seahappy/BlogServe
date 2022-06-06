/*
 * @Descripttion: 
 * @Author: Cxy
 * @Date: 2022-06-05 16:52:42
 * @LastEditors: Cxy
 * @LastEditTime: 2022-06-06 16:17:46
 * @FilePath: \ehomes-admind:\blog\blogServe\socket\live.js
 */

module.exports = live = socket => {
  socket.on('join_Room', (data, callback) => {
    socket.join(data.room)
    const send_Data = { ...data, time: new Date().getTime() }
    callback(send_Data)
    socket.to(data.room).emit('receive_Msg', send_Data)
  })
  socket.on('send_Msg', (data, callback) => {
    const send_Data = { ...data, time: new Date().getTime() }
    callback(send_Data)
    socket.to(data.room).emit('receive_Msg', send_Data)
  })
  socket.on('leave_Room', (data, callback) => {
    socket.leave(data.room)
    const send_Data = { ...data, time: new Date().getTime() }
    callback(send_Data)
    socket.to(data.room).emit('receive_Msg', send_Data)
  })
}