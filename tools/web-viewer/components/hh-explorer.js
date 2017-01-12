/** @jsx h */
const { h, Component } = require('preact')
const hha = require('hha')
const { PokerHands } = require('hha-pokerhand')

function emptyString() {
  return ''
}

class HandHistoryExplorer extends Component {
  constructor({ log, limit = 50, injectHeader = emptyString, injectFooter = emptyString }) {
    super()
    this._log = log
    this._limit = limit
    this._injectHeader = injectHeader
    this._injectFooter = injectFooter
    this.setState(Object.assign({}, this.state, { hands: [] }))
    this._keys = []
    this._next()
  }

  _next() {
    this._updateHands(false)
  }

  _previous() {
    this._updateHands(true)
  }

  _updateHands(previous) {
    if (previous) {
      this._log.range(
          { gte: this._keys.pop(), limit: this._limit }
        , this._onrange.bind(this)
      )
    } else {
      this._keys.push(this._firstKey)
      this._log.range(
          { gt: this._lastKey, limit: this._limit }
        , this._onrange.bind(this)
      )
    }
  }

  _onrange(err, res) {
    if (err) return console.error(err)
    this._firstKey = res.firstKey
    this._lastKey = res.lastKey

    this._displayHands(res.hands)
  }

  _displayHands(hs) {
    const hands = hs
      .map(x => this._safeMap(x))
      .filter(x => x != null)
    this.setState(Object.assign({}, this.state, { hands }))
  }

  _safeMap(x) {
    try {
      return hha(x)
    } catch (e) {
      console.error(e)
      return null
    }
  }

  _onhandSelected(hand) {
    const { onhandSelected } = this.props
    if (typeof onhandSelected === 'function') onhandSelected(hand)
  }

  _toPokerHands(hands) {
    if (!hands || ! hands.length) {
      return (<div>Please hit next or import some hands</div>)
    }
    return (
      <PokerHands
        hands={hands}
        onhandSelected={this._onhandSelected.bind(this)}
        injectHeader={this._injectHeader.bind(this)}
        injectFooter={this._injectFooter.bind(this)}
      />
    )
  }

  render() {
    const { hands } = this.state
    return (
      <div style='border: solid 1px silver; border-radius: 5px;'>
        <input type='button' onclick={this._previous.bind(this)} value='previous' />
        <input type='button' onclick={this._next.bind(this)} value='next' />
        <span>{this._index} [{this._firstKey} - {this._lastKey}]</span>
        {this._toPokerHands(hands)}
        <input type='button' onclick={this._previous.bind(this)} value='previous' />
        <input type='button' onclick={this._next.bind(this)} value='next' />
      </div>
    )
  }
}

module.exports = HandHistoryExplorer
