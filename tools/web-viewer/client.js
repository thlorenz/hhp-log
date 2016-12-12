'use strict'

/** @jsx h */
const { h, render } = require('preact')
require('preact/devtools')

const hyper = false
const showSummary = false

const HyperLog = require('../../stores/hyperlog')
const LevelUp = require('../../stores/levelup')

const fruitdown = require('fruitdown')
const opts = {
    leveldown: fruitdown
  , location: 'pokertell:parsed'
  , encoding: require('../../default-encoding')
}
const store = hyper ? new HyperLog(opts) : new LevelUp(opts)
const log = require('../../')({ log: store })
const HandHistoryImporter = require('./components/hh-importer')
const HandHistoryExplorer = require('./components/hh-explorer')

const handProcessor = require('./hand-processor')

render(
  <div>
    <HandHistoryImporter
      ondestroy={destroyDatabase}
      log={log}
      showSummary={showSummary} />
    <HandHistoryExplorer log={log} onhandSelected={onhandSelected} />
  </div>
, document.body
)

function destroyDatabase() {
  store.destroy(err => {
    if (err) return console.error(err)
    console.log('db destroyed')
  })
}

function onhandSelected(hand) {
  handProcessor(hand)
}
