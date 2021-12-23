/*
 * @Author: Cxy
 * @Date: 2021-04-06 09:39:05
 * @LastEditors: Cxy
 * @LastEditTime: 2021-12-20 11:00:48
 * @FilePath: \blog\blogserve\router\article.js
 */

const { find, findCount, aggre, aggreToAggreCount, insertOne, deleteMany, updateMany } = require('../mongo/db')
const interfaceReturn = require('./until')
const ObjectId = require('mongodb').ObjectId;
// @添加文章
const articleAdd = async (req, res) => {
  const { id_Article, addTagId, delTagId, } = req.body
  let data_Tag
  if (id_Article) {
    if (addTagId !== [])
      await updateMany('articleTag', { id_ArticleTag: { $in: addTagId } }, { $inc: { sort_ArticelTag: 1 } })
    if (delTagId !== [])
      await updateMany('articleTag', { id_ArticleTag: { $in: delTagId } }, { $inc: { sort_ArticelTag: -1 } })
    data_Tag = await updateMany('article', { id_Article }, { ...req.body })
  } else {
    const _id = new ObjectId()
    const id_Article = Date.now()
    const dataArticle = await insertOne('article', { ...req.body, id_Article, _id })
    await insertOne('articleComment', { _id })
    const updateTagId = dataArticle.label_Article.map(c => {
      return c.id_ArticleTag
    });
    data_Tag = await updateMany('articleTag', { id_ArticleTag: { $in: updateTagId } }, { $inc: { sort_ArticelTag: 1 } })
  }
  interfaceReturn('updateMany', data_Tag, '发布成功', '发布失败', res)
}

// @文章查找
const articleFind = async (req, res) => {
  const { limit, page, label_Article, sortTag, strEndTime } = JSON.parse(req.query[Object.keys(req.query)])
  const sortQuery = {}
  sortQuery[sortTag] = -1
  const Tag_Name_Con = label_Article === '' ? {} : label_Article === '未分类' ? { label_Article: [] } : { 'label_Article.Tag_Name': label_Article }
  const strEndTime_Con = strEndTime === 0 ? {} : { id_Article: { $gt: new Date(strEndTime).getTime(), $lt: new Date(strEndTime).getTime() + 86400000 } }
  const main_Condition = [{ $match: Object.assign(Tag_Name_Con, strEndTime_Con) }]
  const other_Condition = [
    { $lookup: { from: 'users', localField: 'admin_Code', foreignField: 'admin_Code', as: 'users' } },
    {
      $project: {
        'users._id': 0, 'users.online_Offline': 0, 'users.socket_Id': 0, 'users.Login_Device': 0,
        'users.frozen_State': 0, 'users.pass_Word': 0, 'users.admin_level': 0, 'users.role_Name': 0,
        'users.chat_Data': 0, content_Article: 0, 'users.brief_Introduction': 0, 'users.head_Portrait': 0,
        'users.My_Qq': 0, 'users.My_Wb': 0, 'users.My_Wx': 0, 'users.My_Reward_Wx': 0, 'users.My_Reward_Zfb': 0,
        'users.public_IP': 0
      }
    },
    { $sort: sortQuery },
    { $skip: page },
    { $limit: limit },
  ]
  const term = label_Article === '' && strEndTime === 0 ? [...other_Condition] : [...main_Condition, ...other_Condition]
  const data = await aggreToAggreCount('article', term)
  data.data.map(c => {
    c.html_Article = c.html_Article.replace(/<(?!\/?br\/?.+?>)[^<>]*>/gm, '').slice(0, 400)
    return c
  })
  interfaceReturn('find', data, '文章查找成功', '未查找到文章数据，请添加', res)
}

// @文章删除
const articleDelete = async (req, res) => {
  const { _id, id_ArticleTagAll } = req.body
  await deleteMany('article', { _id })
  await deleteMany('articleComment', { _id })
  const data = await updateMany('articleTag', { id_ArticleTag: { $in: id_ArticleTagAll || [] } }, { $inc: { sort_ArticelTag: -1 } })
  interfaceReturn('updateMany', data, '文章删除成功', '文章删除失败', res)
}

