/*
 * @Author: Cxy
 * @Date: 2021-03-04 20:49:52
 * @LastEditors: Cxy
 * @LastEditTime: 2022-06-06 21:25:45
 * @FilePath: \blog\blogserve\mongo\module.js
 */
/* new Schema 规定表的结构骨架 如果传的值不是规定的类型会强制转换，转换不成功将抛出错误 */
const mongoose = require('./connectDB')
const { Schema } = mongoose
/* 管理员 */
const userSchema = new Schema({
  admin_Code: { type: String, required: true },
  pass_Word: { type: String, required: true },
  admin_level: { type: String },
  role_Name: { type: String },
  online_Offline: { type: Number, require: true, default: 0 },
  socket_Id: { type: String, require: true, default: '' },
  login_Device: { type: String, require: true, default: '' },
  frozen_State: { type: Number, require: true, default: 0 },
  id: { type: String, require: true },
  head_Portrait: { type: String },
  nick_Name: { type: String },
  My_Qq: { type: String },
  My_Wb: { type: String },
  My_Wx: { type: String },
  My_Reward_Wx: { type: String },
  My_Reward_Zfb: { type: String },
  brief_Introduction: { type: String },
  public_IP: { type: String },
  room_Title: { type: String },
  room_Description: { type: String },
  live_Image: { type: String },
  live_Status: { type: Number, default: 0 },
  room_Address: { type: String },
  room_Key: { type: String },
  room_Heat: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_At', updatedAt: 'updated_At' } })

/* 聊天 */
const chatSchema = new Schema({
  send_Admin_Code: { type: String, required: true },
  send_Nick_Name: { type: String },
  send_Head_Portrait: { type: String },
  send_Login_Device: { type: String },
  receive_Admin_Code: { type: String, required: true },
  receive_Nick_Name: { type: String },
  receive_Head_Portrait: { type: String },
  receive_Login_Device: { type: String },
  chat_Content: { type: String, required: true },
  sending_Time: { type: Number, required: true }
})

/* 文章 */
const articleSchema = new Schema({
  title_Article: { type: String, required: true },
  content_Article: { type: String, required: true },
  html_Article: { type: String, required: true },
  label_Article: [{
    Tag_Name: { type: String, required: true },
    id_ArticleTag: { type: String, required: true }
  }],
  id_Article: { type: Number, required: true },
  Views_Article: { type: Number, default: 0 },
  like_Article: { type: Number, default: 0 },
  like_List: { type: Array, default: [] },
  author_Nick: { type: String, require: true },
  head_Portrait: { type: String },
  admin_Code: { type: String, require: true },
  word_Number: { type: String, require: true }, // 字数
  cover_Article: { type: String }
},
  /* 表中值创建修改时间扑捉 */
  { timestamps: { createdAt: 'created_At', updatedAt: 'updated_At' } },
  /* 去掉数据库中自动生成的__v字段 */
  // { versionKey: false }
)

/* 文章标签 */
const articleTagSchema = new Schema({
  Tag_Name: { type: String, required: true },
  sort_ArticelTag: { type: Number, required: true, default: 0 },
  id_ArticleTag: { type: String, required: true },
  admin_Code: { type: String, required: true },
  tag_Color: { type: String, required: true }
},
  { timestamps: { createdAt: 'created_At', updatedAt: 'updated_At' } }
)

/* 文章评论 */
const articleCommentSchema = new Schema({
  comment_Article: [{
    _id: { type: Schema.Types.ObjectId },
    admin_Code: { type: String, require: true },
    nick_Name: { type: String, require: true },
    head_Portrait: { type: String, default: '' },
    comment_Content: { type: String, require: true },
    comment_Time: { type: Number, require: true },
    like_Comment: { type: Array },
    reply_List: [
      {
        admin_Code: { type: String, require: true },
        nick_Name: { type: String, require: true },
        head_Portrait: { type: String, default: '' },
        comment_Content: { type: String, require: true },
        comment_Time: { type: Number, require: true },
        admin_Code_Reply: { type: String, require: true },
        nick_Name_Reply: { type: String },
      },
    ]
  }]
})

/* 网络数据 */
const networkSchema = new Schema({
  admin_Code: { type: Array, default: [] },
  public_IP: { type: String, required: true },
  limit_Number: { type: Number, default: 100 },
  limit_Time: { type: Number, default: 5 },
  rest_Time: { type: Number, default: 5 },
  long_Lat: { type: Array },
  location_IP: { type: String },
  county_IP: { type: String },
  city_IP: { type: String },
  province_IP: { type: String },
  update_Admin: { type: Object },
  frozen_State: { type: Number, require: true, default: 0 }
},
  { timestamps: { createdAt: 'created_At', updatedAt: 'updated_At' } }
)

/* 浏览量及留言 */
const viewsSchema = new Schema({
  count_Num: { type: Number, require: true, default: 0 },
  admin_level: { type: String, require: true, default: 'admin' },
  website_Message: [{
    _id: { type: Schema.Types.ObjectId },
    admin_Code: { type: String, require: true },
    nick_Name: { type: String, require: true },
    head_Portrait: { type: String, default: '' },
    message_Content: { type: String, require: true },
    content_Time: { type: Number, require: true },
    reply_List: [
      {
        admin_Code: { type: String, require: true },
        nick_Name: { type: String, require: true },
        head_Portrait: { type: String, default: '' },
        message_Content: { type: String, require: true },
        content_Time: { type: Number, require: true },
        admin_Code_Reply: { type: String, require: true },
        nick_Name_Reply: { type: String },
      },
    ]
  }]
},
  { timestamps: { createdAt: 'created_At', updatedAt: 'updated_At' } }
)

/* 静态网站数据 */
const staticSchema = new Schema({
  timeLine_Data: [{
    creation_Time: { type: Number, require: true },
    title: { type: String, require: true },
    describe: { type: String, require: true }
  }],
  home_Poetry: { type: Array, default: [] }
})

/* 权限路由按钮 */
const powerSchema = new Schema({
  id: { type: Number, require: true },
  path: { type: String, require: true },
  title: { type: String, require: true },
  pid: { type: Number, require: true },
  type: { type: String, require: true }
},
  { timestamps: { createdAt: 'created_At', updatedAt: 'updated_At' } }
)

/* 角色表 */
const roleSchema = new Schema({
  name: { type: String, require: true },
  describe: { type: String },
  founder: { type: String, require: true },
  powerData: { type: Object, require: true }
},
  { timestamps: { createdAt: 'created_At', updatedAt: 'updated_At' } }
)

/* 管理自增id的表 */
const autoKeySchema = new Schema({
  user_id: { type: Number, require: true, default: 1 },
  name: { type: String, require: true, default: 'autoKey' }
})


module.exports = {
  userSchema,
  chatSchema,
  articleSchema,
  articleTagSchema,
  articleCommentSchema,
  networkSchema,
  viewsSchema,
  staticSchema,
  powerSchema,
  roleSchema,
  autoKeySchema
}