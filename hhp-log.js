'use strict'

const EventEmitter = require('events').EventEmitter
const hyperlog = require('hyperlog')
const fs = require('fs')
const path = require('path')
const protobuf = require('protocol-buffers')
const money = require('money-encoder')
const from2 = require('from2')

const VERSION = 1
const messages = protobuf(
    fs.readFileSync(path.join(__dirname, 'schemas', 'hhp.proto'))
  , { encodings: { money } }
)

function inspect(obj, depth) {
  console.log(require('util').inspect(obj, false, depth || 5, true))
}

function entryId(info) {
  return info.room + ':' + info.gameno + ':' + info.handid
}

function getTimeStamp(info) {
  return new Date(info.year, info.month - 1, info.day, info.hour, info.min, info.sec)
}

function keyStream({ log, keys }) {
  var i = 0
  function onobj(size, cb) {
    if (i === keys.length) return cb(null, null)
    log.get(keys[i++], cb)
  }
  return from2.obj(onobj)
}

class ParsedHandsLog extends EventEmitter {
  constructor(db) {
    super()
    this._log = hyperlog(db, { valueEncoding: messages.entry })
    this._log.on('add', n => this.emit('add', n))
    this._hands = new Set()
  }

  addHands(hands, done) {
    let tasks = hands.length
    if (!tasks) return done()
    for (var i = 0; i < hands.length; i++) {
      this.addHand(hands[i], onadded)
    }

    function onadded() {
      if (!--tasks) done()
    }
  }

  addHand(hand, done) {
    if (this._initialized) return this._append(hand, done)
    this._init(err => {
      if (err) return done(err)
      this._append(hand, done)
    })
  }

  _append(hand, done) {
    // check if hand is newer than any of the ones added before
    // if it isn't ensure it hasn't been added yet
    if (getTimeStamp(hand.info) > this._newest || !this._hands.has(entryId(hand.info))) {
      // track hand synchronously to avoid race conditions, in case it can't be
      // added it is _untracked_ again @see _onadded
      this._trackHand(hand.info)
      this._log.append(
          Object.assign({}, hand, { version: VERSION })
        , null
        , err => { this._onadded(err, hand); done() }
      )
    } else {
      done()
    }
  }

  tail({ live, encoding, keys } = {}) {
    if (live && keys) {
      throw new Error('Cannot tail when keys are supplied')
    }
    return keys
      ? keyStream({ log: this._log, keys })
      : this._log
          .createReadStream({ live, valueEncoding: encoding })
  }

  dump() {
    this.tail()
      .on('error', console.error)
      .on('data', x => inspect(x))
  }

  summary(cb) {
    if (this._initialized) return cb(null, this._summary())
    this._init(err => {
      if (err) return cb(err)
      cb(null, this._summary())
    })
  }

  _summary() {
    return {
        hands: this._hands
      , newest: this._newest
      , total: this._hands.size
    }
  }

  _init(cb) {
    // Called the first time a hand is added to avoid adding duplicates.
    // tail through all entries in the db and do the following
    //  - record the newest entry time
    //  - create a set of ids of hands contained
    this.tail()
      .on('data', x => this._trackHand(x.value.info))
      .on('error', cb)
      .on('end', x => { this._initialized = true; cb() })
  }

  _trackHand(info) {
    const timestamp = getTimeStamp(info)
    if (this._newest == null || timestamp > this._newest) this._newest = timestamp
    this._hands.add(entryId(info))
  }

  _onadded(err, hand) {
    if (err) {
      this._hands.delete(entryId(hand.info))
      return this.emit('error', err)
    }
  }
}

module.exports = function parsedHandsLog(db) {
  return new ParsedHandsLog(db)
}