// @文章详情上一条，下一条
let article_Arrangement_Arr_Id = []
let article_Find_Index = 0
const ArticlePrevNext = async (req, res) => {
  const tag_Arr = JSON.parse(req.query.articleTag || {})
  const { flipPage, articleId } = req.query
  if (article_Arrangement_Arr_Id.indexOf(Number(articleId)) === -1) {
    const tag_Arrangement = tag_Arr.map(c => {
      return c.Tag_Name
    })
    const article_Data = await find('article', { 'label_Article.Tag_Name': { $in: tag_Arrangement } }, {}, { id_Article: 1 })
    const article_Id_Arr = article_Data.data.map(c => {
      return c.id_Article
    })
    article_Arrangement_Arr_Id = [...new Set(article_Id_Arr.flat())]
    article_Find_Index = article_Arrangement_Arr_Id.indexOf(Number(articleId))
  }
  if (article_Arrangement_Arr_Id.length === 1) {
    interfaceReturn('find', [], '文章查找成功', '此类文章仅此一篇', res)
  } else if (article_Arrangement_Arr_Id.length === 0) {
    interfaceReturn('find', [], '文章查找成功', '因文章无标签，无法查找到同类文章', res)
  } else {
    if (flipPage === 'next') {
      if (article_Arrangement_Arr_Id.length === article_Find_Index + 1) {
        article_Find_Index = 0
      } else {
        article_Find_Index += 1
      }
    } else if (flipPage === 'prev') {
      if (article_Find_Index - 1 === -1) {
        article_Find_Index = article_Arrangement_Arr_Id.length - 1
      } else {
        article_Find_Index -= 1
      }
    }
    await updateMany('article', { id_Article: article_Arrangement_Arr_Id[article_Find_Index] }, { $inc: { Views_Article: 1 } })
    const data = await aggre('article', [
      { $match: { id_Article: article_Arrangement_Arr_Id[article_Find_Index] } },
      { $lookup: { from: 'users', localField: 'admin_Code', foreignField: 'admin_Code', as: 'users' } },
      {
        $project: {
          'users._id': 0, 'users.online_Offline': 0, 'users.socket_Id': 0, 'users.Login_Device': 0,
          'users.frozen_State': 0, 'users.pass_Word': 0, 'users.admin_level': 0, 'users.role_Name': 0,
          'users.chat_Data': 0
        }
      }
    ])
    interfaceReturn('find', data, '文章查找成功', '未查找到文章数据，请添加', res)
  }
}

// @猜你喜欢
const GuessYouLike = async (req, res) => {
  const { label_Article: term } = req.query
  const data = await aggre('article', [
    { $match: { label_Article: { $elemMatch: { Tag_Name: { $in: term || [] } } } } },
    { $sample: { size: 2 } }
  ])
  interfaceReturn('find', data, '文章查找成功', '未查找到文章数据，请添加', res)
}

// @首页最新、喜欢、观看
const homePageStatistics = async (req, res) => {
  const titleType = ['最新的', '喜欢多', '观看多']
  const data = await ['_id', 'like_Article', 'Views_Article'].reduce(async (prev, c, i) => {
    const articleData = await find('article', {}, { sort: { [c]: -1 }, limit: 1 },
      { title_Article: 1, id_Article: 1, cover_Article: 1 })
    articleData.data[0].title_type = titleType[i]
    return [...await prev, articleData.data[0]]
  }, [])
  interfaceReturn('find', { data, countNum: 3 }, '文章查找成功', '未查找到文章数据，请添加', res)
}

