import {ipcRenderer, remote} from 'electron';

let plugins;

export function getConfig() {
  if (!plugins) {
    plugins = remote.require('./plugins');
  }
  return plugins.getDecoratedConfig();
}

export function subscribe(fn) {
  ipcRenderer.on('config change', fn);
  ipcRenderer.on('plugins change', fn);
  return () => {
    ipcRenderer.removeListener('config change', fn);
  };
}
