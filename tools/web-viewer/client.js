'use strict'

/** @jsx h */
const { h, render } = require('preact')
require('preact/devtools')
const ocat = require('ocat')
const showSummary = false

const hyper = false
const location = 'pokertell:parsed'
const log = require('../../browser-log')({ location, hyper })

const HandHistoryImporter = require('./components/hh-importer')
const HandHistoryExplorer = require('./components/hh-explorer')

const handProcessor = require('./hand-processor')

render(
  <div>
    <HandHistoryImporter
      ondestroy={destroyDatabase}
      log={log}
      showSummary={showSummary} />
    <HandHistoryExplorer
      log={log}
      onhandSelected={onhandSelected}
      injectFooter={injectFooter}
    />
  </div>
, document.body
)

function destroyDatabase() {
  log._log.destroy(err => {
    if (err) return console.error(err)
    console.log('db destroyed')
  })
}

const street = 'flop'
function injectFooter(hand) {
  const processed = handProcessor(hand, street)
  return handProcessor.renderProcessed(processed)
}

function onhandSelected(hand) {
  const ispreflop = street === 'preflop'
  const info = ispreflop
    ? { bb: hand.info.bb, sb: hand.info.sb }
    : null

  const processed = handProcessor(hand, street, ispreflop, info)
  const analyzed = Object.keys(processed.analyzed)
    .reduce((acc, k) => {
      acc[k] = processed.analyzed[k].arr
      return acc
    }, {})

  const testObj = {
      handid: hand.info.handid
    , ispreflop
  }
  if (info != null) testObj.info = info
  testObj.actions = processed.actions
  testObj.analyzed = analyzed

  if (info != null) testObj.info = info
  const testInput = ocat._inspect(testObj, { color: false, depth: 10 })
  global.tt = testInput
  console.log(testInput)
}
