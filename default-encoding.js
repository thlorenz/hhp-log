const protobuf = require('protocol-buffers')
const money = require('money-encoder')

module.exports = protobuf(
    require('./schemas/hhp.proto')
  , { encodings: { money } }
).entry
