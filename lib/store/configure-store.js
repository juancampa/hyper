// TODO: We're not configuring the store for the snapshot for now because
// requering these files have side-effects related to window globals
module.exports = () => {
  if (process.env.NODE_ENV === 'production') {
    return require('./configure-store.prod.js').default();
  }

  let store = require('./configure-store.dev.js').default();
  store.zzz = 'zzz';
  return store;
};
