
import Taro from '@tarojs/taro'

var host = 'http://localhost:8080/v1'

var Get = function (path, param, isNeedLoginToken, callback) {
    const loginToken = Taro.getStorageSync('LOGIN_TOKEN');
    Taro.request({
        url: host + path,
        data: param,
        header: isNeedLoginToken ? { 'auth-token': loginToken } : {}
      })
        .then(res => callback(res.data))
}

exports.Get = Get;