// @首页网站统计
const homePageStatisticsNum = async (req, res) => {
  const data = await find('views', {}, {}, { count_Num: 1 })
  const article = await findCount('article', {})
  const Login_Users = await findCount('users', { online_Offline: 1 })
  data.data = [{ countNum: Login_Users.countNum, code: 'ON_LINE' }, { countNum: article.countNum, code: 'ARTICLE_COUNT' }, { countNum: data.data[0].count_Num, code: 'VISITS' }]
  interfaceReturn('find', data, '文章查找成功', '未查找到文章数据，请添加', res)
}

// @文章最新、喜欢、观看
const articleFindNewLike = async (req, res) => {
  const sortTag = req.query.name
  const limit = Number(req.query.size)
  const type = req.query.type
  const data = await find('article', {}, { limit: limit ? 3 : 6, skip: 1, sort: { [sortTag]: -1 } }, { content_Article: 0, updated_At: 0, admin_Code: 0 })
  data.data.map(c => {
    if (type) c.html_Article = c.html_Article.replace(/<(?!\/?br\/?.+?>)[^<>]*>/gm, '').slice(0, 400)
    return c
  })
  interfaceReturn('find', data, '文章查找成功', '未查找到文章数据，请添加', res)
}

// @随机指定数据及条数
const randomToArticles = async (req, res) => {
  const { termTag, size, type } = JSON.parse(req.query[Object.keys(req.query)])
  const termData = termTag ? [{ $match: termTag === '未分类' ? { label_Article: [] } : { 'label_Article.Tag_Name': termTag } }, { $sample: { size } }] : [{ $sample: { size } }]
  termData.push({ $project: { content_Article: 0, updated_At: 0, admin_Code: 0 } })
  const data = await aggre('article', termData)
  data.data.map(c => {
    if (type) c.html_Article = c.html_Article.replace(/<(?!\/?br\/?.+?>)[^<>]*>/gm, '').slice(0, 400)
    return c
  })
  interfaceReturn('find', data, '文章查找成功', '未查找到文章数据，请添加', res)
}

// @文章详情及浏览量改变
const articleViewPage = async (req, res) => {
  const { id_Article } = req.body
  await updateMany('article', req.body, { $inc: { Views_Article: 1 } })
  const data = await aggre('article', [
    { $match: { id_Article } },
    { $lookup: { from: 'users', localField: 'admin_Code', foreignField: 'admin_Code', as: 'users' } },
    {
      $project: {
        'users._id': 0, 'users.online_Offline': 0, 'users.socket_Id': 0, 'users.Login_Device': 0,
        'users.frozen_State': 0, 'users.pass_Word': 0, 'users.admin_level': 0, 'users.role_Name': 0,
        'users.chat_Data': 0
      }
    }
  ])
  interfaceReturn('find', data, '文章查找成功', '未查找到文章数据，请添加', res)
}

// @模糊搜索
const PinyinEngine = require('pinyin-engine')
const articleSearchFuzzy = async (req, res) => {
  const dataArticleAll = await find('article', {})
  const pinyinEngineArticle = new PinyinEngine(dataArticleAll.data, ['title_Article'])
  const dataArticleEngine = pinyinEngineArticle.query(req.query.search_Val)
  const dataArticleTagAll = await find('articleTag', {})
  const pinyinEngineArticleTag = new PinyinEngine(dataArticleTagAll.data, ['Tag_Name'])
  const articleTagEngine = pinyinEngineArticleTag.query(req.query.search_Val)
  const dataArticleTagEngine = await find('article', { 'label_Article.Tag_Name': { $in: articleTagEngine.map(c => c.Tag_Name) } })
  const searchReg = new RegExp(String(req.query.search_Val), 'i')
  const term = { $or: [{ title_Article: { $regex: searchReg } }, { label_Article: { $elemMatch: { Tag_Name: { $regex: searchReg } } } }] }
  const data = await find('article', term)
  data.data = [].concat(data.data, dataArticleEngine, dataArticleTagEngine.data).reduceRight((acc, v) => {
    if (!acc.some(x => v.id_Article === x.id_Article)) acc.push(v);
    return acc;
  }, []);
  data.countNum = data.data.length
  interfaceReturn('find', data, '文章查找成功', '未搜索到有关于' + req.query.search_Val + '相关词条', res)
}

