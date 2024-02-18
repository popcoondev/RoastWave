const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'myAPI', {
    doSomething: () => ipcRenderer.send('do-something')
  }
);