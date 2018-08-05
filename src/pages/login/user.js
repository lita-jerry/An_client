import Taro from '@tarojs/taro'

import { connect } from '@tarojs/redux'

import { login, logout } from '../../actions/counter'

// @connect(({ counter }) => ({
//   counter
// }), (dispatch) => ({
//   add () {
//     dispatch(add())
//   },
//   dec () {
//     dispatch(minus())
//   },
//   asyncAdd () {
//     dispatch(asyncAdd())
//   },
//   login (token, nickName, avatarURL) {
//     dispatch(login(token, nickName, avatarURL))
//   }
// }))

/**
 * 用户注册,注册成功后自动执行登录流程,回调中err为空即表示注册并已经登陆成功
 * @param {String} nickName 用户昵称
 * @param {String} avatarURL 用户头像URL
 * @param {(err: String)} callback 执行回调
 */
export function regist(nickName, avatarURL, callback) {
    wx.login({
        success: function(res) {
          if (res.code) {
            //发起网络请求
            Taro.request({
              url: 'https://jerrysir.com/v1/u/wxmp/regist',
              data: {
                code: res.code,
                nickname: nickName,
                avatarurl: avatarURL
              }
            })
            .then(res => {
              console.log(res.data)
              if (res.data.code === 0) {
                // 更改用户状态
                // this.props.asyncAdd()
                // dispatch(login(res.data.session, nickName, avatarURL))
                // dispatch(add())
                if (callback) { callback() }
              } else {
                if (callback) { callback('登录失败!' + res.data.msg) }
              }
            })
          } else {
            console.log('登录失败！' + res.errMsg)
            if (callback) { callback('登录失败!' + res.errMsg) }
          }
        }
    });
}