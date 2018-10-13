
/**
 * Pomelo初始化
 * 
 * @param {pomelo} pomelo pomelo实例
 * @param {Function} callback err
 */
var init = function (pomelo, callback) {

  if (!pomelo) { callback('pomelo is null'); return; }

  pomelo.init({
    host: 'an.jerrysir.com',
    port: 3010
  }, function() {
    console.log('pomelo is init success.');
    callback();
  });
}

/**
 * 微信小程序登录
 * 
 * @param {pomelo} pomelo pomelo实例
 * @param {String} code 小程序登录code
 * @param {String} nickName 昵称
 * @param {String} avatarUrl 头像url
 * @param {Function} callback err, token
 */
var loginByWeapp = function (pomelo, code, nickName, avatarUrl, callback) {

  if (!pomelo) { callback('pomelo is null'); return; }

  pomelo.request("user.userHandler.loginByWeapp", {code: code, nickName: nickName, avatarURL: avatarUrl}, function(result) {
    console.log('user.userHandler.loginByWeapp', {code: code, nickName: nickName, avatarUrl: avatarUrl}, result);
    if (result.code !== 200) {
      callback('服务器错误');
    } else if (!!result.error) {
      callback(result.msg);
    } else {
      callback(null, result.data.token);
    }
  });
}

/**
 * 校验登录Token
 * 
 * @param {pomelo} pomelo pomelo实例
 * @param {String} loginToken 登录token
 * @param {Function} callback err
 */
var checkLoginToken = function (pomelo, loginToken, callback) {

  if (!pomelo) { callback('pomelo is null'); return; }

  pomelo.request("user.userHandler.checkLoginToken", {token: loginToken}, function(result) {
    console.log("user.userHandler.checkLoginToken", {token: loginToken}, result);
    if (result.code !== 200) {
      callback('服务器错误');
    } else if (!!result.error) {
      callback(result.msg);
    } else {
      callback();
    }
  });
}

/**
 * 创建行程
 * 
 * @param {pomelo} pomelo pomelo实例
 * @param {String} loginToken 登录token
 * @param {Function} callback err, ordernumber
 */
var create = function (pomelo, loginToken, callback) {

  if (!pomelo) { callback('pomelo is null'); return; }

  pomelo.request("trip.tripHandler.create", {token: loginToken}, function(result) {
    console.log("trip.tripHandler.create", {token: loginToken}, result);
    if (result.code !== 200) {
      callback('服务器错误');
    } else if (!!result.error) {
      callback(result.msg);
    } else {
      callback(null, result.data.ordernumber);
    }
  });
}

/**
 * 结束行程
 * 
 * @param {pomelo} pomelo pomelo实例
 * @param {Function} callback err
 */
var end = function (pomelo, callback) {

  if (!pomelo) { callback('pomelo is null'); return; }

  pomelo.request("trip.tripHandler.end", {}, function(result) {
    console.log("trip.tripHandler.end", {}, result);
    if (result.code !== 200) {
      callback('服务器错误');
    } else if (!!result.error) {
      callback(result.msg);
    } else {
      callback();
    }
  });
}

/**
 * 查询未完成的行程
 * 
 * @param {pomelo} pomelo pomelo实例
 * @param {String} loginToken 登录token
 * @param {Function} callback err, ordernumber
 */
var queryUnfinished = function (pomelo, loginToken, callback) {

  if (!pomelo) { callback('pomelo is null'); return; }

  pomelo.request("trip.tripHandler.queryUnfinished", {token: loginToken}, function(result) {
    console.log("trip.tripHandler.queryUnfinished", {token: loginToken}, result);
    if (result.code !== 200) {
      callback('服务器错误');
    } else if (!!result.error) {
      callback(result.msg);
    } else {
      callback(null, result.data.ordernumber);
    }
  });
}

/**
 * 进入行程房间(房主模式)
 * 
 * @param {pomelo} pomelo pomelo实例
 * @param {String} loginToken 登录token
 * @param {String} ordernumber 行程订单号
 * @param {Function} callback err
 */
