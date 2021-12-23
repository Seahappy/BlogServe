/*
 * @Author: Cxy
 * @Date: 2021-03-16 12:07:54
 * @LastEditors: Cxy
 * @LastEditTime: 2021-07-08 11:24:56
 * @FilePath: \learnBookd:\blog\blogserve\mongo\userInIt.js
 */
const { users, views } = require('./index')
// users.create({
//     admin_Code: 'root',
//     pass_Word: 123,
// }, (err, data) => {
//     console.log(err)
//     console.log(data)
// })
views.create({
    count_Num: 6600,
    admin_level: 'admin'
}, (err, data) => {
    console.log(err)
    console.log(data)
})

