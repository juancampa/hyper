import RPC from './utils/rpc';

let _instance;

export default () => {
  if (!_instance) {
    _instance = new RPC();
  }
  return _instance;
}
