const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const electronLink = require('electron-link')

const baseDirPath = process.cwd();
const snapshotScriptPath = path.join(baseDirPath, 'linked.js');

function shouldExclude({requiringModulePath, requiredModulePath}) {
  const requiringModuleRelativePath = path.relative(baseDirPath, requiringModulePath)
  const requiredModuleRelativePath = path.relative(baseDirPath, requiredModulePath)
  console.log('Adding:', requiredModuleRelativePath);

  return (
    requiredModuleRelativePath.endsWith(path.join('node_modules', 'electron', 'index.js')) ||
    requiredModuleRelativePath === 'cjs/react.development.js' ||
    requiredModuleRelativePath === 'cjs/react.production.min.js' ||
    requiredModuleRelativePath === 'factoryWithTypeCheckers' ||
    requiredModuleRelativePath === 'factoryWithThrowingShims' ||
    requiredModuleRelativePath === 'cjs/react-dom.development.js' ||
    requiredModuleRelativePath === 'cjs/react-dom.production.min.js' ||
    requiredModuleRelativePath === 'configure-store.dev.js' ||
    requiredModuleRelativePath === 'configure-store.prod.js' ||
    false
  )
}

async function run() {
  const { snapshotScript } = await electronLink({
    baseDirPath,
    mainPath: path.join(process.cwd(), 'app/renderer/bundle.js'),
    cachePath: path.join(os.tmpdir(), 'hyper-electron-link'),
    shouldExcludeModule: (modulePath) => {
      return shouldExclude(modulePath)
    }
  })

  fs.writeFileSync(snapshotScriptPath, snapshotScript)

  console.log('Verifying that we\'ll be able to use this in `mksnapshot`');
  vm.runInNewContext(snapshotScript, undefined, {filename: snapshotScriptPath, displayErrors: true})
}

run()
  .then(() => {
    console.log('SUCCESS');
  })
  .catch((e) => {
    console.log('FAILURE');
    console.error(e);
  });