var entryTrippingRoom = function (pomelo, loginToken, ordernumber, callback) {

  if (!pomelo) { callback('pomelo is null'); return; }

  pomelo.request("connector.entryHandler.entryTrippingRoom", {token: loginToken, ordernumber: ordernumber}, function(result) {
    console.log("connector.entryHandler.entryTrippingRoom", {token: loginToken, ordernumber: ordernumber}, result);
    if (result.code !== 200) {
      callback('服务器错误');
    } else if (!!result.error) {
      callback(result.msg);
    } else {
      callback();
    }
  });
}

/**
 * 进入行程房间(观察者模式)
 * 
 * @param {pomelo} pomelo pomelo实例
 * @param {String} loginToken 登录token
 * @param {String} ordernumber 行程订单号
 * @param {Function} callback err
 */
var entryWatchingRoom = function (pomelo, loginToken, ordernumber, callback) {

  if (!pomelo) { callback('pomelo is null'); return; }

  pomelo.request("connector.entryHandler.entryWatchingRoom", {token: loginToken, ordernumber: ordernumber}, function(result) {
    console.log("connector.entryHandler.entryWatchingRoom", {token: loginToken, ordernumber: ordernumber}, result);
    if (result.code !== 200) {
      callback('服务器错误');
    } else if (!!result.error) {
      callback(result.msg);
    } else {
      callback();
    }
  });
}

/**
 * 上传当前位置(进入Tripping房间后才可调用该方法)
 * 
 * @param {pomelo} pomelo pomelo实例
 * @param {String} longitude 经度
 * @param {String} latitude 纬度
 * @param {Function} callback err
 */
var uploadLocation = function (pomelo, longitude, latitude, callback) {

  if (!pomelo) { callback('pomelo is null'); return; }

  pomelo.request("trip.tripHandler.uploadLocation", {longitude: longitude, latitude: latitude}, function(result) {
    console.log("trip.tripHandler.uploadLocation", {longitude: longitude, latitude: latitude}, result);
    if (result.code !== 200) {
      callback('服务器错误');
    } else if (!!result.error) {
      callback(result.msg);
    } else {
      callback();
    }
  });
}

/**
 * 发出求救(进入Tripping房间后才可调用该方法)
 * 
 * @param {pomelo} pomelo pomelo实例
 * @param {Function} callback err
 */
var tripSOS = function (pomelo, callback) {

  if (!pomelo) { callback('pomelo is null'); return; }

  pomelo.request("trip.tripHandler.tripSOS", {}, function(result) {
    console.log("trip.tripHandler.tripSOS", {}, result);
    if (result.code !== 200) {
      callback('服务器错误');
    } else if (!!result.error) {
      callback(result.msg);
    } else {
      callback();
    }
  });
}

/**
 * 获取行程信息
 * 
 * @param {pomelo} pomelo pomelo实例
 * @param {String} loginToken 登录token
 * @param {String} ordernumber 行程订单号
 * @param {Function} callback err, info
 */
var getInfo = function (pomelo, loginToken, ordernumber, callback) {

  if (!pomelo) { callback('pomelo is null'); return; }

  pomelo.request("trip.tripHandler.getInfo", {token: loginToken, ordernumber: ordernumber}, function(result) {
    console.log("trip.tripHandler.getInfo", {token: loginToken, ordernumber: ordernumber}, result);
    if (result.code !== 200) {
      callback('服务器错误');
    } else if (!!result.error) {
      callback(result.msg);
    } else {
      callback(null, result.data);
    }
  });
}

/**
 * 获取行程房间内的所有的用户信息(进入Trip房间后才可调用该方法)
 * 
 * @param {pomelo} pomelo pomelo实例
 * @param {Function} callback err, users
 */
var getUserInfoInTripRoom = function (pomelo, callback) {

  if (!pomelo) { callback('pomelo is null'); return; }

  pomelo.request("trip.tripHandler.getUserInfoInTripRoom", {}, function(result) {
    console.log("trip.tripHandler.getUserInfoInTripRoom", {}, result);
    if (result.code !== 200) {
      callback('服务器错误');
    } else if (!!result.error) {
      callback(result.msg);
    } else {
      callback(null, result.data);
    }
  });
}

