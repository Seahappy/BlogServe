/*
 * @Author: Cxy
 * @Date: 2021-06-06 23:53:18
 * @LastEditors: Cxy
 * @LastEditTime: 2021-12-11 14:01:09
 * @FilePath: \blog\blogserve\router\role.js
 */
const { find, insertOne, updateMany, deleteMany, findToFindCount } = require('../mongo/db')
const interfaceReturn = require('./until')
// @获取权限树数据
const getPowerTreeData = async (req, res) => {
  const findData = await find('power', {})
  interfaceReturn('find', findData, '获取权限树数据成功', '获取权限树数据失败', res)
}
// @添加修改权限树
const editPowerTree = async (req, res) => {
  const { id, title, path, _id } = req.body
  if (!_id) {
    const data = await insertOne('power', req.body)
    interfaceReturn('insertOne', data, '添加树节点成功', '添加树节点失败', res)
  } else {
    const data = await updateMany('power', { id }, { title, path })
    interfaceReturn('updateMany', data, '修改树节点成功', '修改树节点失败', res)
  }
}
// @删除权限树
const deletePowerTree = async (req, res) => {
  const data = await deleteMany('power', { termTag: 'id', term: req.body.id })
  interfaceReturn('deleteMany', data, '删除树节点成功', '删除树节点失败', res)
}

// @获取角色
const getRoleData = async (req, res) => {
  const { skip, limit } = req.query
  const data = await findToFindCount('role', {}, { skip, limit })
  interfaceReturn('find', data, '获取角色数据成功', '获取角色数据失败', res)
}

// @添加修改角色
const editRoleData = async (req, res) => {
  const { _id } = req.body
  if (_id) {
    const data = await updateMany('role', { _id }, req.body)
    interfaceReturn('updateMany', data, '修改角色成功', '修改角色失败', res)
  } else {
    const data = await insertOne('role', req.body)
    interfaceReturn('insertOne', data, '添加角色成功', '添加角色失败', res)
  }
}

// @删除角色
const deleteRoleData = async (req, res) => {
  const { _id } = req.body
  const data = await deleteMany('role', { _id })
  interfaceReturn('deleteMany', data, '删除角色成功', '删除角色失败', res)
}

// @用户添加修改角色
const userEditRole = async (req, res) => {
  const { _id, admin_level, role_Name } = req.body
  const data = await updateMany('users', { _id }, { admin_level, role_Name })
  interfaceReturn('updateMany', data, '人员赋值角色成功', '人员赋值角色失败', res)
}

module.exports = {
  getPowerTreeData,
  editPowerTree,
  deletePowerTree,
  getRoleData,
  editRoleData,
  deleteRoleData,
  userEditRole
}