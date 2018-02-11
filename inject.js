const path = require('path')
const Module = require('module')
const fs = require('fs')
const electron = require('electron')

const basePath = path.join(__dirname, '..', 'app.asar')

// fetch discord package.json
const pkg = require(path.join(basePath, 'package.json'))

// adjust electron root
electron.app.getAppPath = () => basePath

let splashPatched = false
let mainWindowPatched = false
let updaterPatched = false

// overwrite (and restore) the .js compiler
const oldLoader = Module._extensions['.js']
Module._extensions['.js'] = (mod, filename) => {
  let content = fs.readFileSync(filename, 'utf8')
  const fname = filename.toLowerCase()

  // splash screen patches
  if (
    fname.endsWith(`app_bootstrap${path.sep}splashscreen.js`) ||
    fname.endsWith('splashwindow.js')
  ) {
    splashPatched = true

    content = content
    
      // alias old var name
      .replace(
        'this._window = new _electron.BrowserWindow(windowConfig);',
        'const splashWindow = this._window = new _electron.BrowserWindow(windowConfig);'
      )
      // now add the real patch
      .replace(
        'new _electron.BrowserWindow(windowConfig);',
      `new _electron.BrowserWindow(Object.assign(windowConfig, { webPreferences: { preload: "${path
        .join(process.env.injDir, 'plugins', 'splash_stuff.js')
        .replace(/\\/g, '/')}" }, transparent: true }));`
        //splashWindow.webContents.openDevTools();`
      )
      
      .replace('background: #282b30;', 'background: #7b0000;')
      .replace('span.quote {\\n  margin-bottom: 10px;\\n  color: #fff;', 'span.quote {\\n  margin-bottom: 10px;\\n  color: #e17e17;')
    // main window patches
  } else if (
    fname.endsWith(`app${path.sep}mainscreen.js`) ||
    fname.endsWith(`app.asar${path.sep}index.js`)
  ) {
    mainWindowPatched = true

    content = content
      // preload our script
      .replace(
        'webPreferences: {',
        `webPreferences: { preload: "${path
          .join(process.env.injDir, 'dom_shit.js')
          .replace(/\\/g, '/')}",`
      )
  }

  if (splashPatched && mainWindowPatched && updaterPatched) {
    Module._extensions['.js'] = oldLoader
  }

  return mod._compile(content, filename)
}

Module._load(path.join(basePath, pkg.main), null, true)