// @图片上传
const multer = require('multer');
const fs = require('fs')
const uploadFile = (req, res) => {
  /* 文件上传中间件 */
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // 图片储存地址
      const filePath = './public/' + req.query.filePath
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true })
      }
      cb(null, filePath)
    },
    filename: function (req, file, cb) {
      // 图片命名
      cb(null, Date.now() + '_' + file.originalname)
    }
  })
  const upload = multer({ storage: storage }).array('file');
  upload(req, res, err => {
    if (err instanceof multer.MulterError) {
      return res.send({ code: 400, massage: '上传时发生Multer错误' })
    } else if (err) {
      return res.send({ code: 400, massage: '上传时express发生未知错误' })
    }
    res.send({
      code: 200, url: req.files.map(c => {
        return c.path.replace(/public/, '').replace(/\\/g, '/')
      })
    })
  })
}

// @添加标签
const articleTagAdd = async (req, res) => {
  const _id = new ObjectId()
  const data = await insertOne('articleTag', { _id, ...req.body, id_ArticleTag: Date.now() })
  interfaceReturn('insertOne', data, '标签添加成功', '标签添加失败', res)
}

// @标签查找
const articleTagFind = async (req, res) => {
  const admin_Code = req.query.admin_Code
  const queryCreteria = admin_Code ? [{ $match: { admin_Code } }] :
    [
      { $group: { _id: '$Tag_Name', Tag_Name: { $first: '$Tag_Name' }, tag_Color: { $first: '$tag_Color' }, sort_ArticelTag: { $sum: '$sort_ArticelTag' } } }
    ]
  const data = await aggre('articleTag', queryCreteria)
  const unclassified = await findCount('article', { label_Article: [] })
  data.data.push({
    Tag_Name: '未分类',
    _id: '未分类',
    tag_Color: '#b79764',
    sort_ArticelTag: unclassified.countNum
  })
  interfaceReturn('find', data, '标签查找成功', '未查找到标签数据，请添加', res)
}

// @标签删除
const articleTagDelete = async (req, res) => {
  const { _id } = req.body
  await updateMany('article', { 'label_Article._id': _id }, { $pull: { label_Article: { _id } } })
  const data = await deleteMany('articleTag', { _id })
  interfaceReturn('deleteMany', data, '标签删除成功', '标签删除失败', res)
}

// @点赞文章
const doLikeArticles = async (req, res) => {
  const { admin_Code, article_Id, like_Flag } = req.body
  const like_Article = like_Flag ? 1 : -1
  const user_Like_List = like_Flag ? { $push: { like_List: admin_Code } } : { $pull: { like_List: admin_Code } }
  const articleData = await updateMany('article', { _id: article_Id }, { $inc: { like_Article }, ...user_Like_List })
  interfaceReturn('updateMany', articleData, '已加入喜欢列表', '已移除喜欢列表', res)
}

// @通过用户姓名获取已点赞的文章
const LikeLreadyArticle = async (req, res) => {
  const { admin_Code, skip, limit } = req.query
  const data = await aggreToAggreCount('article', [
    { $match: { like_List: { $in: [admin_Code] } } },
    { $lookup: { from: 'articlecomments', localField: '_id', foreignField: '_id', as: 'comments' } },
    { $lookup: { from: 'users', localField: 'admin_Code', foreignField: 'admin_Code', as: 'users' } },
    { $sort: { _id: -1 } },
    { $skip: Number(skip) },
    { $limit: Number(limit) }
  ])
  interfaceReturn('find', data, '已点赞的文章查找成功', '未查找到已点赞的文章数据，请添加', res)
}

