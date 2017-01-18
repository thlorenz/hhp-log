const HyperLog = require('./stores/hyperlog')
const LevelUp = require('./stores/levelup')
const fruitdown = require('fruitdown')
const leveljs = require('level-js')
const defaultEncoding = require('./default-encoding')

module.exports = function browserLog({
    location
  , encoding = defaultEncoding
  , hyper
  , fruit
}) {
  const opts = {
      leveldown: fruit ? fruitdown : leveljs
    , location
    , encoding
  }
  const store = hyper ? new HyperLog(opts) : new LevelUp(opts)
  return require('./hhp-log')({ log: store })
}
