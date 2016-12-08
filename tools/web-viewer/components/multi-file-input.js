'use strict'

/** @jsx h */
const { h, Component } = require('preact')

function noop() {}

class MultiFileInput extends Component {
  constructor() {
    super()
    this._readFiles = new Map()
    this.setState({ reading: false })
  }

  render() {
    const { reading } = this.state
    return (
      <input
        type='file'
        name='filefield'
        multiple
        disabled={reading}
        onchange={this._onfilesSelected.bind(this)} />
    )
  }

  _onfilesSelected(e) {
    this.setState({ reading: true })
    this._readFiles = new Map()

    const { onfilesSelected = noop } = this.props
    const files = e.target.files
    onfilesSelected(files)
    this._files = files
    this._tasks = this._files.length
    for (var i = 0; i < this._files.length; i++) {
      const file = this._files[i]
      const fileReader = new window.FileReader()
      fileReader.readAsText(file)
      fileReader.onload = e => this._onloadedFile(file, e.target.result)
    }
  }

  _onloadedFile(file, src) {
    const { onfilesRead = noop } = this.props
    this._readFiles.set(file.name, src)
    this._tasks--
    if (!this._tasks) {
      onfilesRead(this._readFiles)
      this.setState({ reading: false })
    }
  }

}

module.exports = MultiFileInput
