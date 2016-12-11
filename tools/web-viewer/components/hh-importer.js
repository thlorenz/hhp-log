'use strict'

/** @jsx h */
const { h, Component } = require('preact')

const hhp = require('hhp')
const MultiFileInput = require('./multi-file-input')

class HandHistoryImporter extends Component {
  constructor({ log, showSummary }) {
    super()
    this.setState(Object.assign({}, this.state, { importing: false }))
    this._log = log
      .on('error', console.error)
      .on('added', x => this._onadded())
      .on('skipped', x => this._onadded())
      .on('tracked', x => this._updateTracking(x))
      .on('initializing', () => this._oninitializing())
      .on('initialized', () => this._oninitialized())
    if (showSummary) this._updateSummary()
  }

  render() {
    const { importing, status, summary } = this.state
    const { ondestroy } = this.props
    return (
      <div style='border: solid 1px silver; border-radius: 5px; padding: 5px;'>
        <h2>Importer</h2>
        <MultiFileInput
          disabled={importing}
          onfileSelected={() => this._onfilesSelected()}
          onfilesRead={x => this._onfilesRead(x)} />
        <span>{status}</span>
        <input
          type='button'
          onclick={ondestroy}
          value='Clear All' />
        <div>{summary}</div>
      </div>
    )
  }

  _oninitializing() {
    console.time('initialize')
  }

  _oninitialized() {
    console.timeEnd('initialize')
  }

  _onfilesSelected() {
    this.setState(Object.assign({}, this.state, { status: 'parsing', importing: true }))
  }

  _onfilesRead(result) {
    const hands = []
    for (let src of result.values()) {
      hhp.extractHands(src).forEach(x => hands.push(x))
    }
    const parsed = hands
      .map(x => this._tryParse(x))
      .filter(x => x != null)

    this._onparsedHands(parsed)
  }

  _onparsedHands(hands) {
    console.time('insert')
    this._addingTotal = hands.length
    this._addedSoFar = -1
    this._onadded()
    this._log.addHands(hands, err => {
      if (err) return console.error(err)
      this._onprocessed()
    })
  }

  _onprocessed() {
    console.timeEnd('insert')
    this.setState(Object.assign({}, this.state, { importing: false }))
  }

  _updateSummary() {
    this._log.summary((err, x) => {
      const s = err
        ? `Error ${err.message}`
        : `Total ${x.total} hands in database, newest is from ${x.newest}`
      this.setState(Object.assign({}, this.state, { summary: s }))
    })
  }

  _updateTracking(x) {
    const msg = `Analyzed: ${x}`
    this.setState(Object.assign({}, this.state, { summary: msg }))
  }

  _tryParse(hand) {
    try {
      return hhp(hand)
    } catch (err) {
      console.trace()
      console.error(err)
      return null
    }
  }

  _ondbDestroyed(err) {
    if (err) return console.error(err)
    console.log('db destroyed')
  }

  _onadded() {
    this._addedSoFar++
    const msg = `${this._addedSoFar}/${this._addingTotal}`
    this.setState(Object.assign({}, this.state, { status: msg }))
  }
}

module.exports = HandHistoryImporter
