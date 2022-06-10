/*
 * @Descripttion: 
 * @Author: Cxy
 * @Date: 2021-10-11 19:34:13
 * @LastEditors: Cxy
 * @LastEditTime: 2022-06-10 09:55:07
 * @FilePath: \ehomes-admind:\gitHubBlog\blogServe\build.js
 */
const path = require("path")
const CopyPlugin = require('copy-webpack-plugin')
const { ProgressPlugin } = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  // 入口配置的对象中，属性为输出的js文件名，属性值为入口文件
  entry: './index.js',
  // 输出文件目录
  output: {
    path: path.resolve(__dirname, 'blogserve'),
    filename: 'index.js',
  },
  mode: 'development', // 设置mode
  target: 'node',
  // 排除项目依赖，不进行打包，由运行时安装提供
  externals: externals(),
  plugins: [
    //附带项目描述文件，主要进行依赖安装
    new CopyPlugin({
      patterns: [
        {
          from: 'package.json',
          to: './'
        }
      ]
    }),
    new CleanWebpackPlugin(),
    new ProgressPlugin({
      activeModules: true,         // 默认false，显示活动模块计数和一个活动模块正在进行消息。
      entries: true,  			       // 默认true，显示正在进行的条目计数消息。
      modules: false,              // 默认true，显示正在进行的模块计数消息。
      modulesCount: 5000,          // 默认5000，开始时的最小模块数。PS:modules启用属性时生效。
      profile: false,         	   // 默认false，告诉ProgressPlugin为进度步骤收集配置文件数据。
      dependencies: false,         // 默认true，显示正在进行的依赖项计数消息。
      dependenciesCount: 10000    // 默认10000，开始时的最小依赖项计数。PS:dependencies启用属性时生效。
    })
  ]
}

function externals() {
  let manifest = require('./package.json');
  let dependencies = manifest.dependencies;
  let externals = {};
  for (let p in dependencies) {
    externals[p] = 'commonjs ' + p;
  }
  return externals;
}