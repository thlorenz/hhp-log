'use strict'

/** @jsx h */
const { h, render } = require('preact')
require('preact/devtools')

const fruitdown = require('fruitdown')
const levelup = require('levelup')
const db = levelup('pokertell:parsed', { db: fruitdown })
const log = require('../../')(db)
const HandHistoryImporter = require('./components/hh-importer')
const HandHistoryExplorer = require('./components/hh-explorer')

render(
  <div>
    <HandHistoryImporter
      ondestroy={destroyDatabase}
      log={log}
      showSummary={true} />
  </div>
, document.body
)

// <HandHistoryExplorer log={log} />
function destroyDatabase() {
  fruitdown.destroy(db.db, err => {
    if (err) return console.error(err)
    console.log('db destroyed')
  })
}
