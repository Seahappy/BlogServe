/*
 * @Author: Cxy
 * @Date: 2021-03-05 11:18:12
 * @LastEditors: Cxy
 * @LastEditTime: 2021-12-15 17:58:09
 * @FilePath: \blog\blogserve\mongo\db.js
 */
const model = require('./index')
const mongoose = require('./connectDB')

module.exports.insertOne = (colleName, data) => {
  return new Promise((resolve, reject) => {
    model[colleName].create(data, err => {
      if (err) reject(err)
      resolve(data)
    })
  })
}

/**
 * @description: find查询
 * @param {*} colleName 表名
 * @param {*} queryCri 查询条件
 * @param {*} pagingData 分页数据  skip跳页 limit拿页 sort排序
 * @param {*} proJec 投影
 * @return {*} 查询到数据
 */
const find = (colleName, queryCri, pagingData = {}, proJec) => {
  return new Promise((resolve, reject) => {
    const { skip = 1, limit, sort = {} } = pagingData
    model[colleName].find(queryCri, proJec, { lean: true }, (err, data) => {
      if (err) reject(err)
      resolve({ data })
    }).skip((skip - 1) * limit).limit(Number(limit)).sort(sort)
  })
}
module.exports.find = find

const findCount = (colleName, queryCri) => {
  return new Promise((resolve, reject) => {
    model[colleName].countDocuments(queryCri, (err, countNum) => {
      if (err) reject(err)
      resolve({ countNum })
    })
  })
}
module.exports.findCount = findCount

module.exports.findToFindCount = (colleName, queryCri, pagingData, proJec) => {
  return new Promise(async (resolve) => {
    const data = await find(colleName, queryCri, pagingData, proJec)
    const countNum = await findCount(colleName, queryCri)
    resolve({ ...data, ...countNum })
  })
}
/**
 * @description: aggregate聚合查询
 * @param {*} colleName 表名
 * @param {*} queryCri 查询条件
 * @return {*} 查询到数据
 */
const aggre = async (colleName, queryCri) => {
  return new Promise((resolve, reject) => {
    const skip = queryCri.filter(c => Object.keys(c)[0] === '$skip')[0]?.$skip
    const limit = queryCri.filter(c => Object.keys(c)[0] === '$limit')[0]?.$limit
    const queryCriCopy = queryCri.filter(c => {
      if (!['$skip', '$limit'].includes(Object.keys(c)[0])) {
        return c
      }
    })
    const pageSize = [{ '$skip': (skip - 1) * limit }, { $limit: Number(limit) }]
    const queryCriArrangument = queryCriCopy.concat(skip ? pageSize : [])
    model[colleName].aggregate(queryCriArrangument, (err, data) => {
      if (err) reject(err)
      resolve({ data })
    })
  })
}
module.exports.aggre = aggre

const aggreCount = (colleName, queryCri) => {
  return new Promise((resolve, reject) => {
    const queryCriCopy = queryCri.filter(c => {
      if (!['$skip', '$limit', '$sort'].includes(Object.keys(c)[0])) {
        return c
      }
    })
    model[colleName].aggregate(queryCriCopy.concat({ "$count": "countNum" }), (err, data) => {
      if (err) reject(err)
      resolve({countNum: data[0]?.countNum || 0})
    })
  })
}
module.exports.aggreCount = aggreCount

module.exports.aggreToAggreCount = (colleName, queryCri) => {
  return new Promise(async (resolve) => {
    const data = await aggre(colleName, queryCri)
    const countNum = await aggreCount(colleName, queryCri)
    resolve({ ...data, ...countNum })
  })
}

module.exports.deleteMany = (colleName, data) => {
  return new Promise((resolve, reject) => {
    const { _id, termTag, term } = data
    const termData = {}
    _id ? termData['_id'] = [mongoose.Types.ObjectId(_id)] : termData[termTag] = term
    model[colleName].deleteMany(termData, (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
}

module.exports.updateMany = (colleName, findData, updateData, filterData = {}) => {
  return new Promise((resolve, reject) => {
    model[colleName].updateMany(findData, updateData, filterData, (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
}