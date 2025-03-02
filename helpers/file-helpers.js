const fs = require('fs')
const imgur = require('imgur')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
imgur.setClientId(IMGUR_CLIENT_ID)

const { resolve } = require('path')

const localFileHandler = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)

    const fileName = `upload/${file.originalname}`
    return fs.promises
      .readFile(file.path)
      .then((data) => fs.promises.writeFile(fileName, data))
      .then(() => resolve(`/${fileName}`))
      .catch((error) => reject(error))
  })
}

const imgurFileHandler = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)

    return imgur
      .uploadFile(file.path)
      .then((img) => {
        console.log(img)
        // check if Object img exists?
        // Yes >> take out property link
        resolve(img?.link || null)
      })
      .catch((error) => reject(error))
  })
}

module.exports = {
  localFileHandler,
  imgurFileHandler,
}
