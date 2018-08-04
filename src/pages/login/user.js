import Taro from '@tarojs/taro'

/**
 * 用户注册,注册成功后自动执行登录流程,回调中err为空即表示注册并已经登陆成功
 * @param {String} nickName 用户昵称
 * @param {String} avatarURL 用户头像URL
 * @param {(err: String)} callback 执行回调
 */
export function login(nickName, avatarURL, callback) {
    wx.login({
        success: function(res) {
          if (res.code) {
            //发起网络请求
            wx.request({
              url: 'https://jerrysir.com/v1/u/wxmp/regist',
              data: {
                code: res.code,
                nickname: nickName,
                avatarurl: avatarURL
              }
            })
          } else {
            console.log('登录失败！' + res.errMsg)
            if (callback) { callback('登录失败!' + res.errMsg) }
          }
        }
    });
}