// @通过用户姓名获取写作的文章
const MyWriteArticle = async (req, res) => {
  const { admin_Code, skip, limit } = req.query
  const data = await aggreToAggreCount('article', [
    { $match: { admin_Code } },
    { $lookup: { from: 'articlecomments', localField: '_id', foreignField: '_id', as: 'comments' } },
    { $lookup: { from: 'users', localField: 'admin_Code', foreignField: 'admin_Code', as: 'users' } },
    { $sort: { _id: -1 } },
    { $skip: Number(skip) },
    { $limit: Number(limit) }
  ])
  interfaceReturn('find', data, '写作的文章查找成功', '未查找到写作的文章数据，请添加', res)
}

// @评论文章
const commentReplyArticle = async (req, res) => {
  const { _id, admin_Code_Reply, comment_id } = req.body
  const comment_Time = new Date().getTime()
  const __id = new ObjectId()
  if (admin_Code_Reply) {
    delete req.body.comment_id
    delete req.body._id
  }
  const updateData = admin_Code_Reply ? { $push: { 'comment_Article.$[c].reply_List': { ...req.body, comment_Time, _id: __id } } } : { $push: { comment_Article: { ...req.body, comment_Time, _id: __id } } }
  const filterData = comment_id ? { arrayFilters: [{ "c._id": comment_id }], multi: true } : {}
  const data = await updateMany('articleComment', { _id }, updateData, filterData)
  interfaceReturn('updateMany', data, '评论成功', '评论失败', res)
}

// @获取评论
const commentGetArticle = async (req, res) => {
  const { _id } = req.query
  const data = await find('articleComment', { _id })
  interfaceReturn('find', data, '评论查找成功', '未查找到评论数据', res)
}

// @评论点赞
const commentLikeArticle = async (req, res) => {
  const { _id, comment_id, admin_Code, comment_Lick_Flag } = req.body
  const updateData = { [(comment_Lick_Flag ? '$pull' : '$push')]: { 'comment_Article.$[c].like_Comment': admin_Code } }
  const filterData = { arrayFilters: [{ "c._id": comment_id }], multi: true }
  const data = await updateMany('articleComment', { _id }, updateData, filterData)
  interfaceReturn('updateMany', data, '已加入喜欢列表', '已移除喜欢列表', res)
}

// @评论移除
const commentDeleteArticle = async (req, res) => {
  const { _id, comment_id, comment_Reply_id } = req.body
  const updateData = comment_Reply_id ? { $pull: { 'comment_Article.$[c].reply_List': { _id: comment_Reply_id } } } : { $pull: { comment_Article: { _id: comment_id } } }
  const filterData = comment_Reply_id ? { arrayFilters: [{ "c._id": comment_id }], multi: true } : {}
  const data = await updateMany('articleComment', { _id }, updateData, filterData)
  interfaceReturn('updateMany', data, '评论删除成功', '评论删除失败', res)
}

// @文章统计
const articleStatistics = async (req, res) => {
  const data = await aggre('article', [
    //时区数据校准，8小时换算成毫秒数为8*60*60*1000=288000后分割成YYYY-MM-DD日期格式便于分组
    { $group: { _id: { $substr: [{ "$add": ["$created_At", 28800000] }, 0, 10] }, count: { $sum: 1 } } },
    { $project: { data: { $split: ['$_id', "-"] }, count: 1 } },
    { $sort: { _id: 1 } }
  ])
  interfaceReturn('find', data, '文章统计成功', '文章统计失败', res)
}

module.exports = {
  articleAdd,
  uploadFile,
  articleFind,
  articleDelete,
  ArticlePrevNext,
  articleFindNewLike,
  homePageStatistics,
  homePageStatisticsNum,
  articleViewPage,
  articleSearchFuzzy,
  articleTagAdd,
  articleTagFind,
  articleTagDelete,
  GuessYouLike,
  randomToArticles,
  doLikeArticles,
  LikeLreadyArticle,
  MyWriteArticle,
  commentReplyArticle,
  commentGetArticle,
  commentLikeArticle,
  commentDeleteArticle,
  articleStatistics
}