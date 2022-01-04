/*
 * @Author: Cxy
 * @Date: 2021-03-04 19:02:42
 * @LastEditors: Cxy
 * @LastEditTime: 2021-12-30 20:22:43
 * @FilePath: \blog\blogserve\router\index.js
 */
const express = require('express')
const router = express.Router()

/* 用户登录 */
const user = require('./user.js')
router.get('/getToken', user.getToken)
router.get('/checkToken', user.checkToken)
router.post('/reg', user.reg)
router.post('/routerData', user.routerData)
router.get('/getAllRegisteredUsers', user.getAllRegisteredUsers)
router.post('/unfreezingPerson', user.unfreezingPerson)
router.post('/saveBasicSettings', user.saveBasicSettings)

/* 文章 */
const article = require('./article')
router.post('/articleAdd', article.articleAdd)
router.post('/uploadFile', article.uploadFile)
router.get('/articleFind', article.articleFind)
router.post('/articleDelete', article.articleDelete)
router.get('/ArticlePrevNext', article.ArticlePrevNext)
router.get('/articleFindNewLike', article.articleFindNewLike)
router.get('/homePageStatistics', article.homePageStatistics)
router.get('/homePageStatisticsNum', article.homePageStatisticsNum)
router.post('/articleViewPage', article.articleViewPage)
router.get('/articleSearchFuzzy', article.articleSearchFuzzy)
router.post('/articleTagAdd', article.articleTagAdd)
router.get('/articleTagFind', article.articleTagFind)
router.post('/articleTagDelete', article.articleTagDelete)
router.get('/GuessYouLike', article.GuessYouLike)
router.get('/randomToArticles', article.randomToArticles)
router.post('/doLikeArticles', article.doLikeArticles)
router.get('/LikeLreadyArticle', article.LikeLreadyArticle)
router.get('/MyWriteArticle', article.MyWriteArticle)
router.post('/commentReplyArticle', article.commentReplyArticle)
router.get('/commentGetArticle', article.commentGetArticle)
router.post('/commentLikeArticle', article.commentLikeArticle)
router.post('/commentDeleteArticle', article.commentDeleteArticle)
router.get('/articleStatistics', article.articleStatistics)


/* 权限 */
const role = require('./role')
router.get('/getPowerTreeData', role.getPowerTreeData)
router.post('/editPowerTree', role.editPowerTree)
router.post('/deletePowerTree', role.deletePowerTree)
router.get('/getRoleData', role.getRoleData)
router.post('/editRoleData', role.editRoleData)
router.post('/deleteRoleData', role.deleteRoleData)
router.post('/userEditRole', role.userEditRole)

/* 其他 */
const other = require('./other')
router.get('/ViewsTotle', other.ViewsTotle)
router.post('/WebsiteMessage', other.WebsiteMessage)
router.get('/GetWebsiteMessage', other.GetWebsiteMessage)
router.post('/deleteWebsiteMessage', other.deleteWebsiteMessage)
router.get('/TimeLineData', other.TimeLineData)
router.post('/siteMapGenerate', other.siteMapGenerate)

/* 系统监控 */
const system = require('./system')
router.post('/getSystemData', system.getSystemData)

/* 网络数据 */
const network = require('./network')
router.get('/getNetworkData', network.getNetworkData)
router.post('/setNetworkData', network.setNetworkData)
router.post('/getNetworkFlowData', network.getNetworkFlowData)
router.get('/getNetworkPointData', network.getNetworkPointData)
router.get('/getNetworkOnlineData', network.getNetworkOnlineData)
router.post('/setRealIPLocation', network.setRealIPLocation)
router.post('/getMapJosnData', network.getMapJosnData)

module.exports = router