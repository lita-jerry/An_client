import Taro, { Component } from '@tarojs/taro'
import { View, Button, Image } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd, login } from '../../actions/counter'

import './index.scss'

import pomelo from 'pomelo-weixin-client'
import { timeout } from '_rxjs@5.5.12@rxjs/operator/timeout';

@connect(({ counter }) => ({
  counter
}), (dispatch) => ({
  add () {
    dispatch(add())
  },
  dec () {
    dispatch(minus())
  },
  asyncAdd () {
    dispatch(asyncAdd())
  },
  login (token) {
    dispatch(login(token))
  }
}))

class Index extends Component {

  config = {
    navigationBarTitleText: '用户登录'
  }

   componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }
   componentWillUnmount () { }
   componentDidShow () {
    console.log(pomelo);
    pomelo.init({
      host: 'jerrysir.com/',
      port: 3010
    }, function() {
        console.log('pomelo first init success, heartbeatId=', pomelo.heartbeatId);
        pomelo.isReady = true;
        pomelo.request("connector.entryHandler.loginByOtherPlatform", {code: 'loginRes.code', nickName: '这个是小程序里面的昵称', avatarURL: '这个是小程序里面的头像url'}, function(data) {
          console.log(data, pomelo.heartbeatId, pomelo);
        });
    });
    
   }
   componentDidHide () { }

   // 获取用户信息
  onGotUserInfo (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail)
      
    if (e.detail.userInfo) {
      Taro.showLoading({
        title: '登录中',
        mask: true
      })
      
      this.regist(e.detail.userInfo.nickName, e.detail.userInfo.avatarUrl, (err) => {
        Taro.hideLoading()
        Taro.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000
        })
        // Taro.navigateBack()
        Taro.reLaunch({
          url: '/pages/index/index'
        })
      })
    }
  }

  /**
   * 用户注册,注册成功后自动执行登录流程,回调中err为空即表示注册并已经登陆成功
   * @param {String} nickName 用户昵称
   * @param {String} avatarURL 用户头像URL
   * @param {(err: String)} callback 执行回调
   */
  regist (nickName, avatarURL, callback) {
    var self = this
    wx.login({
        success: function(loginRes) {
          if (loginRes.code) {
            //发起网络请求
            Taro.request({
              url: 'https://jerrysir.com/v1/u/wxmp/regist',
              data: {
                code: loginRes.code,
                nickname: nickName,
                avatarurl: avatarURL
              }
            })
            .then(requestRes => {
              console.log(requestRes.data)
              if (requestRes.data.code === 0) {
                // 更改用户状态
                self.props.login(requestRes.data.session)
                if (callback) { callback() }
              } else {
                if (callback) { callback('登录失败!' + requestRes.data.msg) }
              }
            })
          } else {
            console.log('登录失败！' + loginRes.errMsg)
            if (callback) { callback('登录失败!' + loginRes.errMsg) }
          }
        }
    });
  }

   render () {
    return (
      <View className='index'>
        <View style='text-align: center; margin-bottom:20px;'>
          <Image src='' style='margin-top: 30rpx; width: 580rpx; height: 208rpx; background-color:#296CFF;'></Image>
        </View>
        <View style='margin: 0 auto; width: 70%;'>
          {/* <Button id='start-btn' openType="getUserInfo" lang="zh_CN" onGetUserInfo={onGotUserInfo} type='primary' >微信用户快速登录</Button> */}
        </View>
      </View>
    )
  }
}
export default Index