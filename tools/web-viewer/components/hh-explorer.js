'use strict'

/** @jsx h */
const { h, Component } = require('preact')
const hha = require('hha')
const { PokerHands } = require('hha-pokerhand')

class HandHistoryExplorer extends Component {
  constructor({ log }) {
    super()
    this._log = log
    this.setState(Object.assign({}, this.state, { hands: [] }))
    this._log.tail()
      .on('data', x => this._addHand(x))
  }

  _addHand(h) {
    try {
      const hand = hha(h.value)
      this.setState(Object.assign({}, this.state, { hands: this.state.hands.concat(hand) }))
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    const { hands } = this.state
    return (
      <div style='border: solid 1px silver; border-radius: 5px;'>
        { hands && hands.length ? <PokerHands hands={hands} /> : '' }
      </div>
    )
  }
}

module.exports = HandHistoryExplorer
