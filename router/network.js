/*
 * @Descripttion: 
 * @Author: Cxy
 * @Date: 2021-11-25 15:40:42
 * @LastEditors: Cxy
 * @LastEditTime: 2021-12-14 14:20:12
 * @FilePath: \blog\blogserve\router\network.js
 */

const { aggreToAggreCount, aggre, updateMany, find } = require('../mongo/db')
const interfaceReturn = require('./until')
const fs = require('fs')
const codeMapData = fs.readFileSync('./public/map/cityMap.json') // 城市、乡镇对应code码的键值对

const getNetworkData = async (req, res) => {
  const { skip, limit } = req.query
  const data = await aggreToAggreCount('network', [
    { $lookup: { from: 'users', localField: 'admin_Code', foreignField: 'admin_Code', as: 'users' } },
    {
      $project: {
        'limit_Number': 1, 'limit_Time': 1, 'rest_Time': 1, 'public_IP': 1, 'update_Admin': 1, 'admin_Code': 1,
        'city_IP': 1, 'long_Lat': 1, 'location_IP': 1, 'province_IP': 1, 'county_IP': 1, 'frozen_State': 1,
        'users.nick_Name': 1, 'users.online_Offline': 1, 'users.admin_Code': 1, 'users.public_IP': 1
      }
    },
    { $sort: { created_At: -1 } },
    { $skip: Number(skip) },
    { $limit: Number(limit) }
  ])
  data.data.map(c => {
    const flowData = global.realIp_Database[c.public_IP]
    c.access_Time = flowData?.access_Time || 0
    c.visits_Num = flowData?.visits_Num || 0
    return c
  })
  interfaceReturn('find', data, '访问数据获取成功', '访问数据获取失败', res)
}

const getNetworkFlowData = async (req, res) => {
  const { public_IP } = req.body
  const flowData = global.realIp_Database[public_IP] || { visits_Num: 0, access_Time: 0, limit_Number: 0, limit_Time: 0 }
  const { visits_Num = 0, access_Time = 0, limit_Number = 0, limit_Time = 0 } = flowData
  const data = { visits_Num, access_Time, limit_Number, limit_Time }
  interfaceReturn('find', { data }, '访问数据获取成功', '访问数据获取失败', res)
}

const getNetworkPointData = async (req, res) => {
  const data = await aggre('network', [
    {
      $project: {
        'city_IP': 1, 'value': '$long_Lat', '_id': 0, 'county_IP': 1, 'province_IP': 1,
        'name': '$location_IP', 'admin_Code': 1, 'public_IP': 1
      }
    }
  ])
  interfaceReturn('find', data, '访问数据获取成功', '访问数据获取失败', res)
}

const getNetworkOnlineData = async (req, res) => {
  const netData = await aggre('users', [
    { $match: { online_Offline: 1 } },
    { $lookup: { from: 'networks', localField: 'public_IP', foreignField: 'public_IP', as: 'network' } },
    {
      $project: {
        'admin_Code': 1, 'nick_Name': 1, 'network.city_IP': 1, 'network.long_Lat': 1, '_id': 0,
        'network.county_IP': 1, 'network.province_IP': 1, 'network.location_IP': 1
      }
    }
  ])
  const data = netData.data.reduce((prev, c, i) => {
    const { network, ...newData } = { ...c, ...c.network[0] }
    prev[i] = newData
    return prev
  }, [])
  interfaceReturn('find', { data }, '访问数据获取成功', '访问数据获取失败', res)
}

const setNetworkData = async (req, res) => {
  const { _id, limit_Number, limit_Time, rest_Time, public_IP, frozen_State } = req.body
  const data = await updateMany('network', { _id }, { limit_Number, limit_Time, rest_Time, frozen_State })
  if (Object.keys(global.realIp_Database).includes(public_IP)) {
    Object.assign(global.realIp_Database[public_IP], { ...req.body })
  }
  interfaceReturn('updateMany', data, '数据修改成功', '数据修改失败', res)
}

// 地理位置名称修正
const locationCorrection = (loc) => {
  if (loc?.length) {
    const matchLoc = Object.keys(JSON.parse(codeMapData)).filter(c => {
      return c.search(new RegExp(loc, 'g')) > -1
    })
    if (matchLoc.length) {
      return matchLoc[0]
    } else {
      return loc
    }
  } else {
    return ''
  }
}
const setRealIPLocation = async (req, res) => {
  const { long_Lat, location_IP, county_IP, city_IP, province_IP } = req.body
  const public_IP = req.headers['x-real-ip']
  const data = await updateMany('network', { public_IP }, { long_Lat, location_IP, county_IP, city_IP: locationCorrection(city_IP), province_IP })
  interfaceReturn('updateMany', data, '数据修改成功', '数据修改失败', res)
}

const getMapJosnData = (req, res) => {
  const { locationName } = req.body
  const codeName = JSON.parse(codeMapData)[locationName]
  let data = {}
  if (locationName === 'china' || locationName === 'world') {
    data = fs.readFileSync('./public/map/' + locationName + '.json')
  } else if (codeName) {
    data = fs.readFileSync('./public/map/' + (/\d/gm.test(codeName) ? 'city/' : 'province/') + codeName + '.json')
    if (data[0] === 0xEF && data[1] === 0xBB && data[2] === 0xBF) {
      data = data.slice(3);
    }
  }
  interfaceReturn('find', { data: codeName ? JSON.parse(data) : ['No data'], countNum: 1, codeName }, '访问数据获取成功', '访问数据获取失败', res)
}

module.exports = {
  getNetworkData,
  setNetworkData,
  getNetworkFlowData,
  getNetworkPointData,
  getNetworkOnlineData,
  setRealIPLocation,
  getMapJosnData
}