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

  // 配置事件通知响应变量(Pomelo本身)
  pomelo.ioErrorHandler = ()=>{};
  pomelo.closeHandler = ()=>{};
  pomelo.disconnectHandler = ()=>{};
  pomelo.onKickHandler = ()=>{};
  pomelo.errorHandler = ()=>{};
  pomelo.heartbeatTimeoutHandler = ()=>{};
  pomelo.reconnectHandler = ()=>{};

  // 配置事件通知响应变量(自定义)
  // 用户进入行程房间
  // 用户离开行程房间
  // 求救
  

  // 配置通知事件
  pomelo.on('io-error', function(test){
    console.log('io-error', test);
    pomelo.ioErrorHandler();
  });

  pomelo.on('close', function(test){
    console.log('close', test);
    pomelo.closeHandler();
  });

  pomelo.on('disconnect', function(test){
    console.log('disconnect', test, pomelo);
    pomelo.isReady = false;
    pomelo.disconnectHandler();
  });

  pomelo.on('onKick', function(test){
    console.log('onKick', test);
    pomelo.onKickHandler();
  });

  pomelo.on('error', function(test){
    console.log('error', test);
    pomelo.errorHandler();
  });

  pomelo.on('heartbeat timeout', function(test){
    console.log('heartbeat timeout', test);
    pomelo.heartbeatTimeoutHandler();
  });

  pomelo.on('reconnect', function(test){
    console.log('reconnect', test);
    pomelo.reconnectHandler();
  });

  // 初始化
  pomelo.init({
    host: 'jerrysir.com/',
    port: 3010
  }, function() {
      console.log('pomelo init success.');
      pomelo.isReady = true;
      callback(null);
  });

}

// 已登录用户恢复登录态
export function entry (loginToken, callback) {}

// 微信小程序登录
export function loginByWeapp (code, nickName, avatarUrl, callback) {}

// 创建行程
export function createTrip (callback) {}

// 结束行程
export function endTrip (callback) {}

// 查询未完成的行程订单
export function queryUnfinished (callback) {}

// 进入行程房间
export function entryTripRoom (callback) {}

// 离开行程房间
export function leaveTripRoom (callback) {}

// 更新行程位置
export function uploadLocation (callback) {}

// 行程发出求救
export function tripSOS (callback) {}

// 获取行程信息
export function getTripInfo (callback) {}

// 获取行程房间内的用户信息
export function getUserInfoInTripRoom (callback) {}

// 关注(人)
export function follow (callback) {}

// 取消关注(人)
export function unfollow (callback) {}
