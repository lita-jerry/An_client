import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.scss'

import follow_icon from './images/follow.png'
import my_icon from './images/my.png'
import trip_icon from './images/trip.png'

import async from 'async'
import pomelo from 'pomelo-weixin-client'

/* 行程首页 */
export default class Index extends Component {

  config = {
    navigationBarTitleText: '平安到家'
  }

  state = {
    isLogin: false,
    mapScale : '14',
    longitude: "113.324520",
    latitude: "23.099994",
    isLoginModalShow: false,
    isFirst: true
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
    this.doAutoLogin();
  }

  componentDidHide () { }

  /*    自定义函数    */
  // 自动登录
  doAutoLogin () {
    // 检查本地是否有LoginToken
    Taro.setStorageSync('LOGIN_TOKEN', '85549348c3312fbc23a512d108f4dbde');
    const loginToken = Taro.getStorageSync('LOGIN_TOKEN');
    if (!loginToken) { return }

    var self = this;

    Taro.showLoading({ title: '自动登录...', mask: true });
    pomelo.entry(loginToken, function(err) {
      if (!!err) {
        pomelo.reInit(function() {
          Taro.reLaunch({url: '/pages/index/index'})
        })
      } else {
        Taro.hideLoading();
      }
    });
  }

  // 获取用户信息
  onGotUserInfo (e) {
    // 这里做成异步处理流
    if (e.detail.userInfo) {
      Taro.showLoading({ title: '登录中...', mask: true });
      var self = this;
      // e.detail.userInfo.nickName, e.detail.userInfo.avatarUrl
    }
  }

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
                  !pomelo.isLogin
                  && <Button className='map-tool-left-box-unlogin' openType="getUserInfo" lang="zh_CN" onGetUserInfo={this.onGotUserInfo.bind(this)} type='primary' ></Button>
                }
              </CoverView>
              
              <CoverView className='map-tool-right-box'>
                <CoverImage src={my_icon} class='map-tool-box-image' />
                <CoverView class='map-tool-box-text'>我的</CoverView>
                {
                  !pomelo.isLogin
                  && <Button className='map-tool-right-box-unlogin' openType="getUserInfo" lang="zh_CN" onGetUserInfo={this.onGotUserInfo.bind(this)} type='primary' ></Button>
                }
              </CoverView>
              
            </CoverView>

            <CoverView class='start-bg' >
              <CoverImage className='start-icon' src={trip_icon} onClick={this.createTripOrder} />
              {
                !this.state.isLogin
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

