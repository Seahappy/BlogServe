/*
 * @Author: Cxy
 * @Date: 2021-07-08 10:17:10
 * @LastEditors: Cxy
 * @LastEditTime: 2022-01-04 14:48:18
 * @FilePath: \blog\blogserve\router\other.js
 */
const { find, aggre, updateMany } = require('../mongo/db')
const interfaceReturn = require('./until')
const ObjectId = require('mongodb').ObjectId;

// @网站访问统计
const ViewsTotle = async (req, res) => {
  await updateMany('views', { admin_level: 'admin' }, { $inc: { count_Num: 1 } })
  const data = await aggre('statics', [
    { $match: { admin_level: 'admin' } },
    { $project: { _id: 0, home_Poetry: 1 } },
    { $sample: { size: 1 } }
  ])
  data.data = { home_Poetry: data.data[0].home_Poetry[Math.floor(Math.random(0, 1) * data.data[0].home_Poetry.length)], public_IP: req.headers['x-real-ip'] }
  interfaceReturn('find', data, '网站访问量修改成功', '网站访问量修改失败', res)
}

// @网站留言
const WebsiteMessage = async (req, res) => {
  const { content_id } = req.body
  if (content_id) delete req.body.content_id
  const content_Time = new Date().getTime()
  const _id = new ObjectId()
  const updateData = content_id ? { $push: { 'website_Message.$[c].reply_List': { _id, content_Time, ...req.body } } } : { $push: { website_Message: { _id: _id, content_Time, ...req.body } } }
  const filterData = content_id ? { arrayFilters: [{ 'c._id': content_id }], multi: true } : {}
  const data = await updateMany('views', { admin_level: 'admin' }, updateData, filterData)
  interfaceReturn('updateMany', data, '留言成功', '留言失败', res)
}

// @获取网站留言
const GetWebsiteMessage = async (req, res) => {
  const data = await find('views', { admin_level: 'admin' }, {}, { website_Message: 1, _id: 0 })
  interfaceReturn('find', data, '留言成功', '留言失败', res)
}

// @删除留言
const deleteWebsiteMessage = async (req, res) => {
  const { comment_id, comment_Reply_id } = req.body
  const updateData = comment_Reply_id ? { $pull: { 'website_Message.$[c].reply_List': { _id: comment_Reply_id } } } : { $pull: { website_Message: { _id: comment_id } } }
  const filterData = comment_Reply_id ? { arrayFilters: [{ "c._id": comment_id }], multi: true } : {}
  const data = await updateMany('views', { admin_level: 'admin' }, updateData, filterData)
  interfaceReturn('updateMany', data, '留言删除成功', '留言删除失败', res)
}

// @获取时间轴数据
const TimeLineData = async (req, res) => {
  const { admin_Code } = req.query
  const data = await find('statics', { admin_level: 'admin' },
    { sort: { 'timeLine_Data.creation_Time': -1 } }, { _id: 0, timeLine_Data: 1 })
  const articleData = await find('article', admin_Code ? { admin_Code } : {},
    { limit: admin_Code === '' ? 5 : 100000, sort: { id_Article: -1 } },
    { describe: '$html_Article', title: '$title_Article', id_Article: 1 })
  data.article = articleData.data.map(c => {
    c.describe = c.describe.replace(/<(?!\/?br\/?.+?>)[^<>]*>/gm, ' ').slice(0, 400)
    return c
  })
  interfaceReturn('find', data, '获取时间轴数据成功', '获取时间轴数据失败', res)
}

// @网站地图生成
const { SitemapStream, streamToPromise } = require('sitemap')
const { createGzip, unzipSync } = require('zlib')
const fs = require('fs')
const path = require('path')
const siteMapGenerate = async (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.header('Content-Encoding', 'gzip');
  const data = await find('article', {}, {}, { id_Article: 1, _id: 0 })
  const smStream = new SitemapStream({ hostname: 'https://www.seahappy.xyz' })
  const pipeline = smStream.pipe(createGzip())
  const urlData = data.data.concat(['', '/TimeLine', '/About', '/Contact'])
  urlData.forEach((c) => {
    const id_Article = c?.id_Article
    smStream.write({
      url: id_Article ? '/infoBlog?id_Article=' + id_Article : c,
      changefreq: id_Article ? 'monthly' : 'daily',
      priority: id_Article ? 0.8 : 1,
      lastmod: id_Article ? new Date(id_Article) : new Date()
    })
  })
  smStream.end()
  pipeline.pipe(res).on('error', (e) => { throw e })
  streamToPromise(pipeline).then(sm => {
    let fileP = path.resolve('C:/Users/Administrator/Desktop/blogServe', 'siteMap.xml')
    const xmlF = unzipSync(sm).toString()
    fs.writeFile(fileP, xmlF, err => err)
  })
}

module.exports = {
  ViewsTotle,
  WebsiteMessage,
  GetWebsiteMessage,
  deleteWebsiteMessage,
  TimeLineData,
  siteMapGenerate
}