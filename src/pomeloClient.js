// PomeloClient

import pomelo from 'pomelo-weixin-client'

export function init (callback) {

  if (pomelo.isReady) {
    callback(null);
    return;
  }

  // 配置状态变量
  pomelo.isReady = false;
  pomelo.isLogin = false;

  // 配置事件通知响应变量
  pomelo.ioErrorHandler = ()=>{};
  pomelo.closeHandler = ()=>{};
  pomelo.disconnectHandler = ()=>{};
  pomelo.onKick = ()=>{};
  pomelo.error = ()=>{};
  pomelo.heartbeatTimeoutHandler = ()=>{};
  pomelo.reconnectHandler = ()=>{};

  // 初始化
  _init(callback);

}

function _init (callback) {
  pomelo.init({
    host: 'jerrysir.com/',
    port: 3010
  }, function() {
      console.log('pomelo init success.');
      callback(null);
  });

  // io-error
  // close
  // disconnect
  // onKick
  // error
  // heartbeat timeout
  // reconnect

  pomelo.on('io-error', function(test){
    console.log('io-error', test);
  });

  pomelo.on('close', function(test){
    console.log('close', test);
  });

  pomelo.on('disconnect', function(test){
    console.log('disconnect', test, pomelo);
    setTimeout(() => {
      pomelo.init({
        host: 'jerrysir.com/',
        port: 3010
      }, function() {
          console.log('after disconnect action reinit success', pomelo);
      });
    }, 1000);
  });

  pomelo.on('onKick', function(test){
    console.log('onKick', test);
  });

  pomelo.on('error', function(test){
    console.log('error', test);
  });

  pomelo.on('heartbeat timeout', function(test){
    console.log('heartbeat timeout', test);
  });

  pomelo.on('reconnect', function(test){
    console.log('reconnect', test);
  });
}