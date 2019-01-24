
import Taro from '@tarojs/taro'

var host = 'https://an.jerrysir.com/api/v1'

var Get = function (path, param, isNeedLoginToken, callback) {
    const loginToken = Taro.getStorageSync('LOGIN_TOKEN');
    Taro.request({
        url: host + path,
        data: param,
        header: isNeedLoginToken ? { 'auth-token': loginToken } : {}
      })
        .then(res => {
            if (res.data.code === 200) {
                callback(res.data)
            }
        })
}

exports.Get = Get;