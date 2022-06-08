/*
 * @Descripttion: 
 * @Author: Cxy
 * @Date: 2022-06-02 14:15:49
 * @LastEditors: Cxy
 * @LastEditTime: 2022-06-08 15:12:40
 * @FilePath: \ehomes-admind:\gitHubBlog\blogServe\router\live.js
 */
const { find, updateMany } = require('../mongo/db')
const interfaceReturn = require('./until')

// @查询直播房间信息
const getLiveData = async (req, res) => {
  const { admin_Code } = req.query
  const data = await find('users', { admin_Code }, {}, { room_Title: 1, room_Description: 1, id: 1, live_Image: 1 })
  interfaceReturn('find', data, '查询成功', '查询失败', res)
}

// @房间id查重
const idDuplicateCheck = async (req, res) => {
  const { id } = req.query
  const data = await find('users', { id })
  interfaceReturn('find', data, '已有此ID的房间，请输入其他ID', '未查到此ID', res)
}

// @修改直播房间信息
const setLiveData = async (req, res) => {
  const { _id } = req.body
  const data = await updateMany('users', { _id }, req.body)
  interfaceReturn('updateMany', data, '房间信息修改成功', '房间信息修改失败', res)
}

// @获取直播列表及房间信息
const getLiveBroadcast = async (req, res) => {
  const data = await find('users', req.query, {}, { room_Title: 1, id: 1, live_Image: 1, head_Portrait: 1, nick_Name: 1, admin_Code: 1, room_Description: 1, room_Key: 1, room_Heat: 1 })
  interfaceReturn('find', data, '直播列表查询成功', '直播列表查询失败', res)
}

// @修改房间热的
const setLiveHeat = async (req, res) => {
  const { id, room_Heat } = req.body
  const data = await updateMany('users', { id }, { $inc: { room_Heat } })
  interfaceReturn('updateMany', data, '直播列表查询成功', '直播列表查询失败', res)
}

// @获取推流密钥
const { desEncryption } = require('../until/des')
const { base64Encryption } = require('../until/base64')
const getRoomKey = async (req, res) => {
  const { id } = req.body
  const room_Code = base64Encryption(id + '')
  const room_Time = desEncryption(JSON.stringify({ time: new Date().getTime() + 1000 * 60 * 5, id }))
  const room_Key = room_Code + '?rtExp=' + room_Time
  const data = await updateMany('users', { id }, { room_Key })
  interfaceReturn('updateMany', { ...data, room_Key }, '推流密钥获取成功', '推流密钥获取失败', res)
}

module.exports = {
  getLiveData,
  idDuplicateCheck,
  setLiveData,
  getLiveBroadcast,
  setLiveHeat,
  getRoomKey
}