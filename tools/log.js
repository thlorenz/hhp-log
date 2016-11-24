'use strict'

const level = require('level')
const hhplog = require('../')
const path = require('path')
const dbPath = path.join(__dirname, '..', 'tmp', 'log-db')
const db = level(dbPath)
const log = hhplog(db)

module.exports = log
