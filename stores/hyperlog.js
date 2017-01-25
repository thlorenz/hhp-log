const EventEmitter = require('events').EventEmitter
const levelup = require('levelup')
const hyperlog = require('hyperlog')

const assert = require('assert')

// TODO: need to expose getKey like we do for LevelUp
class HyperLog extends EventEmitter {
  constructor({ location, leveldown, encoding }) {
    super()

    assert.equal(typeof leveldown, 'function', 'need to specify leveldown function')
    assert.equal(typeof location, 'string', 'need to specify location string')

    this._location = location
    this._leveldown = leveldown
    const db = levelup(location, { db: leveldown, createIfMissing: true })
    this._log = hyperlog(db, { valueEncoding: encoding })
    this._log.on('add', n => this.emit('add', n))
  }

  append(value, opts, cb) {
    this._log.append(value, opts, cb)
  }

  createReadStream({ live, since, encoding } = {}) {
    return this._log.createReadStream({ live, since, valueEncoding: encoding })
  }

  get(key, { encoding } = {}, cb) {
    return this._log.get(key, { valueEncoding: encoding }, cb)
  }

  getHand(data) {
    return data.value
  }

  destroy(cb) {
    this._leveldown.destroy(this._location, cb)
  }
}

module.exports = HyperLog
