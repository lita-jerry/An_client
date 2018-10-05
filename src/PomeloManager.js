// Pomelo 扩展

import pomelo from 'pomelo-weixin-client'
import async  from 'async'

// const PemeloGlobalVariable = pomelo;

// export function get () {
//   return PemeloGlobalVariable;
// }

export function init (callback) {

  if (pomelo.isReady) {
    callback(null);
    return;
  }

  // 配置状态变量
  pomelo.isReady = false;
  pomelo.isLogin = false;
  pomelo.isInTripRoom = false;

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

/**
 * 已登录用户恢复登录态
 * 
 * @param {String} loginToken 登录token
 * @param {Function}} callback err
 */
pomelo.entry = function entry (loginToken, callback) {
  var self = this;
  async.waterfall([
    function(_cb) {
      if (pomelo.isReady) { _cb(); } else { self.init(_cb); }
    },
    function(_cb) {
      pomelo.request("connector.entryHandler.entry", {token: loginToken}, function(_data) {
        console.log('connector.entryHandler.entry', loginToken, _data);
        if (_data['code'] !== 200) {
          _cb('服务器错误');
        } else if (!!_data['error']) {
          _cb(_data['msg']);
        } else {
          _cb();
        }
      });
    }],
    function(_err) {
      if (!_err) {
        pomelo.isLogin = true;
      }
      callback(_err);
  });
}

/**
 * 微信小程序登录
 * 
 * @param {String} code 小程序登录code
 * @param {String} nickName 昵称
 * @param {String} avatarUrl 头像url
 * @param {Function} callback err, token
 */
pomelo.loginByWeapp =  function loginByWeapp (code, nickName, avatarUrl, callback) {
  var self = this;
  async.waterfall([
    function(_cb) {
      if (pomelo.isReady) { _cb(); } else { self.init(_cb); }
    },
    function(_cb) {
      pomelo.request("connector.entryHandler.loginByOtherPlatform", {code: code, nickName: nickName, avatarURL: avatarUrl}, function(_data) {
        console.log('connector.entryHandler.loginByOtherPlatform', code, nickName, avatarUrl, _data);
        if (_data['code'] !== 200) {
          _cb('服务器错误');
        } else if (!!_data['error']) {
          _cb(_data['msg']);
        } else {
          _cb(null, _data['data']['token']);
        }
      });
    }],
    function(_err, _token) {
      if (!_err) {
        pomelo.isLogin = true;
      }
      callback(_err, _token);
  });
}

/**
 * 创建行程
 * 
 * @param {Function} callback err, ordernumber
 */
pomelo.createTrip =  function createTrip (callback) {
  var self = this;
  async.waterfall([
    function(_cb) {
      if (pomelo.isReady) { _cb(); } else { self.init(_cb); }
    },
    function(_cb) {
      // 其实想自动登录,但是无法判断用户的登录方式(自动登录或授权登录)
      if (pomelo.isLogin) { _cb(); } else { _cb('未登录'); }
    },
    function(_cb) {
      pomelo.request("trip.tripHandler.create", {}, function(_data) {
        console.log('trip.tripHandler.create', _data);
        if (_data['code'] !== 200) {
          _cb('服务器错误');
        } else if (!!_data['error']) {
          _cb(_data['msg']);
        } else {
          var _orderNumber = _data['data']['ordernumber'];
          _cb(null, _orderNumber);
        }
      });
    }],
    function(_err, _orderNumber) {
      callback(_err, _orderNumber);
  });
}

/**
 * 结束行程
 * 
 * @param {Function} callback err
 */
pomelo.endTrip =  function endTrip (callback) {
  var self = this;
  async.waterfall([
    function(_cb) {
      if (pomelo.isReady) { _cb(); } else { self.init(_cb); }
    },
    function(_cb) {
      // 其实想自动登录,但是无法判断用户的登录方式(自动登录或授权登录)
      if (pomelo.isLogin) { _cb(); } else { _cb('未登录'); }
    },
    function(_cb) {
      if (pomelo.isInTripRoom) { _cb(); } else { _cb('未在行程房间内'); }
    },
    function(_cb) {
      pomelo.request("connector.entryHandler.entryTripRoom", {}, function(_data) {
        console.log('connector.entryHandler.entryTripRoom', _data);
        if (_data['code'] !== 200) {
          _cb('服务器错误');
        } else if (!!_data['error']) {
          _cb(_data['msg']);
        } else {
          _cb(null);
        }
      });
    }],
    function(_err) {
      if (!_err) {
        pomelo.isInTripRoom = false;
      }
      callback(_err);
  });
}

/**
 * 获取未完成的行程订单
 * 
 * @param {Function} callback err, ordernumber
 */
pomelo.queryUnfinished =  function queryUnfinished (callback) {
  var self = this;
  async.waterfall([
    function(_cb) {
      if (pomelo.isReady) { _cb(); } else { self.init(_cb); }
    },
    function(_cb) {
      // 其实想自动登录,但是无法判断用户的登录方式(自动登录或授权登录)
      if (pomelo.isLogin) { _cb(); } else { _cb('未登录'); }
    },
    function(_cb) {
      pomelo.request("trip.tripHandler.queryUnfinished", {}, function(_data) {
        console.log('trip.tripHandler.queryUnfinished', _data);
        if (_data['code'] !== 200) {
          _cb('服务器错误');
        } else if (!!_data['error']) {
          _cb(_data['msg']);
        } else {
          _cb(null, _data['data']['ordernumber']);
        }
      });
    }],
    function(_err, _orderNumber) {
      callback(_err, _orderNumber);
  });
}

// 进入行程房间
pomelo.entryTripRoom =  function entryTripRoom (ordernumber, callback) {
  var self = this;
  async.waterfall([
    function(_cb) {
      if (pomelo.isReady) { _cb(); } else { self.init(_cb); }
    },
    function(_cb) {
      // 其实想自动登录,但是无法判断用户的登录方式(自动登录或授权登录)
      if (pomelo.isLogin) { _cb(); } else { _cb('未登录'); }
    },
    function(_cb) {
      pomelo.request("connector.entryHandler.entryTripRoom", {ordernumber: ordernumber}, function(_data) {
        console.log('connector.entryHandler.entryTripRoom', ordernumber, _data);
        if (_data['code'] !== 200) {
          _cb('服务器错误');
        } else if (!!_data['error']) {
          _cb(_data['msg']);
        } else {
          _cb();
        }
      });
    }],
    function(_err) {
      if (!_err) {
        pomelo.isInTripRoom = true;
      }
      callback(_err);
  });
}

// 离开行程房间
pomelo.leaveTripRoom =  function leaveTripRoom (callback) {
  var self = this;
  async.waterfall([
    function(_cb) {
      if (pomelo.isReady) { _cb(); } else { self.init(_cb); }
    },
    function(_cb) {
      // 其实想自动登录,但是无法判断用户的登录方式(自动登录或授权登录)
      if (pomelo.isLogin) { _cb(); } else { _cb('未登录'); }
    },
    function(_cb) {
      pomelo.request("connector.entryHandler.leaveTripRoom", {}, function(_data) {
        console.log('connector.entryHandler.leaveTripRoom', _data);
        if (_data['code'] !== 200) {
          _cb('服务器错误');
        } else if (!!_data['error']) {
          _cb(_data['msg']);
        } else {
          _cb();
        }
      });
    }],
    function(_err) {
      if (!_err) {
        pomelo.isInTripRoom = false;
      }
      callback(_err);
  });
}

// 更新行程位置
pomelo.uploadLocation =  function uploadLocation (longitude, latitude, callback) {
  var self = this;
  async.waterfall([
    function(_cb) {
      if (pomelo.isReady) { _cb(); } else { self.init(_cb); }
    },
    function(_cb) {
      // 其实想自动登录,但是无法判断用户的登录方式(自动登录或授权登录)
      if (pomelo.isLogin) { _cb(); } else { _cb('未登录'); }
    },
    function(_cb) {
      if (pomelo.isInTripRoom) { _cb(); } else { _cb('未在行程房间内'); }
    },
    function(_cb) {
      pomelo.request("trip.tripHandler.uploadLocation", {longitude: longitude, latitude: latitude}, function(_data) {
        console.log('trip.tripHandler.uploadLocation', longitude, latitude, _data);
        if (_data['code'] !== 200) {
          _cb('服务器错误');
        } else if (!!_data['error']) {
          _cb(_data['msg']);
        } else {
          _cb();
        }
      });
    }],
    function(_err) {
      callback(_err);
  });
}

// 行程发出求救
pomelo.tripSOS =  function tripSOS (callback) {
  var self = this;
  async.waterfall([
    function(_cb) {
      if (pomelo.isReady) { _cb(); } else { self.init(_cb); }
    },
    function(_cb) {
      // 其实想自动登录,但是无法判断用户的登录方式(自动登录或授权登录)
      if (pomelo.isLogin) { _cb(); } else { _cb('未登录'); }
    },
    function(_cb) {
      if (pomelo.isInTripRoom) { _cb(); } else { _cb('未在行程房间内'); }
    },
    function(_cb) {
      pomelo.request("trip.tripHandler.SOS", {}, function(_data) {
        console.log('trip.tripHandler.SOS', _data);
        if (_data['code'] !== 200) {
          _cb('服务器错误');
        } else if (!!_data['error']) {
          _cb(_data['msg']);
        } else {
          _cb();
        }
      });
    }],
    function(_err) {
      callback(_err);
  });
}

/**
 * 获取行程信息
 * 
 * @param {Function} callback err, info{uid, nickName, avatar, tripState, createdTime, lastUpdatedTime, polyline, logs}
 */
pomelo.getTripInfo =  function getTripInfo (ordernumber, callback) {
  var self = this;
  async.waterfall([
    function(_cb) {
      if (pomelo.isReady) { _cb(); } else { self.init(_cb); }
    },
    function(_cb) {
      // 其实想自动登录,但是无法判断用户的登录方式(自动登录或授权登录)
      if (pomelo.isLogin) { _cb(); } else { _cb('未登录'); }
    },
    // function(_cb) {
    //   if (pomelo.isInTripRoom) { _cb(); } else { _cb('未在行程房间内'); }
    // },
    function(_cb) {
      console.log('getTripInfo1')
      pomelo.request("trip.tripHandler.getInfo", {ordernumber: ordernumber}, function(_data) {
        console.log('trip.tripHandler.getInfo', _data);
        if (_data['code'] !== 200) {
          _cb('服务器错误');
        } else if (!!_data['error']) {
          _cb(_data['msg']);
        } else {
          _cb(null, _data['data']);
        }
      });
    }],
    function(_err, _info) {
      console.log('getTripInfo2')
      callback(_err, _info);
  });
}

/**
 * 获取行程房间内的用户信息
 * 
 * @param {Function} callback err, users[{nickName, avatar}]
 */
pomelo.getUserInfoInTripRoom =  function getUserInfoInTripRoom (callback) {
  var self = this;
  async.waterfall([
    function(_cb) {
      if (pomelo.isReady) { _cb(); } else { self.init(_cb); }
    },
    function(_cb) {
      // 其实想自动登录,但是无法判断用户的登录方式(自动登录或授权登录)
      if (pomelo.isLogin) { _cb(); } else { _cb('未登录'); }
    },
    function(_cb) {
      if (pomelo.isInTripRoom) { _cb(); } else { _cb('未在行程房间内'); }
    },
    function(_cb) {
      pomelo.request("trip.tripHandler.getUserInfoInTripRoom", {}, function(_data) {
        console.log('trip.tripHandler.getUserInfoInTripRoom', _data);
        if (_data['code'] !== 200) {
          _cb('服务器错误');
        } else if (!!_data['error']) {
          _cb(_data['msg']);
        } else {
          _cb(null, _data['data']);
        }
      });
    }],
    function(_err, _users) {
      callback(_err, _users);
  });
}

// 关注(人)
pomelo.follow =  function follow (callback) {
  var self = this;
  async.waterfall([
    function(_cb) {
      if (pomelo.isReady) { _cb(); } else { self.init(_cb); }
    },
    function(_cb) {
      // 其实想自动登录,但是无法判断用户的登录方式(自动登录或授权登录)
      if (pomelo.isLogin) { _cb(); } else { _cb('未登录'); }
    },
    function(_cb) {
      pomelo.request("trip.tripHandler.follow", {}, function(_data) {
        console.log('trip.tripHandler.follow', _data);
        if (_data['code'] !== 200) {
          _cb('服务器错误');
        } else if (!!_data['error']) {
          _cb(_data['msg']);
        } else {
          _cb();
        }
      });
    }],
    function(_err) {
      callback(_err);
  });
}

// 取消关注(人)
pomelo.unfollow =  function unfollow (callback) {
  var self = this;
  async.waterfall([
    function(_cb) {
      if (pomelo.isReady) { _cb(); } else { self.init(_cb); }
    },
    function(_cb) {
      // 其实想自动登录,但是无法判断用户的登录方式(自动登录或授权登录)
      if (pomelo.isLogin) { _cb(); } else { _cb('未登录'); }
    },
    function(_cb) {
      pomelo.request("trip.tripHandler.unfollow", {}, function(_data) {
        console.log('trip.tripHandler.unfollow', _data);
        if (_data['code'] !== 200) {
          _cb('服务器错误');
        } else if (!!_data['error']) {
          _cb(_data['msg']);
        } else {
          _cb();
        }
      });
    }],
    function(_err) {
      callback(_err);
  });
}

pomelo.reInit = (callback) => {
  init(callback);
}

console.log('引入外部类执行')
init(()=>{});