/**
 * 关注用户
 * 
 * @param {pomelo} pomelo pomelo实例
 * @param {String} loginToken 登录Token
 * @param {String} followid 关注的用户id
 * @param {Function} callback err
 */
var follow = function (pomelo, loginToken, followid, callback) {

  if (!pomelo) { callback('pomelo is null'); return; }

  pomelo.request("user.userHandler.follow", {token: loginToken, followid: followid}, function(result) {
    console.log("user.userHandler.follow", {token: loginToken, followid: followid}, result);
    if (result.code !== 200) {
      callback('服务器错误');
    } else if (!!result.error) {
      callback(result.msg);
    } else {
      callback();
    }
  });
}

/**
 * 取消关注用户
 * 
 * @param {pomelo} pomelo pomelo实例
 * @param {String} loginToken 登录Token
 * @param {String} followid 取消关注的用户id
 * @param {Function} callback err
 */
var unfollow = function (pomelo, loginToken, followid, callback) {

  if (!pomelo) { callback('pomelo is null'); return; }

  pomelo.request("user.userHandler.unfollow", {token: loginToken, followid: followid}, function(result) {
    console.log("user.userHandler.unfollow", {token: loginToken, followid: followid}, result);
    if (result.code !== 200) {
      callback('服务器错误');
    } else if (!!result.error) {
      callback(result.msg);
    } else {
      callback();
    }
  });
}

/**
 * 获取行程路线
 * 
 * @param {pomelo} pomelo pomelo实例
 * @param {String} loginToken 登录Token
 * @param {String} ordernumber 行程订单号
 * @param {Function} callback err, polyline
 */
var getPolyline = function (pomelo, loginToken, ordernumber, callback) {

  if (!pomelo) { callback('pomelo is null'); return; }

  _getPolyline(pomelo, loginToken, ordernumber, 0, [], callback);
}

// 用于分页获取路线的函数
var _getPolyline = function (pomelo, loginToken, ordernumber, page, polyline, callback) {
  pomelo.request("trip.tripHandler.getPolyline", {token: loginToken, ordernumber: ordernumber, page: page}, function(result) {
    console.log('trip.tripHandler.getPolyline', {token: loginToken, ordernumber: ordernumber, page: page}, result);
    if (result.code !== 200) {
      callback('服务器错误');
    } else if (!!result.error) {
      callback(result.msg);
    } else {
      var newPolyline = polyline.concat(result.data);
      if (result.data.length > 0) {
        _getPolyline(pomelo, loginToken, ordernumber, page + 1, newPolyline, callback);
      } else {
        callback(null, newPolyline);
      }
    }
  });
}

/**
 * 获取单个用户的关注状态
 * 
 * @param {pomelo} pomelo pomelo实例
 * @param {String} loginToken 登录Token
 * @param {String} followid 关注的用户id
 * @param {Function} callback err, isFollow
 */
var getFollowState = function (pomelo, loginToken, followid, callback) {
  if (!pomelo) { callback('pomelo is null'); return; }

  pomelo.request("user.userHandler.getFollowState", {token: loginToken, followid: followid}, function(result) {
    console.log("user.userHandler.getFollowState", {token: loginToken, followid: followid}, result);
    if (result.code !== 200) {
      callback('服务器错误');
    } else if (!!result.error) {
      callback(result.msg);
    } else {
      callback(null, result.data.isFollow);
    }
  });
}

exports.init                  = init;
exports.loginByWeapp          = loginByWeapp;
exports.checkLoginToken       = checkLoginToken;
exports.create                = create;
exports.end                   = end;
exports.queryUnfinished       = queryUnfinished;
exports.entryTrippingRoom     = entryTrippingRoom;
exports.entryWatchingRoom     = entryWatchingRoom;
exports.uploadLocation        = uploadLocation;
exports.tripSOS               = tripSOS;
exports.getInfo               = getInfo;
exports.getUserInfoInTripRoom = getUserInfoInTripRoom;
exports.follow                = follow;
exports.unfollow              = unfollow;
exports.getPolyline           = getPolyline;
exports.getFollowState        = getFollowState;