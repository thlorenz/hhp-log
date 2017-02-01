'use strict'

const hyper = !!process.env.HYPER
const leveldown = require('leveldown')
const hhplog = require('../')
const path = require('path')
const dbPath = path.join(__dirname, '..', 'tmp', 'log-db-levelonly')

const location = dbPath
const encoding = 'json' // require('../default-encoding')

const HyperLog = require('../stores/hyperlog')
const LevelUp = require('../stores/levelup')

const log = hyper
  ? new HyperLog({ location, leveldown, encoding })
  : new LevelUp({ location, leveldown, encoding })

module.exports = hhplog({ log })
