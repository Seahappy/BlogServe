/*
 * @Author: Cxy
 * @Date: 2021-03-04 19:04:45
 * @LastEditors: Cxy
 * @LastEditTime: 2022-06-02 13:43:50
 * @FilePath: \ehomes-admind:\blog\blogServe\mongo\index.js
 */
const { model } = require('./connectDB')
const schemas = require('./module.js')

/* 人员 */
const users = model('users', schemas.userSchema);

/* 聊天记录 */
const chat = model('chat', schemas.chatSchema);

/* 文章 */
// 重命名 article mongoose 表名 原因mongoose会自动给表明后加s表名以s结尾的除外
const article = model('article', schemas.articleSchema, 'articles');

/* 文章标签 */
const articleTag = model('articleTag', schemas.articleTagSchema)

/* 文章评论 */
const articleComment = model('articleComments', schemas.articleCommentSchema)

/* 网络限制 */
const network = model('network', schemas.networkSchema)

/* 浏览量 */
const views = model('views', schemas.viewsSchema)

/* 网站静态资源 */
const statics = model('statics', schemas.staticSchema)

/* 权限树 */
const power = model('power', schemas.powerSchema)

/* 角色表 */
const role = model('role', schemas.roleSchema)

/* 管理自增id表 */
const autoKey = model('autoKey', schemas.autoKeySchema)

module.exports = {
  users,
  chat,
  article,
  articleTag,
  articleComment,
  network,
  views,
  statics,
  power,
  role,
  autoKey
}
