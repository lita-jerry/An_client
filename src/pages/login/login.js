import Taro, { Component } from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd, login } from '../../actions/counter'

import './index.scss'

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
  login (token, nickName, avatarURL) {
    dispatch(login(token, nickName, avatarURL))
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
   componentDidShow () { }
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
                self.props.login('token', 'nickName', 'avatarURL')
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

   render () {
    return (
      <View className='index'>
        <Button className='add_btn' onClick={this.props.add}>+</Button>
        <Button className='dec_btn' onClick={this.props.dec}>-</Button>
        <Button className='dec_btn' onClick={this.props.asyncAdd}>async</Button>
        <View>{this.props.counter.num}</View>
        <View>Hello, World</View>
      </View>
    )
  }
}
export default Index