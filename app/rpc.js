const {EventEmitter} = require('events');
const {ipcMain} = require('electron');
const uuid = require('uuid');

class Server extends EventEmitter {
  constructor(win) {
    super();
    this.win = win;
    this.ipcListener = this.ipcListener.bind(this);

    if (this.destroyed) {
      return;
    }

    const uid = uuid.v4();
    this.id = uid;

    ipcMain.on(uid, this.ipcListener);

    // we intentionally subscribe to `on` instead of `once`
    // to support reloading the window and re-initializing
    // the channel
    this.wc.on('did-finish-load', () => {
      this.wc.send('init', uid);
    });

    this.prefix = this.id;
    this.batch = Buffer.alloc(1024 * 1024 * 64);
    this.offset = 0;
  }

  get wc() {
    return this.win.webContents;
  }

  ipcListener(event, {ev, data}) {
    super.emit(ev, data);
  }

  flushBatch() {
    if (this.offset > 0) {
      const prefix = this.batch.toString('utf8', 0, 36);
      const block = 1024 * 1024;
      for (let start = 0; start < this.offset; start += block) {
        const data = (start > 0 ? prefix : '') +
          this.batch.toString('utf8', start, Math.min(this.offset, start + block));
        this.wc.send(this.id, {
          ch: this.ch,
          data,
        });
      }
      // this.wc.send(this.id, {
      //   ch: this.ch,
      //   data: this.batch.toString('utf8', 0, this.offset),
      // });
      this.offset = 0;
      this.batchSize = 0;
      this.batchStart = 0;
    }
  }


  emit(ch, data) {
    // this.wc.send(this.id, {ch, data });
    // return;
    if (typeof data !== 'string') {
      this.flushBatch();
      this.wc.send(this.id, {ch, data});
    } else {
      if (this.offset === 0) {
        this.ch = ch;
        setTimeout(() => this.flushBatch(), 16);

        this.batchStart = Date.now();
        this.batch.write(data, 0);
        this.offset = data.length;
      } else {
        const chunk = data.slice(36);
        this.batch.write(chunk, this.offset);
        this.offset += chunk.length;
      }
      this.batchSize += 1;
    }
  }

  destroy() {
    this.removeAllListeners();
    this.wc.removeAllListeners();
    if (this.id) {
      ipcMain.removeListener(this.id, this.ipcListener);
    } else {
      // mark for `genUid` in constructor
      this.destroyed = true;
    }
  }
}

module.exports = win => {
  return new Server(win);
};
