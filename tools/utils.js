'use strict'

const fs = require('fs')
const path = require('path')
const utf = require('to-utf-8')
const concatStream = require('concat-stream')

exports.getFileSrc = function getFileSrc(file, cb) {
  fs.createReadStream(file)
    .on('error', cb)
    .pipe(utf())
    .on('error', cb)
    .pipe(concatStream(x => cb(null, x)))
}

exports.save = function save(name, obj) {
  const file = path.join(__dirname, '..', 'tmp', 'scripts', name + '.json')
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8')
  console.log('saved to ' + file)
}
