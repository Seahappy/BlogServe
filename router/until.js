/*
 * @Author: Cxy
 * @Date: 2021-06-07 17:34:05
 * @LastEditors: Cxy
 * @LastEditTime: 2021-06-13 00:29:10
 * @FilePath: \learnBookd:\blog\blogserve\router\until.js
 */

const { findC } = require('./code')
/**
* @description: 封装响应方法
* @param {*} type 操作表的类型
* @param {*} data 表返回数据
* @param {*} msgSuccess 成功返回的提示
* @param {*} msgFaild 失败返回的提示
* @param {*} res 响应对象
* @return {*}
*/
module.exports = (type, data, msgSuccess, msgFaild, res) => {
    let flag = true
    switch (type) {
        case 'insertOne':
            flag = (Object.keys(data).length > 0 ? true : false)
            break;
        case 'deleteMany':
            flag = (data.deletedCount > 0 ? true : false)
            break;
        case 'find':
            data.countNum === 0 ? msgSuccess = '数据为空' : msgSuccess
            flag = data.data ? true : false
            break;
        case 'updateMany':
            flag = (data.nModified > 0 ? true : false)
            break;
    }
    if (flag) {
        return res.send({ code: 200, data, massage: msgSuccess })
    } else {
        return res.send({ code: findC, data: [], massage: msgFaild })
    }
}
