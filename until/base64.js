/*
 * @Descripttion: 
 * @Author: Cxy
 * @Date: 2022-06-02 09:50:56
 * @LastEditors: Cxy
 * @LastEditTime: 2022-06-02 10:10:30
 * @FilePath: \ehomes-admind:\blog\blogServe\until\base64.js
 */
// base64转码
const base64Encryption = (value) => {
  const nameBuffer = Buffer.from(value);
  return nameBuffer.toString("base64");
}

// base64翻译
const base64Decrypt = (value) => {
  const decodeBuffer = Buffer.from(value, "base64");
  return decodeBuffer.toString("utf-8");
}

module.exports = {
  base64Encryption,
  base64Decrypt
}