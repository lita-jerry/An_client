// 全局变量 pomelo实例

const globalData_pomelo = null

export function set (key, val) {
  globalData[key] = val
}

export function get (key) {
  return globalData[key]
}

export function get (callback) {
  if (!globalData_pomelo) {
    globalData_pomelo.init({
      host: 'jerrysir.com/',
      port: 3010
    }, function() {
        console.log('pomelo init success.');
        callback(null, globalData_pomelo);
    });
  }
}