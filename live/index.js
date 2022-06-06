/*
 * @Descripttion: 
 * @Author: Cxy
 * @Date: 2022-05-30 19:01:50
 * @LastEditors: Cxy
 * @LastEditTime: 2022-06-05 16:50:08
 * @FilePath: \ehomes-admind:\blog\blogServe\live\index.js
 */
const NodeMediaServer = require("node-media-server")
const { updateMany, find } = require('../mongo/db')
const { desDecrypt } = require('../until/des')

const config = {
  ogType: 3,
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8442,
    allow_origin: '*'
  }
}

const live = new NodeMediaServer(config)

// 推流前校验，限制
live.on('prePublish', async (liveId) => {
  const session = live.getSession(liveId)
  const rtExp = session.publishArgs.rtExp
  if (!rtExp) return session.reject();
  const rtExpDes = desDecrypt(rtExp)
  const { time, id } = JSON.parse(rtExpDes)
  if (time < new Date().getTime()) {
    return session.reject();
  }
  await updateMany('users', { id }, { live_Status: 1 })
})

// 停推重置直播间直播状态
live.on('donePublish', async (liveId) => {
  const session = live.getSession(liveId)
  const rtExp = session.publishArgs.rtExp
  if (rtExp) {
    const rtExpDes = desDecrypt(rtExp)
    const { id } = JSON.parse(rtExpDes)
    await updateMany('users', { id }, { live_Status: 0, room_Key: '' })
  }
})

// 拉流前校验，限制
live.on('prePlay', async (liveId, streamPath) => {
  const session = live.getSession(liveId);
  const playArgesRtExp = session.playArgs.rtExp
  if (!playArgesRtExp) return session.reject()
  const rtExpDes = desDecrypt(playArgesRtExp)
  const { id } = JSON.parse(rtExpDes)
  const { data } = await find('users', { id })
  if (!data[0].live_Status) return session.reject()
  const findUrl = '/seaLive/' + data[0].room_Key
  const currentUrl = streamPath + '?rtExp=' + playArgesRtExp
  if (findUrl !== currentUrl) return session.reject()
  if (playArgesRtExp) {
    await updateMany('users', { id }, { $inc: { room_Heat: 1 } })
  }
})

// 停拉重置直播间热度
live.on('donePlay', async (liveId) => {
  const session = live.getSession(liveId);
  const playArgesRtExp = session.playArgs.rtExp
  const rtExpDes = desDecrypt(playArgesRtExp)
  const { id } = JSON.parse(rtExpDes)
  await updateMany('users', { id }, { $inc: { room_Heat: -1 } })
});

module.exports = live