/*
 * @Descripttion: 
 * @Author: Cxy
 * @Date: 2021-10-11 19:34:13
 * @LastEditors: Cxy
 * @LastEditTime: 2021-12-21 20:05:42
 * @FilePath: \blog\blogserve\build.js
 */
const path = require("path")
const CopyPlugin = require('copy-webpack-plugin')
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
    new CleanWebpackPlugin()
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