'use strict'

const fs = require('fs')
const utf = require('to-utf-8')
const concatStream = require('concat-stream')

exports.getFileSrc = function getFileSrc(file, cb) {
  fs.createReadStream(file)
    .on('error', cb)
    .pipe(utf())
    .on('error', cb)
    .pipe(concatStream(x => cb(null, x)))
}

