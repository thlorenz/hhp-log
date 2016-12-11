# hhp-log [![build status](https://secure.travis-ci.org/thlorenz/hhp-log.png)](http://travis-ci.org/thlorenz/hhp-log)

Stores Poker hands parsed with hhp in an append-only log or just into levelup in protobuffer format (schema provided) or
any format you like.

Ensures that no hand is added twice.

## Server Side using HyperLog Store backed by LevelDown

```js
const hhplog = require('hhp-log')
const path = require('path')

const leveldown = require('leveldown')
const location = path.join(__dirname, '..', 'tmp', 'log-db')
const encoding = require('hhp-log/default-encoding')

const HyperLog = require('hhp-log/stores/hyperlog')
const store = new HyperLog({ location, leveldown, encoding })
const pokerLog = hhplog({ log: store })
```

## Client Side using LevelUp Store backed by FruitDown

```js
const hhplog = require('hhp-log')
const LevelUp = require('hhp-log/stores/levelup')
const fruitdown = require('fruitdown')
const opts = {
    leveldown: fruitdown
  , location: 'pokerhands:parsed'
  , encoding: require('hhp-log/default-encoding')
}
const store = new LevelUp(opts)
const pokerLog = hhplog({ log: store })
```

## Status

Working (manually checked via ./tools), but needs tests.

## Installation

    npm install hhp-log

## API

TODO for now see the examples and look through the `./tools`

## License

MIT
