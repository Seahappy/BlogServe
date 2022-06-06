/*
 * @Descripttion: 
 * @Author: Cxy
 * @Date: 2022-06-02 09:46:01
 * @LastEditors: Cxy
 * @LastEditTime: 2022-06-02 12:06:25
 * @FilePath: \ehomes-admind:\blog\blogServe\until\des.js
 */
const { base64Encryption, base64Decrypt } = require('./base64')
const crypto = require("crypto");
const key = 'seahappy0501./-+'

// DES 加密
const desEncryption = (value) => {
  const cipher = crypto.createCipheriv("aes128", key, key);
  let crypted = cipher.update(value, "utf8", "base64");
  crypted += cipher.final("base64");
  return base64Encryption(crypted);
};

// DES 解密
const desDecrypt = (value) => {
  const cipher = crypto.createDecipheriv("aes128", key, key);
  let decrypted = cipher.update(base64Decrypt(value), "base64", "utf8");
  decrypted += cipher.final("utf8");
  return decrypted;
};

module.exports = {
  desEncryption,
  desDecrypt
}