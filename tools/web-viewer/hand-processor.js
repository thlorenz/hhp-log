/** @jsx h */
const { h } = require('preact')
const script = require('hha').script
const analyzeSequences = require('hhar/lib/analyze-sequences')

function actionsToString(acc, a, idx) {
  if (idx) acc += ' '
  if (typeof a.ratio === 'number') {
    acc += a.code + ':' + a.ratio
  } else {
    acc += a.code
  }
  if (typeof a.potRatio === 'number') acc += ':' + a.potRatio
  if (typeof a.raise  === 'number') acc += ' (' + a.raise + 'x)'
  acc += ' | '
  return acc
}

function condenseAction(x) {
  const o = { type: x.type }
  if (x.ratio != null) o.ratio = x.ratio
  if (x.amount != null) o.amount = x.amount
  o.pot = x.pot
  o.potAfter = x.potAfter
  o.bet = x.bet
  return o
}

exports = module.exports = function handProcessor(hand, street, ispreflop, info) {
  const handScript = script(hand)

  const input = {
      players: handScript.players
    , actions: handScript.actions[street]
    , ispreflop
    , info
  }

  const codes = analyzeSequences(input)
  const hash = {}
  for (let [ player, arr ] of codes) {
    const summary = arr.reduce(actionsToString, '')
    hash[player] = { arr, summary }
  }
  const actions = input.actions.map(x => {
    const p = handScript.players[x.playerIndex]
    const ret = {
        $player: p.name
      , action: condenseAction(x.action)
      , playerIndex: x.playerIndex
    }
    if (ispreflop) {
      if (p.sb) ret.sb = p.sb
      if (p.bb) ret.bb = p.bb
    }
    return ret
  })
  return { actions, analyzed: hash }
}

exports.renderProcessed = function renderAnalyzed({ info, analyzed }) {
  const rows = Object.keys(analyzed).map(k => (
    <tr>
      <td>{k}</td>
      <td style='padding: 1px 0 1px 20px;'>{analyzed[k].summary}</td>
    </tr>)
  )

  return (
    <table>
      {rows}
    </table>
  )
}
