const HyperLog = require('./stores/hyperlog')
const LevelUp = require('./stores/levelup')
const fruitdown = require('fruitdown')
const defaultEncoding = require('./default-encoding')

module.exports = function browserLog({ location, encoding = defaultEncoding, hyper }) {
  const opts = {
      leveldown: fruitdown
    , location
    , encoding
  }
  const store = hyper ? new HyperLog(opts) : new LevelUp(opts)
  return require('./hhp-log')({ log: store })
}
