const EventEmitter = require('events').EventEmitter
const from2 = require('from2')

const VERSION = 1
function inspect(obj, depth) {
  console.log(require('util').inspect(obj, false, depth || 5, true))
}

function keyStream({ log, keys }) {
  var i = 0
  function onobj(size, cb) {
    if (i === keys.length) return cb(null, null)
    log.get(keys[i++], {}, cb)
  }
  return from2.obj(onobj)
}

class ParsedHandsLog extends EventEmitter {
  constructor({ log } = {}) {
    super()
    this._log = log
  }

  getKey(val) {
    return this._log.getKey(val)
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
    this._append(hand, done)
  }

  get(id, cb) {
    return this._log.get(id, {}, cb)
  }

  _handExists(hand, cb) {
    const key = this._log.getKey(hand)
    function onhand(err, v) {
      if (!err) return cb(null, true)
      if (err.notFound) return cb(null, false)
      cb(err)
    }
    this.get(key, onhand)
  }

  _append(hand, done) {
    this._handExists(hand, (err, res) => {
      if (err) return done(err)
      if (!res) {
        this._log.append(
            Object.assign({}, hand, { version: VERSION })
          , {}
          , err => { this._onadded(err, hand); done(err) }
        )
      } else {
        this.emit('skipped', hand)
        done()
      }
    })
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

  getHand(h, cb) {
    return this._log.getHand(h, cb)
  }

  _onadded(err, hand) {
    if (err) return this.emit('error', err)
    this.emit('added', hand)
  }
}

module.exports = function parsedHandsLog(opts) {
  return new ParsedHandsLog(opts)
}
