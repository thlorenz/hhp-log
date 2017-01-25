const EventEmitter = require('events').EventEmitter
const levelup = require('levelup')
const concatStream = require('concat-stream')
const assert = require('assert')

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
    this._db.put(this.getKey(value), value, opts, cb)
  }

  createReadStream({ live, since, encoding } = {}) {
    // TODO: https://github.com/dominictarr/level-live-stream
    if (live) throw new Error('live stream not supported ATM')
    return this._db.createReadStream({ gte: since, valueEncoding: encoding })
  }

  range({ gt, gte, limit, reverse }, cb) {
    this._db
      .createReadStream({ gt, gte, limit, reverse })
      .on('error', cb)
      .pipe(concatStream(ondone))

    function ondone(res) {
      const first = res[0]
      const last = res[res.length - 1]
      const values = res.map(x => x.value)
      cb(null, { firstKey: first.key, lastKey: last.key, hands: values })
    }
  }

  get(key, { encoding } = {}, cb) {
    return this._db.get(key, { valueEncoding: encoding }, cb)
  }

  getHand(data) {
    return (data && data.value) || data
  }

  destroy(cb) {
    this._leveldown.destroy(this._location, cb)
  }

  getKey(value) {
    const info = value.info
    return info.room + ':' + info.handid
  }
}

module.exports = LevelUp
