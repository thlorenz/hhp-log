const EventEmitter = require('events').EventEmitter
const from2 = require('from2')

const VERSION = 1
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
    log.get(keys[i++], {}, cb)
  }
  return from2.obj(onobj)
}

// TODO: need to somehow keep indexes:
//  - tourney#
//  - game#
//  - date+time (for ranges)
// Not sure if to store in separate log or just keep in memory and up to date, so
// consumer can store the index however they please.
//
class ParsedHandsLog extends EventEmitter {
  constructor({ log } = {}) {
    super()

    this._log = log
    this._log.on('add', n => this.emit('add', n))
    this._hands = new Set()
    this._initialized = false
  }

  addHands(hands, done) {
    const self = this
    // add them one after the other
    let errored = false
    let tasks = hands.length
    if (!tasks) return done()
    let i = 0

    function onadded(err) {
      if (errored) return
      if (err) {
        errored = true
        return done(err)
      }
      if (++i === tasks) return done()
      self.addHand(hands[i], onadded)
    }

    this.addHand(hands[i], onadded)
  }

  addHand(hand, done) {
    if (this._initialized) return setTimeout(() => this._append(hand, done), 0)
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
        , {}
        , err => { this._onadded(err, hand); done(err) }
      )
    } else {
      this.emit('skipped', hand)
      done()
    }
  }

  tail({ live, encoding, keys } = {}) {
    if (live && keys) {
      throw new Error('Cannot tail when keys are supplied')
    }
    return keys
      ? keyStream({ log: this._log, keys })
      : this._log.createReadStream({ live, encoding })
  }

  range(opts, cb) {
    return this._log.range(opts, cb)
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

  getHand(h) {
    return this._log.getHand(h)
  }

  _summary() {
    return {
        hands: this._hands
      , newest: this._newest
      , total: this._hands.size
    }
  }

  _init(cb) {
    this.emit('initializing')

    // Called the first time a hand is added to avoid adding duplicates.
    // tail through all entries in the db and do the following
    //  - record the newest entry time
    //  - create a set of ids of hands contained
    this.tail()
      .on('data', x => this._trackHand(this._log.getHand(x).info))
      .on('error', cb)
      .on('end', x => {
        this._initialized = true
        this.emit('initialized')
        cb()
      })
  }

  _trackHand(info) {
    const timestamp = getTimeStamp(info)
    if (this._newest == null || timestamp > this._newest) this._newest = timestamp
    this._hands.add(entryId(info))
    this.emit('tracked', this._hands.size)
  }

  _onadded(err, hand) {
    if (err) {
      this._hands.delete(entryId(hand.info))
      return this.emit('error', err)
    }
    this.emit('added', hand)
  }
}

module.exports = function parsedHandsLog(opts) {
  return new ParsedHandsLog(opts)
}
