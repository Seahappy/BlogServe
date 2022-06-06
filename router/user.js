/*
 * @Author: Cxy
 * @Date: 2021-03-04 19:05:43
 * @LastEditors: Cxy
 * @LastEditTime: 2022-06-02 14:16:26
 * @FilePath: \ehomes-admind:\blog\blogServe\router\user.js
 */
const { tokenC, findC } = require('./code')
const { find, aggre, insertOneAutoincr, updateMany, findCount, findToFindCount } = require('../mongo/db')
const { signJwt, verifyJwt } = require('../jwt')
const interfaceReturn = require('./until')

// @获取token
const getToken = async (req, res) => {
  res.send({ code: 200, token: signJwt(req.query, 1) })
}
// @验证token
const checkToken = (req, res) => {
  const TK = verifyJwt(req.headers.token)
  if (TK) {
    res.send({ code: 200 })
  } else {
    res.send({ code: tokenC, massage: '用户身份过期,请重新登录' })
  }
}
// @注册用户
const reg = async (req, res) => {
  const { admin_Code } = req.body
  const findData = await findCount('users', { admin_Code })
  if (findData.countNum === 1) {
    res.send({ code: findC, massage: '该账号已注册' })
  } else {
    const { data: [{ name, _id }] } = await find('role', { name: '普通角色' })
    const data = await insertOneAutoincr('users', 'user_id', Object.assign(req.body, { admin_level: _id, role_Name: name }))
    interfaceReturn('insertOne', data, '注册成功，即将跳转登陆页面', '注册失败，请重新注册', res)
  }
}
// @动态路由
const routerData = async (req, res) => {
  const { admin_Code } = req.body
  let power_Data_List
  if (admin_Code === 'root') {
    power_Data_List = await find('power', {})
  } else {
    const data = await aggre('users', [
      { $match: { admin_Code } },
      { $project: { admin_level: { $toObjectId: "$admin_level" } } },
      { $lookup: { from: 'roles', localField: 'admin_level', foreignField: '_id', as: 'powerDataDoc' } },
      { $project: { _id: 0, 'powerDataDoc.powerData': 1 } }
    ])
    if (!data.data[0] || data.data[0].powerDataDoc.length === 0) return res.send({ code: 200, routerData: [], buttonData: [], massage: '该用户未配角色' })
    const { checked, checkSemi } = data.data[0].powerDataDoc[0].powerData
    power_Data_List = await find('power', { id: { $in: checked.concat(checkSemi) } }, {}, { _id: 0, id: 1, path: 1, pid: 1, title: 1, type: 1 })
  }
  const { routerData, buttonData } = power_Data_List.data.reduce((prev, cur) => {
    if (cur.type === 'router') {
      prev.routerData.push(cur)
    } else {
      prev.buttonData.push(cur)
    }
    return prev
  }, { routerData: [], buttonData: [] })
  res.send({ code: 200, routerData, buttonData, massage: '权限数据获取成功' })
  try {
    const public_IP = req.headers['x-real-ip']
    await updateMany('users', { admin_Code }, { public_IP })
    const data = await find('network', { public_IP, admin_Code: { $elemMatch: { $eq: admin_Code } } })
    if (data.data.length) {
      await updateMany('network', { public_IP }, { ['update_Admin.' + admin_Code]: Date.now() })
    } else {
      await updateMany('network', { public_IP }, { $addToSet: { admin_Code }, ['update_Admin.' + admin_Code]: Date.now() })
    }
  } catch (error) {
    throw error
  }
}
// @获取已注册用户
const getAllRegisteredUsers = async (req, res) => {
  const { skip, limit } = req.query
  const data = await findToFindCount('users', {}, { skip, limit }, { pass_Word: 0, socket_Id: 0, chat_Data: 0 })
  interfaceReturn('find', data, '获取已注册用户成功', '获取已注册用户失败', res)
}
// @解除冻结
const unfreezingPerson = async (req, res) => {
  const { admin_Code, state } = req.body
  const data = await updateMany('users', { admin_Code }, { frozen_State: state === 'unfreezing' ? 0 : 1 })
  interfaceReturn('updateMany', data, '冻结操作成功', '冻结操作失败', res)
}
// @修改用户基本信息
const saveBasicSettings = async (req, res) => {
  const { original_Password, admin_Code } = req.body
  if (original_Password === '') {
    const findUserData = await find('users', { admin_Code })
    delete req.body.original_Password
    if (original_Password !== findUserData.data[0].pass_Word) {
      return res.send({ code: 400, data: [], massage: '原密码输入有误' })
    }
  }
  delete req.body.admin_Code
  const data = await updateMany('users', { admin_Code }, req.body)
  interfaceReturn('updateMany', data, '用户信息修改成功', '用户信息修改失败', res)
}

module.exports = {
  getToken,
  checkToken,
  reg,
  routerData,
  getAllRegisteredUsers,
  unfreezingPerson,
  saveBasicSettings
}