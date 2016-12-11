const EventEmitter = require('events').EventEmitter
const levelup = require('levelup')
const assert = require('assert')

function getKey(value) {
  const info = value.info
  return info.room + ':' + info.handid
}

class LevelUp extends EventEmitter {
  constructor({ location, leveldown, encoding }) {
    super()

    assert.equal(typeof leveldown, 'function', 'need to specify leveldown function')
    assert.equal(typeof location, 'string', 'need to specify location string')

    this._location = location
    this._leveldown = leveldown
    this._db = levelup(location, { db: leveldown, valueEncoding: encoding })
  }

  append(value, opts, cb) {
    this._db.put(getKey(value), value, opts, cb)
  }

  createReadStream({ live, since, encoding } = {}) {
    // TODO: https://github.com/dominictarr/level-live-stream
    if (live) throw new Error('live stream not supported ATM')
    return this._db.createValueStream({ gte: since, valueEncoding: encoding })
  }

  get(key, { encoding } = {}, cb) {
    return this._db.get(key, { valueEncoding: encoding }, cb)
  }

  getHand(data) {
    return data
  }

  destroy(cb) {
    this._leveldown.destroy(this._location, cb)
  }
}

module.exports = LevelUp
