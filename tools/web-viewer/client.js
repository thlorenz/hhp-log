'use strict'

/** @jsx h */
const { h, render } = require('preact')
require('preact/devtools')

const hyper = false
const showSummary = true

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
// const HandHistoryExplorer = require('./components/hh-explorer') <HandHistoryExplorer log={log} />

render(
  <div>
    <HandHistoryImporter
      ondestroy={destroyDatabase}
      log={log}
      showSummary={showSummary} />
  </div>
, document.body
)

function destroyDatabase() {
  store.destroy(err => {
    if (err) return console.error(err)
    console.log('db destroyed')
  })
}
