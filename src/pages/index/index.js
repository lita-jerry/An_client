import Taro, { Component } from '@tarojs/taro'
import { View, Button, CoverView, CoverImage } from '@tarojs/components'
import { AtButton, AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd, login } from '../../actions/counter'

import pomelo from 'pomelo-weixin-client'

import './index.scss'

import follow_icon from './images/follow.png'
import my_icon from './images/my.png'
import trip_icon from './images/trip.png'

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
    navigationBarTitleText: '平安到家'
  }

  state = {
    mapScale : '14',
    longitude: "113.324520",
    latitude: "23.099994",
    isLoginModalShow: false
  }

  componentDidMount() {
    this.autoLogin()
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () { 
    this.mapCtx = wx.createMapContext('map')
    this.showLocation()
  }

  // 地图放大
  mapScale_enlargement() {
    var scale = Number(this.state.mapScale)
    console.log(scale)
    if (scale < 20) {
      this.setState({mapScale:(scale + 1) + ""})
    }
  }
  // 地图缩小
  mapScale_reduction() {
    var scale = Number(this.state.mapScale)
    console.log(scale)
    if (scale > 5) {
      this.setState({mapScale:(scale - 1) + ""})
    }
  }
  // 地图上显示当前位置
  showLocation() {
    var self = this
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function(res) {
        var _latitude = res.latitude
        var _longitude = res.longitude
        console.log(_latitude, _longitude)
        self.setState({
          longitude:_longitude + "", 
          latitude:_latitude + "",
          mapScale:"18"
        })
        self.mapCtx.moveToLocation()
      }
    })
  }

  // 关闭当前页面，跳转到应用内的某个页面
  redirectTo(url) {
    Taro.redirectTo({url:url})
  }

  // 自动登录
  autoLogin() {
    // 检查本地是否有LoginToken
    const loginToken = Taro.getStorageSync('LOGIN_TOKEN');
    // Taro.setStorageSync('key', 'value');

    // 有的话Entry
    var self = this
    Taro.showLoading({ mask: true });
    Taro.login({
      success: function(loginRes) {
        console.log(loginRes.code)
        if (loginRes.code) {
          pomelo.init({
            host: 'jerrysir.com/',
            port: 3010
          }, function() {
              console.log('success');
              pomelo.request("connector.entryHandler.loginByOtherPlatform", {code: loginRes.code, nickName: '这个是小程序里面的昵称', avatarURL: '这个是小程序里面的头像url'}, function(data) {
                console.log(data);
              });
          });
        }
      }
    });
  }

  // 检查未完成行程订单
  checkUnfinishedTripOrder() {
    Taro.showLoading({
      mask: true
    })
    // 获取Pomelo实例
    // 
  }

  // 创建行程订单
  createTripOrder() {
    if (this.props.counter.userState.isLogin) {
      Taro.showLoading({ title: '创建行程', mask: true });
    }
    // 查询是否有未完成行程
    // 如果没有则创建行程
    // 跳转到行程房主页面
  }

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
      // e.detail.userInfo.nickName, e.detail.userInfo.avatarUrl
      // Taro.hideLoading()
      //   Taro.showToast({
      //     title: '登录成功',
      //     icon: 'success',
      //     duration: 2000
      //   });
    }
  }

  componentDidHide () { }

  render () {
    return (
      <View className='index'>

        <Map className="map"
             longitude={this.state.longitude} latitude={this.state.latitude}
             scale={this.state.mapScale}
             show-location>

          <CoverView class='map-zoom-bg'>
            <Button className='map-zoom-enlargement' onClick={this.mapScale_enlargement.bind(this)} hoverClass='none'>+</Button>
            <Button className='map-zoom-reduction' onClick={this.mapScale_reduction.bind(this)} hoverClass='none'>-</Button>
          </CoverView>
          
          <CoverView class='map-tool-bar-bg'>

            <CoverView class='map-tool-box-bg'>

              <CoverView className='map-tool-left-box'>
                <CoverImage src={follow_icon} class='map-tool-box-image' />
                <CoverView class='map-tool-box-text'>我的关注</CoverView>
                {
                  !this.props.counter.userState.isLogin 
                  && <Button className='map-tool-left-box-unlogin' openType="getUserInfo" lang="zh_CN" onGetUserInfo={this.onGotUserInfo.bind(this)} type='primary' ></Button>
                }
              </CoverView>
              
              <CoverView className='map-tool-right-box'>
                <CoverImage src={my_icon} class='map-tool-box-image' />
                <CoverView class='map-tool-box-text'>我的</CoverView>
                {
                  !this.props.counter.userState.isLogin 
                  && <Button className='map-tool-right-box-unlogin' openType="getUserInfo" lang="zh_CN" onGetUserInfo={this.onGotUserInfo.bind(this)} type='primary' ></Button>
                }
              </CoverView>
              
            </CoverView>

            <CoverView class='start-bg' >
              <CoverImage className='start-icon' src={trip_icon} onClick={this.createTripOrder} />
              {
                !this.props.counter.userState.isLogin 
                && <Button className='start-icon-unlogin' openType="getUserInfo" lang="zh_CN" onGetUserInfo={this.onGotUserInfo.bind(this)} type='primary' ></Button>
              }
            </CoverView>

          </CoverView>

          <CoverView className='map-show-location-bg'>
            <Button className='map-show-location-btn' onClick={this.showLocation.bind(this)} hoverClass='none'>⊙</Button>
          </CoverView>

        </Map>

      </View>
    )
  }
}

export default Index
