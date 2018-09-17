// 全局变量 pomelo实例

import pomelo from 'pomelo-weixin-client'

export function get (callback) {
  if (pomelo.isReady) {
    callback(pomelo);
  } else {
    _init(function(){
      callback(pomelo);
    })
  }
}

function _init (callback) {
  pomelo.init({
    host: 'jerrysir.com/',
    port: 3010
  }, function() {
      console.log('pomelo init success.');
      callback();
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